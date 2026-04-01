import type { Context, Hono } from "hono";
import type { Env, VibeOptions } from "./types";
import { loadingShell } from "./loading";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/responses";

/**
 * Detect whether the raw LLM output looks like HTML.
 */
function looksLikeHTML(text: string): boolean {
  const t = text.trimStart().toLowerCase();
  return (
    t.startsWith("<!doctype") ||
    t.startsWith("<html") ||
    t.startsWith("<head") ||
    t.startsWith("<body")
  );
}

/**
 * Extract the assistant text from an OpenRouter /v1/responses payload.
 * Mirrors the Python logic in vibe.py: try `output_text` first, then walk
 * `output[]` items looking for type="message" → content type="output_text".
 */
function extractOutputText(data: Record<string, unknown>): string {
  // Fast path
  if (typeof data.output_text === "string" && data.output_text) {
    return data.output_text;
  }

  // Walk the output array
  const output = data.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (item?.type !== "message") continue;
      const content = item.content;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (part?.type === "output_text" && typeof part.text === "string") {
          return part.text;
        }
      }
    }
  }

  console.warn(
    "[vibe] Could not extract output_text. Raw response:",
    JSON.stringify(data).slice(0, 2000),
  );
  return "";
}

/**
 * Stream text chunks from OpenRouter using Server-Sent Events (SSE).
 * Yields each text delta as it arrives so the caller can flush it to the
 * browser immediately.
 */
async function* streamLLM(
  env: Env,
  model: string,
  prompt: string,
  userContent: string,
  temperature: number,
): AsyncGenerator<string> {
  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: prompt,
      input: [{ type: "message", role: "user", content: userContent }],
      temperature,
      stream: true,
      provider: { sort: "throughput" },
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${detail}`);
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // SSE lines are separated by \n; events by \n\n
    const lines = buffer.split("\n");
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trimStart();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const event = JSON.parse(data) as Record<string, unknown>;
        // OpenAI Responses API streaming event for text deltas
        if (
          event.type === "response.output_text.delta" &&
          typeof event.delta === "string" &&
          event.delta
        ) {
          yield event.delta;
        }
      } catch {
        // Ignore non-JSON SSE comment/heartbeat lines
      }
    }
  }
}

/**
 * Call OpenRouter and return the raw text output.
 */
async function callLLM(
  env: Env,
  model: string,
  prompt: string,
  userContent: string,
  temperature: number,
): Promise<string> {
  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: prompt,
      input: [{ type: "message", role: "user", content: userContent }],
      temperature,
      "provider": {
        "sort": "throughput"
      },
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${detail}`);
  }

  const data = (await resp.json()) as Record<string, unknown>;
  return extractOutputText(data);
}

/**
 * Escape a string so it can be safely embedded as a template-literal value
 * inside a <script> tag in a streaming HTML response.
 */
function escapeForTemplateLiteral(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/<\/script>/gi, "<\\/script>");
}

/**
 * Build the "user content" string from the incoming request, matching the
 * Python version: "METHOD /path?query\n\nbody"
 */
async function buildUserContent(c: Context<{ Bindings: Env }>): Promise<string> {
  const url = new URL(c.req.url);
  let content = `${c.req.method} ${url.pathname}`;
  if (url.search) content += url.search;

  const body = await c.req.text().catch(() => "");
  if (body) content += `\n\n${body}`;

  return content;
}

/**
 * Return a non-streaming response with the correct content type.
 */
function formatResponse(c: Context, text: string): Response {
  const stripped = text.trim();

  if (looksLikeHTML(stripped)) {
    return c.html(text);
  }

  try {
    const parsed = JSON.parse(stripped);
    return c.json(parsed);
  } catch {
    return c.text(text);
  }
}

/**
 * Register a "vibe" route on `app` for ALL HTTP methods.
 *
 * For HTML responses (dashboard, horoscope, etc.) the handler streams a
 * loading animation shell immediately, then replaces it with the real content
 * once the LLM responds. For JSON / plain-text endpoints it returns normally.
 *
 * Set `stream: true` in options to enable the streaming loading shell.
 */
export function vibe(
  app: Hono<{ Bindings: Env }>,
  path: string,
  options: VibeOptions & { stream?: boolean },
): void {
  const { prompt, model, temperature = 0.7, stream = false } = options;

  app.all(path, async (c) => {
    const env = c.env;

    if (!env.OPENROUTER_API_KEY) {
      return c.json(
        { error: "OPENROUTER_API_KEY environment variable is not set" },
        500,
      );
    }

    const resolvedModel = model ?? env.OPENROUTER_MODEL;
    const userContent = await buildUserContent(c);

    // --- Non-streaming path (JSON / plain text endpoints) ---
    if (!stream) {
      try {
        const text = await callLLM(env, resolvedModel, prompt, userContent, temperature);
        return formatResponse(c, text);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return c.json({ error: "OpenRouter API error", detail: message }, 502);
      }
    }

    // --- Streaming path: flush loading shell, then stream tokens into iframe ---
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();

    // Use waitUntil so the worker doesn't terminate before the stream finishes
    c.executionCtx.waitUntil(
      (async () => {
        try {
          // 1. Flush the loading shell instantly
          await writer.write(encoder.encode(loadingShell));

          // 2. Stream LLM chunks, batching them to reduce per-token CPU cost.
          //    Writing one <script> per token would trigger hundreds of encode/
          //    write/escape cycles and blow the CPU time limit. Instead we
          //    accumulate until at least CHUNK_FLUSH_BYTES chars are ready,
          //    then flush in one shot.
          const CHUNK_FLUSH_CHARS = 128;
          let chunkBuf = "";
          let hasChunks = false;

          const flushChunkBuf = async () => {
            if (!chunkBuf) return;
            await writer.write(
              encoder.encode(`<script>_vchunk(\`${escapeForTemplateLiteral(chunkBuf)}\`)</script>`),
            );
            chunkBuf = "";
          };

          for await (const chunk of streamLLM(env, resolvedModel, prompt, userContent, temperature)) {
            hasChunks = true;
            chunkBuf += chunk;
            if (chunkBuf.length >= CHUNK_FLUSH_CHARS) {
              await flushChunkBuf();
            }
          }
          // Flush any remaining buffered text before signalling completion.
          await flushChunkBuf();

          // 3. Signal completion — swaps iframe content into the main document.
          //    If no SSE chunks arrived (model doesn't support streaming),
          //    fall back to a single callLLM so the page still renders.
          if (!hasChunks) {
            const text = await callLLM(env, resolvedModel, prompt, userContent, temperature);
            await writer.write(
              encoder.encode(`<script>_vchunk(\`${escapeForTemplateLiteral(text)}\`)</script>`),
            );
          }
          await writer.write(encoder.encode(`<script>_vdone()</script>`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const errorHTML = `<script>document.getElementById("loading-message").textContent="Error: ${msg.replace(/"/g, '\\"')}";</script>`;
          await writer.write(encoder.encode(errorHTML));
        } finally {
          await writer.close();
        }
      })(),
    );

    return new Response(readable, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}
