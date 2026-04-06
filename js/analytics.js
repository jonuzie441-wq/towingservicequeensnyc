/* ============================================
   Custom Analytics Tracker
   ============================================ */

(function() {
  function getSessionId() {
    var id = sessionStorage.getItem('tow_sid');
    if (!id) { id = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2,10); sessionStorage.setItem('tow_sid', id); }
    return id;
  }

  function getDevice() {
    var w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  function getSource() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('utm_source')) return { source: p.get('utm_source'), medium: p.get('utm_medium') || 'unknown' };
    var ref = document.referrer;
    if (!ref) return { source: 'direct', medium: 'none' };
    try {
      var h = new URL(ref).hostname;
      if (h.includes('google')) return { source:'google', medium:'organic' };
      if (h.includes('bing')) return { source:'bing', medium:'organic' };
      if (h.includes('facebook') || h.includes('fb.com')) return { source:'facebook', medium:'social' };
      if (h.includes('instagram')) return { source:'instagram', medium:'social' };
      if (h.includes('yelp')) return { source:'yelp', medium:'referral' };
      return { source:h, medium:'referral' };
    } catch(e) { return { source:'unknown', medium:'referral' }; }
  }

  function send(endpoint, data) {
    var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (navigator.sendBeacon) { navigator.sendBeacon(endpoint, blob); }
    else { fetch(endpoint, { method:'POST', body:JSON.stringify(data), headers:{'Content-Type':'application/json'}, keepalive:true }).catch(function(){}); }
  }

  // Track page view
  var src = getSource();
  send('/api/analytics', {
    type: 'pageview',
    path: window.location.pathname,
    referrer: document.referrer,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    language: navigator.language,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    source: src.source,
    medium: src.medium,
    device: getDevice()
  });

  // Track clicks
  document.addEventListener('click', function(e) {
    var t = e.target;
    send('/api/analytics', {
      type: 'click',
      path: window.location.pathname,
      elementTag: t.tagName.toLowerCase(),
      elementText: (t.textContent || '').slice(0, 100),
      x: e.clientX,
      y: e.clientY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    });

    // Track call clicks specifically
    var anchor = t.closest('a[href^="tel:"]');
    if (anchor) {
      send('/api/analytics', {
        type: 'call',
        path: window.location.pathname,
        phone: anchor.getAttribute('href'),
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        device: getDevice(),
        source: src.source
      });
      // Fire GA4 event for call tracking
      if (typeof gtag === 'function') {
        gtag('event', 'call_click', {
          event_category: 'engagement',
          event_label: window.location.pathname,
          phone_number: anchor.getAttribute('href'),
          traffic_source: src.source,
          device_type: getDevice()
        });
      }
    }

    // Track chat opens for GA4
    if (t.closest('[onclick*="ayahOpen"]') || t.closest('.ayah-trigger')) {
      if (typeof gtag === 'function') {
        gtag('event', 'chat_open', {
          event_category: 'engagement',
          event_label: window.location.pathname,
          traffic_source: src.source
        });
      }
    }
  });
})();
