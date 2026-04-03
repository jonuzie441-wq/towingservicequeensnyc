/* Tawk.to — visitor tracking only, widget completely hidden */
(function(){
  // Force hide ALL Tawk.to visual elements with aggressive CSS
  var css = document.createElement('style');
  css.textContent = [
    '.tawk-min-container { display:none !important; }',
    '.tawk-button-circle { display:none !important; }',
    '.tawk-custom-color { display:none !important; }',
    '[class*="tawk"] { visibility:hidden !important; width:0 !important; height:0 !important; opacity:0 !important; pointer-events:none !important; position:fixed !important; bottom:-9999px !important; right:-9999px !important; }',
    'iframe[title="chat widget"] { display:none !important; }',
    'iframe[src*="tawk.to"] { display:none !important; }',
    '#tawk-default-container { display:none !important; }',
  ].join('\n');
  document.head.appendChild(css);

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.onLoad = function() {
    window.Tawk_API.hideWidget();
  };

  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/69cf4be4b8aa781c3b30f8f2/1jl8s0tge';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
})();
