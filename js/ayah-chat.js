/* ============================================
   Ayah AI Chat Widget — Mobile First
   ============================================ */

(function() {
  const PHONE = '(347) 437-0185';
  const PHONE_HREF = 'tel:+13474370185';
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let hasGreeted = false;
  let previewDismissed = false;
  let showPreview = false;

  const style = document.createElement('style');
  style.textContent = `
    #ayah-widget { position:fixed; bottom:0; right:0; z-index:9999; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }

    /* Toggle button */
    #ayah-toggle { position:fixed; bottom:90px; right:16px; display:flex; align-items:center; gap:8px; background:#d4a017; color:#1a1a2e; font-weight:700; padding:16px 20px; border-radius:9999px; border:none; cursor:pointer; box-shadow:0 4px 24px rgba(0,0,0,0.3); font-size:15px; z-index:9999; }
    @media(min-width:768px){ #ayah-toggle { bottom:24px; right:24px; } }
    #ayah-toggle:hover { background:#b8860b; }
    #ayah-dot { position:absolute; top:-2px; right:-2px; width:14px; height:14px; background:#ef4444; border-radius:50%; border:2px solid white; animation:aypulse 2s infinite; }
    @keyframes aypulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

    /* Preview bubble */
    #ayah-preview { position:fixed; bottom:160px; right:16px; z-index:9999; max-width:280px; }
    @media(min-width:768px){ #ayah-preview { bottom:90px; right:90px; } }
    #ayah-preview-inner { background:white; border-radius:20px 20px 4px 20px; box-shadow:0 4px 24px rgba(0,0,0,0.15); border:1px solid #e5e7eb; padding:16px; font-size:15px; color:#1a1a2e; line-height:1.5; cursor:pointer; }
    #ayah-preview-close { position:absolute; top:-8px; right:-8px; width:24px; height:24px; background:#6b7280; color:white; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; }

    /* Chat window — FULL SCREEN on mobile */
    #ayah-chat { position:fixed; inset:0; background:white; display:flex; flex-direction:column; z-index:10000; }
    @media(min-width:768px){
      #ayah-chat { position:fixed; bottom:24px; right:24px; top:auto; left:auto; width:400px; height:600px; max-height:80vh; border-radius:20px; box-shadow:0 8px 40px rgba(0,0,0,0.25); border:1px solid #e5e7eb; }
    }

    /* Header */
    #ayah-header { background:#1a1a2e; color:white; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    @media(min-width:768px){ #ayah-header { border-radius:20px 20px 0 0; } }
    #ayah-avatar { width:44px; height:44px; background:#d4a017; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#1a1a2e; font-size:16px; flex-shrink:0; }
    #ayah-hdr-info { margin-left:12px; }
    #ayah-hdr-name { font-weight:700; font-size:16px; }
    #ayah-hdr-status { display:flex; align-items:center; gap:6px; margin-top:2px; }
    #ayah-hdr-dot { width:8px; height:8px; background:#4ade80; border-radius:50%; }
    #ayah-hdr-txt { font-size:13px; color:#d1d5db; }
    #ayah-close { background:none; border:none; color:#9ca3af; cursor:pointer; font-size:28px; padding:8px; line-height:1; }
    #ayah-close:hover { color:white; }

    /* Messages */
    #ayah-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:#f9fafb; -webkit-overflow-scrolling:touch; justify-content:flex-end; }
    .ay-msg { max-width:85%; padding:12px 16px; border-radius:20px; font-size:15px; line-height:1.5; word-wrap:break-word; }
    .ay-msg-user { background:#d4a017; color:#1a1a2e; border-bottom-right-radius:4px; align-self:flex-end; }
    .ay-msg-ai { background:white; color:#1a1a2e; border:1px solid #e5e7eb; border-bottom-left-radius:4px; align-self:flex-start; box-shadow:0 1px 3px rgba(0,0,0,0.05); }

    /* Typing indicator */
    #ayah-typing { display:flex; gap:5px; padding:12px 16px; background:white; border:1px solid #e5e7eb; border-radius:20px; border-bottom-left-radius:4px; align-self:flex-start; }
    .ay-dot { width:8px; height:8px; background:#9ca3af; border-radius:50%; animation:aybounce 1.4s infinite; }
    .ay-dot:nth-child(2) { animation-delay:0.15s; }
    .ay-dot:nth-child(3) { animation-delay:0.3s; }
    @keyframes aybounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }

    /* Quick action buttons */
    #ayah-quick { padding:12px 16px; background:#f9fafb; border-top:1px solid #f3f4f6; display:flex; gap:8px; flex-wrap:wrap; flex-shrink:0; }
    .ay-qbtn { font-size:14px; background:white; border:2px solid #e5e7eb; border-radius:9999px; padding:10px 16px; cursor:pointer; color:#1a1a2e; font-weight:500; -webkit-tap-highlight-color:transparent; }
    .ay-qbtn:hover, .ay-qbtn:active { border-color:#d4a017; color:#d4a017; background:#fefce8; }

    /* Input area */
    #ayah-input-bar { padding:12px 16px; border-top:1px solid #e5e7eb; background:white; display:flex; gap:10px; flex-shrink:0; }
    @media(max-width:767px){ #ayah-input-bar { padding-bottom:max(12px, env(safe-area-inset-bottom)); } }
    #ayah-input { flex:1; padding:12px 16px; border:2px solid #e5e7eb; border-radius:9999px; font-size:16px; outline:none; -webkit-appearance:none; }
    #ayah-input:focus { border-color:#d4a017; }
    #ayah-input::placeholder { color:#9ca3af; }
    #ayah-send { width:44px; height:44px; background:#d4a017; color:#1a1a2e; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:18px; -webkit-tap-highlight-color:transparent; }
    #ayah-send:disabled { opacity:0.4; }

    /* Call bar */
    #ayah-call { padding:10px 16px; background:#f9fafb; border-top:1px solid #f3f4f6; text-align:center; font-size:14px; color:#6b7280; flex-shrink:0; }
    #ayah-call a { color:#d4a017; font-weight:700; text-decoration:none; }
  `;
  document.head.appendChild(style);

  // Create containers
  const widget = document.createElement('div');
  widget.id = 'ayah-widget';
  document.body.appendChild(widget);

  function render() {
    let html = '';

    // Preview greeting — shows before chat opened
    if (showPreview && !isOpen && !previewDismissed) {
      html += `<div id="ayah-preview">
        <div id="ayah-preview-inner" onclick="window.ayahOpen()">Hey! Ayah here 👋 Need a tow or roadside help? Tap here to chat!</div>
        <div id="ayah-preview-close" onclick="event.stopPropagation();window.ayahDismiss()">✕</div>
      </div>`;
    }

    // Chat window
    if (isOpen) {
      html += `<div id="ayah-chat">
        <div id="ayah-header">
          <div style="display:flex;align-items:center">
            <div id="ayah-avatar">A</div>
            <div id="ayah-hdr-info">
              <div id="ayah-hdr-name">Ayah</div>
              <div id="ayah-hdr-status"><div id="ayah-hdr-dot"></div><span id="ayah-hdr-txt">Online now</span></div>
            </div>
          </div>
          <button id="ayah-close" onclick="window.ayahToggle()" aria-label="Close">✕</button>
        </div>
        <div id="ayah-messages">`;

      for (const msg of messages) {
        const cls = msg.role === 'user' ? 'ay-msg-user' : 'ay-msg-ai';
        const text = msg.content.replace(/\[DISPATCH:[^\]]*\]/g, '').replace(/\[CALLBACK:[^\]]*\]/g, '').trim();
        if (text) html += `<div class="ay-msg ${cls}">${esc(text)}</div>`;
      }

      if (isStreaming) {
        html += `<div id="ayah-typing"><div class="ay-dot"></div><div class="ay-dot"></div><div class="ay-dot"></div></div>`;
      }

      html += `</div>`;

      // Quick actions — only at start
      if (messages.length <= 2) {
        html += `<div id="ayah-quick">
          <button class="ay-qbtn" onclick="window.ayahSend('I need a tow')">🚗 I need a tow</button>
          <button class="ay-qbtn" onclick="window.ayahSend('Locked out')">🔑 Locked out</button>
          <button class="ay-qbtn" onclick="window.ayahSend('Dead battery')">🔋 Dead battery</button>
          <button class="ay-qbtn" onclick="window.ayahSend('Flat tire')">🛞 Flat tire</button>
        </div>`;
      }

      html += `<form id="ayah-input-bar" onsubmit="event.preventDefault();window.ayahSubmit()">
        <input id="ayah-input" type="text" placeholder="Type here..." ${isStreaming?'disabled':''} autocomplete="off" enterkeyhint="send">
        <button id="ayah-send" type="submit" ${isStreaming?'disabled':''} aria-label="Send">▶</button>
      </form>
      <div id="ayah-call">Or call <a href="${PHONE_HREF}">${PHONE}</a></div>
      </div>`;
    }

    // Toggle button — hidden when chat is open on mobile
    if (!isOpen) {
      html += `<button id="ayah-toggle" onclick="window.ayahOpen()">
        ${showPreview && !previewDismissed ? '<span id="ayah-dot"></span>' : ''}
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        Chat with Ayah
      </button>`;
    }

    widget.innerHTML = html;

    // Scroll to bottom
    var mb = document.getElementById('ayah-messages');
    if (mb) mb.scrollTop = mb.scrollHeight;

    // Focus input on desktop
    if (isOpen && window.innerWidth >= 768) {
      var inp = document.getElementById('ayah-input');
      if (inp) inp.focus();
    }
  }

  function esc(t) { var d=document.createElement('div'); d.textContent=t; return d.innerHTML; }

  // Show preview after 2 seconds
  setTimeout(function() {
    if (!isOpen && !previewDismissed) { showPreview = true; render(); }
  }, 2000);

  window.ayahDismiss = function() { previewDismissed = true; showPreview = false; render(); };

  window.ayahOpen = function() {
    isOpen = true; showPreview = false; previewDismissed = true; render();
    if (!hasGreeted && messages.length === 0) { hasGreeted = true; sendToAyah('Hi'); }
  };

  window.ayahToggle = function() {
    isOpen = !isOpen;
    if (isOpen) { showPreview = false; previewDismissed = true; if (!hasGreeted && messages.length===0) { hasGreeted=true; sendToAyah('Hi'); } }
    render();
  };

  window.ayahSubmit = function() {
    var inp = document.getElementById('ayah-input');
    if (!inp || !inp.value.trim() || isStreaming) return;
    sendToAyah(inp.value.trim());
  };

  window.ayahSend = function(t) { if (!isStreaming) sendToAyah(t); };

  async function sendToAyah(text) {
    messages.push({ role:'user', content:text });
    isStreaming = true;
    render();

    try {
      var res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          messages: messages.map(function(m) {
            return { role:m.role, id:Math.random().toString(36).slice(2), parts:[{type:'text',text:m.content}] };
          })
        })
      });

      if (!res.ok) throw new Error('fail');

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var aiResp = '';
      messages.push({ role:'assistant', content:'' });

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        var lines = decoder.decode(chunk.value, {stream:true}).split('\n');
        for (var i=0; i<lines.length; i++) {
          if (lines[i].startsWith('0:')) {
            try { aiResp += JSON.parse(lines[i].slice(2)); messages[messages.length-1].content = aiResp; render(); } catch(e) {}
          }
        }
      }
    } catch(e) {
      messages.push({ role:'assistant', content:"Sorry, having trouble connecting. Call us at " + PHONE });
    }

    isStreaming = false;
    render();
  }

  render();
})();
