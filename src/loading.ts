/**
 * A self-contained HTML loading shell that is flushed immediately to the
 * browser while the LLM generates the real response.
 *
 * The streaming handler in vibe.ts follows this with a series of
 * <script>_vchunk(`...`)</script> injections as the LLM streams tokens.
 * Each chunk is written into a full-viewport iframe so the page renders
 * progressively. When the LLM finishes, <script>_vdone()</script> swaps
 * the iframe content into the main document.
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
    background:#0a0a0f;
    font-family:system-ui,-apple-system,sans-serif;
    overflow:hidden;
  }

  /* --- full-viewport iframe (hidden until content arrives) --- */
  #vibe-frame{
    position:fixed;top:0;left:0;width:100%;height:100%;
    border:none;opacity:0;z-index:10;
    transition:opacity .4s ease;
  }

  /* --- loading overlay (sits above iframe) --- */
  #vibe-loader{
    position:fixed;top:0;left:0;width:100%;height:100%;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:#0a0a0f;color:#c4c4cc;
    z-index:20;
    transition:opacity .4s ease;
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
  <div id="vibe-loader">
    <div class="spinner"></div>
    <p id="loading-message">Generating response&hellip;</p>
    <div class="dots"><span></span><span></span><span></span></div>
  </div>
  <iframe id="vibe-frame" title="content"></iframe>
  <script>
  var _vbuf='';
  var _vfd=null;
  var _vshown=false;
  var _vframe=document.getElementById('vibe-frame');
  var _vloader=document.getElementById('vibe-loader');
  // Reveal the iframe once enough HTML has arrived to have meaningful content
  // (~1500 chars typically covers the doctype, head, and opening body markup).
  var IFRAME_REVEAL_THRESHOLD=1500;
  function _vchunk(s){
    _vbuf+=s;
    if(!_vfd){_vfd=_vframe.contentDocument;_vfd.open();}
    _vfd.write(s);
    if(!_vshown&&_vbuf.length>=IFRAME_REVEAL_THRESHOLD){
      _vshown=true;
      _vframe.style.opacity='1';
      _vloader.style.opacity='0';
      setTimeout(function(){_vloader.style.display='none';},400);
    }
  }
  function _vdone(){
    if(_vfd){_vfd.close();}
    // Ensure loader is hidden before swapping
    _vloader.style.display='none';
    // Use setTimeout so the iframe's current paint cycle completes before we
    // call document.open(), which tears down and replaces the entire document.
    setTimeout(function(){
      document.open();document.write(_vbuf);document.close();
    },0);
  }
  </script>
<!-- stream kept open; _vchunk / _vdone scripts follow -->
`;
