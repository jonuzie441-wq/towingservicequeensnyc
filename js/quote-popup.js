/* ============================================
   Instant Quote Popup
   ============================================ */

(function() {
  const PHONE = '(347) 437-0185';
  const PHONE_HREF = 'tel:+13474370185';
  let shown = false;

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('quote_dismissed')) return;

  const style = document.createElement('style');
  style.textContent = `
    #quote-overlay { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; padding:16px; }
    #quote-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.6); }
    #quote-modal { position:relative; background:white; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.3); width:100%; max-width:420px; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    #quote-header { background:#1a1a2e; color:white; padding:20px; position:relative; }
    #quote-badge { display:inline-block; background:#d4a017; color:#1a1a2e; font-size:11px; font-weight:700; padding:4px 12px; border-radius:9999px; margin-bottom:8px; }
    #quote-header h3 { font-size:20px; font-weight:800; margin:0 0 4px; }
    #quote-header p { font-size:13px; color:#d1d5db; margin:0; }
    #quote-x { position:absolute; top:12px; right:12px; background:none; border:none; color:#9ca3af; cursor:pointer; font-size:20px; }
    #quote-x:hover { color:white; }
    #quote-form { padding:20px; display:flex; flex-direction:column; gap:12px; }
    #quote-form label { font-size:12px; font-weight:500; color:#6b7280; margin-bottom:2px; display:block; }
    #quote-form input, #quote-form select { width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; }
    #quote-form input:focus, #quote-form select:focus { border-color:#d4a017; }
    #quote-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    #quote-submit { background:#d4a017; color:#1a1a2e; font-weight:700; padding:12px; border:none; border-radius:12px; font-size:16px; cursor:pointer; }
    #quote-submit:hover { background:#b8860b; }
    #quote-submit:disabled { opacity:0.5; }
    #quote-call { text-align:center; font-size:12px; color:#6b7280; padding-bottom:4px; }
    #quote-call a { color:#d4a017; font-weight:700; text-decoration:none; }
    #quote-success { padding:40px 20px; text-align:center; }
    #quote-success h3 { font-size:22px; font-weight:800; color:#1a1a2e; margin:8px 0; }
    #quote-success p { color:#6b7280; margin:0 0 16px; }
  `;
  document.head.appendChild(style);

  function show() {
    if (shown) return;
    shown = true;

    const el = document.createElement('div');
    el.id = 'quote-overlay';
    el.innerHTML = `
      <div id="quote-backdrop" onclick="document.getElementById('quote-overlay').remove();sessionStorage.setItem('quote_dismissed','1')"></div>
      <div id="quote-modal">
        <div id="quote-header">
          <button id="quote-x" onclick="document.getElementById('quote-overlay').remove();sessionStorage.setItem('quote_dismissed','1')">✕</button>
          <div id="quote-badge">FREE — NO OBLIGATION</div>
          <h3>Get an Instant Quote in 60 Seconds</h3>
          <p>Tell us what's going on — we'll get back to you immediately.</p>
        </div>
        <form id="quote-form" onsubmit="event.preventDefault();window.submitQuote()">
          <div id="quote-row">
            <div><label>Your Name *</label><input id="q-name" required placeholder="John"></div>
            <div><label>Phone Number *</label><input id="q-phone" type="tel" required placeholder="(347) 555-0123"></div>
          </div>
          <div><label>Your Location *</label><input id="q-location" required placeholder="e.g., Jamaica Ave & Sutphin Blvd"></div>
          <div><label>Vehicle (make, model, color)</label><input id="q-vehicle" placeholder="e.g., 2019 Honda Accord, Black"></div>
          <div><label>What happened? *</label>
            <select id="q-problem" required>
              <option value="">Select a service...</option>
              <option>Car won't start / needs tow</option>
              <option>Accident / collision</option>
              <option>Flat tire</option>
              <option>Dead battery / jump start</option>
              <option>Locked out of car</option>
              <option>Ran out of gas</option>
              <option>Need flatbed tow</option>
              <option>Motorcycle tow</option>
              <option>Other</option>
            </select>
          </div>
          <button id="quote-submit" type="submit">Get My Free Quote</button>
          <div id="quote-call">Or call us directly: <a href="${PHONE_HREF}">${PHONE}</a></div>
        </form>
      </div>`;
    document.body.appendChild(el);
  }

  window.submitQuote = async function() {
    const btn = document.getElementById('quote-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const data = {
      name: document.getElementById('q-name').value,
      phone: document.getElementById('q-phone').value,
      location: document.getElementById('q-location').value,
      vehicle: document.getElementById('q-vehicle').value,
      problem: document.getElementById('q-problem').value,
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          message: 'Location: ' + data.location + ' | Vehicle: ' + data.vehicle + ' | Problem: ' + data.problem,
          source: 'quote-popup',
          page: window.location.pathname,
        })
      });
    } catch(e) { /* still show success */ }

    const modal = document.getElementById('quote-modal');
    modal.innerHTML = `<div id="quote-success">
      <div style="font-size:48px">✅</div>
      <h3>We Got Your Info!</h3>
      <p>Expect a call within minutes. If it's urgent, call us directly:</p>
      <a href="${PHONE_HREF}" style="display:inline-block;background:#d4a017;color:#1a1a2e;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:18px">Call ${PHONE}</a>
      <br><button onclick="document.getElementById('quote-overlay').remove();sessionStorage.setItem('quote_dismissed','1')" style="margin-top:16px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px">Close</button>
    </div>`;
    sessionStorage.setItem('quote_dismissed', '1');
  };

  // Show after 8 seconds
  setTimeout(show, 8000);
})();
