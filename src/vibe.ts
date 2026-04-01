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

    // --- Streaming path: flush loading shell, then swap in real content ---
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();

    // Kick off the LLM call (don't await yet) and start streaming immediately
    const llmPromise = callLLM(env, resolvedModel, prompt, userContent, temperature);

    // Use waitUntil so the worker doesn't terminate before the stream finishes
    c.executionCtx.waitUntil(
      (async () => {
        try {
          // 1. Flush the loading shell instantly
          await writer.write(encoder.encode(loadingShell));

          // 2. Await the LLM response
          const text = await llmPromise;

          // 3. Inject the real content via a script that replaces the page
          //    We escape </script> sequences and backticks in the LLM output
          const escaped = text
            .replace(/\\/g, "\\\\")
            .replace(/`/g, "\\`")
            .replace(/<\/script>/gi, "<\\/script>");

          const swap = `<script>setTimeout(()=>{document.open();document.write(\`${escaped}\`);document.close();},0);</script>`;
          await writer.write(encoder.encode(swap));
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
