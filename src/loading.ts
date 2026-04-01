/**
 * A self-contained HTML loading shell that is flushed immediately to the
 * browser while the LLM generates the real response. Pure CSS animation —
 * no JS, no external deps.
 *
 * The streaming handler in vibe.ts will follow this with a <script> that
 * replaces the entire document with the LLM output.
 */
export const loadingShell = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading…</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    min-height:100vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    background:#0a0a0f;
    color:#c4c4cc;
    font-family:system-ui,-apple-system,sans-serif;
    overflow:hidden;
  }

  /* --- pulsing ring spinner --- */
  .spinner{
    width:56px;height:56px;
    position:relative;
    margin-bottom:28px;
  }
  .spinner::before,.spinner::after{
    content:'';
    position:absolute;inset:0;
    border-radius:50%;
    border:3px solid transparent;
  }
  .spinner::before{
    border-top-color:#7c6aef;
    animation:spin .9s linear infinite;
  }
  .spinner::after{
    border-bottom-color:#38bdf8;
    animation:spin .9s linear infinite reverse;
  }

  @keyframes spin{to{transform:rotate(360deg)}}

  /* --- bouncing dots --- */
  .dots{display:flex;gap:6px;margin-top:16px}
  .dots span{
    width:7px;height:7px;
    border-radius:50%;
    background:#7c6aef;
    animation:bounce 1.2s ease-in-out infinite;
  }
  .dots span:nth-child(2){animation-delay:.15s}
  .dots span:nth-child(3){animation-delay:.3s}

  @keyframes bounce{
    0%,80%,100%{opacity:.25;transform:scale(.8)}
    40%{opacity:1;transform:scale(1.1)}
  }

  #loading-message{
    font-size:.9rem;
    letter-spacing:.04em;
    opacity:.7;
  }
</style>
</head>
<body>
  <div class="spinner"></div>
  <p id="loading-message">Generating response&hellip;</p>
  <div class="dots"><span></span><span></span><span></span></div>
<!-- stream kept open for swap script -->
`;
