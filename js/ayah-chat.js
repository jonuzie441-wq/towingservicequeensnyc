/* ============================================
   Ayah AI Chat Widget
   Standalone - no React needed
   ============================================ */

(function() {
  const PHONE = '(347) 437-0185';
  const PHONE_HREF = 'tel:+13474370185';
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let hasGreeted = false;
  let showPreview = false;
  let previewDismissed = false;

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    #ayah-widget { position:fixed; bottom:80px; right:16px; z-index:9999; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    @media(min-width:768px){ #ayah-widget { bottom:24px; } }
    #ayah-toggle { margin-left:auto; display:flex; align-items:center; gap:8px; background:#d4a017; color:#1a1a2e; font-weight:700; padding:14px 20px; border-radius:9999px; border:none; cursor:pointer; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-size:14px; position:relative; }
    #ayah-toggle:hover { background:#b8860b; }
    #ayah-dot { position:absolute; top:-4px; right:-4px; width:16px; height:16px; background:#ef4444; border-radius:50%; border:2px solid white; animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    #ayah-preview { background:white; border-radius:16px 16px 4px 16px; box-shadow:0 4px 20px rgba(0,0,0,0.15); border:1px solid #e5e7eb; padding:16px; max-width:260px; margin-bottom:12px; cursor:pointer; font-size:14px; color:#1a1a2e; display:flex; align-items:flex-end; gap:8px; justify-content:flex-end; }
    #ayah-preview-x { color:#9ca3af; cursor:pointer; font-size:12px; flex-shrink:0; background:none; border:none; padding:4px; }
    #ayah-chat { background:white; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,0.2); border:1px solid #e5e7eb; width:340px; max-height:70vh; display:flex; flex-direction:column; overflow:hidden; margin-bottom:12px; }
    @media(min-width:640px){ #ayah-chat { width:380px; } }
    #ayah-header { background:#1a1a2e; color:white; padding:16px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    #ayah-avatar { width:40px; height:40px; background:#d4a017; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#1a1a2e; font-size:14px; }
    #ayah-status { display:flex; align-items:center; gap:6px; }
    #ayah-status-dot { width:8px; height:8px; background:#4ade80; border-radius:50%; }
    #ayah-close { background:none; border:none; color:#9ca3af; cursor:pointer; font-size:20px; }
    #ayah-close:hover { color:white; }
    #ayah-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; min-height:200px; background:#f9fafb; }
    .ayah-msg { max-width:85%; padding:10px 16px; border-radius:16px; font-size:14px; line-height:1.5; word-wrap:break-word; }
    .ayah-msg-user { background:#d4a017; color:#1a1a2e; border-bottom-right-radius:4px; align-self:flex-end; }
    .ayah-msg-ai { background:white; color:#1a1a2e; border:1px solid #e5e7eb; border-bottom-left-radius:4px; align-self:flex-start; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
    #ayah-typing { display:flex; gap:4px; padding:10px 16px; background:white; border:1px solid #e5e7eb; border-radius:16px; border-bottom-left-radius:4px; align-self:flex-start; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
    .ayah-typing-dot { width:8px; height:8px; background:#9ca3af; border-radius:50%; animation:bounce 1.4s infinite; }
    .ayah-typing-dot:nth-child(2) { animation-delay:0.15s; }
    .ayah-typing-dot:nth-child(3) { animation-delay:0.3s; }
    @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    #ayah-quick { padding:8px 16px; background:#f9fafb; border-top:1px solid #f3f4f6; display:flex; gap:8px; flex-wrap:wrap; flex-shrink:0; }
    .ayah-quick-btn { font-size:12px; background:white; border:1px solid #e5e7eb; border-radius:9999px; padding:6px 12px; cursor:pointer; color:#1a1a2e; }
    .ayah-quick-btn:hover { border-color:#d4a017; color:#d4a017; }
    #ayah-input-bar { padding:12px; border-top:1px solid #e5e7eb; background:white; display:flex; gap:8px; flex-shrink:0; }
    #ayah-input { flex:1; padding:8px 16px; border:1px solid #e5e7eb; border-radius:9999px; font-size:14px; outline:none; }
    #ayah-input:focus { border-color:#d4a017; }
    #ayah-send { width:36px; height:36px; background:#d4a017; color:#1a1a2e; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    #ayah-send:hover { background:#b8860b; }
    #ayah-send:disabled { opacity:0.5; cursor:not-allowed; }
    #ayah-call-bar { padding:8px 16px; background:#f9fafb; border-top:1px solid #f3f4f6; text-align:center; font-size:12px; color:#6b7280; flex-shrink:0; }
    #ayah-call-bar a { color:#d4a017; font-weight:700; text-decoration:none; }
  `;
  document.head.appendChild(style);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.id = 'ayah-widget';
  document.body.appendChild(widget);

  function render() {
    let html = '';

    // Preview bubble
    if (showPreview && !isOpen && !previewDismissed) {
      html += `<div id="ayah-preview" onclick="window.ayahOpen()">
        <span>Hey! Ayah here from Towing Service Queens 👋 Need a tow or roadside help?</span>
        <button id="ayah-preview-x" onclick="event.stopPropagation();window.ayahDismissPreview()">✕</button>
      </div>`;
    }

    // Chat window
    if (isOpen) {
      html += `<div id="ayah-chat">
        <div id="ayah-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div id="ayah-avatar">A</div>
            <div>
              <div style="font-weight:700;font-size:14px">Ayah</div>
              <div id="ayah-status"><div id="ayah-status-dot"></div><span style="font-size:12px;color:#d1d5db">Online — Ready to help</span></div>
            </div>
          </div>
          <button id="ayah-close" onclick="window.ayahToggle()">✕</button>
        </div>
        <div id="ayah-messages">`;

      for (const msg of messages) {
        const cls = msg.role === 'user' ? 'ayah-msg-user' : 'ayah-msg-ai';
        const text = msg.content.replace(/\[DISPATCH:[^\]]*\]/g, '').replace(/\[CALLBACK:[^\]]*\]/g, '').trim();
        if (text) html += `<div class="ayah-msg ${cls}">${escapeHtml(text)}</div>`;
      }

      if (isStreaming) {
        html += `<div id="ayah-typing"><div class="ayah-typing-dot"></div><div class="ayah-typing-dot"></div><div class="ayah-typing-dot"></div></div>`;
      }

      html += `</div>`;

      // Quick actions
      if (messages.length <= 2) {
        html += `<div id="ayah-quick">
          <button class="ayah-quick-btn" onclick="window.ayahSend('I need a tow')">I need a tow</button>
          <button class="ayah-quick-btn" onclick="window.ayahSend('Locked out')">Locked out</button>
          <button class="ayah-quick-btn" onclick="window.ayahSend('Dead battery')">Dead battery</button>
          <button class="ayah-quick-btn" onclick="window.ayahSend('Flat tire')">Flat tire</button>
        </div>`;
      }

      html += `<form id="ayah-input-bar" onsubmit="event.preventDefault();window.ayahSubmit()">
        <input id="ayah-input" type="text" placeholder="Type your message..." ${isStreaming ? 'disabled' : ''}>
        <button id="ayah-send" type="submit" ${isStreaming ? 'disabled' : ''}>&#9654;</button>
      </form>
      <div id="ayah-call-bar">Prefer to call? <a href="${PHONE_HREF}">${PHONE}</a></div>
      </div>`;
    }

    // Toggle button
    html += `<div style="display:flex;justify-content:flex-end">
      <button id="ayah-toggle" onclick="window.ayahToggle()">
        ${showPreview && !isOpen && !previewDismissed ? '<span id="ayah-dot"></span>' : ''}
        ${isOpen ? '✕' : '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg><span style="display:none" class="ayah-label">Chat with Ayah</span>'}
      </button>
    </div>`;

    widget.innerHTML = html;

    // Scroll to bottom
    const msgBox = document.getElementById('ayah-messages');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;

    // Focus input
    const input = document.getElementById('ayah-input');
    if (input && isOpen) input.focus();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show preview after 3 seconds
  setTimeout(function() {
    if (!isOpen && !previewDismissed) {
      showPreview = true;
      render();
    }
  }, 3000);

  window.ayahDismissPreview = function() {
    previewDismissed = true;
    showPreview = false;
    render();
  };

  window.ayahOpen = function() {
    isOpen = true;
    showPreview = false;
    previewDismissed = true;
    render();
    if (!hasGreeted && messages.length === 0) {
      hasGreeted = true;
      sendToAyah('Hi');
    }
  };

  window.ayahToggle = function() {
    if (isOpen) {
      isOpen = false;
    } else {
      window.ayahOpen();
    }
    render();
  };

  window.ayahSubmit = function() {
    const input = document.getElementById('ayah-input');
    if (!input || !input.value.trim() || isStreaming) return;
    sendToAyah(input.value.trim());
  };

  window.ayahSend = function(text) {
    if (isStreaming) return;
    sendToAyah(text);
  };

  async function sendToAyah(text) {
    messages.push({ role: 'user', content: text });
    isStreaming = true;
    render();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            id: Math.random().toString(36).slice(2),
            parts: [{ type: 'text', text: m.content }]
          }))
        })
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      messages.push({ role: 'assistant', content: '' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse the stream - extract text parts
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('g:') || line.startsWith('f:') || line.startsWith('d:') || line.startsWith('e:')) {
            // Control messages, skip
            continue;
          }
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              aiResponse += text;
              messages[messages.length - 1].content = aiResponse;
              render();
            } catch(e) { /* skip parse errors */ }
          }
        }
      }
    } catch (err) {
      messages.push({ role: 'assistant', content: "Sorry, having trouble connecting. Call us directly at " + PHONE });
    }

    isStreaming = false;
    render();
  }

  render();
})();
