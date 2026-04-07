/* Tawk.to — visitor tracking, widget hidden. Delayed 5s to not hurt performance */
setTimeout(function(){
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.onLoad = function() { window.Tawk_API.hideWidget(); };
  window.Tawk_API.onStatusChange = function() { window.Tawk_API.hideWidget(); };
  var s1 = document.createElement("script");
  s1.async = true;
  s1.src = 'https://embed.tawk.to/69cf4be4b8aa781c3b30f8f2/1jl8s0tge';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  document.body.appendChild(s1);
}, 5000);
