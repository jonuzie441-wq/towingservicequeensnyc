/* Tawk.to — visitor tracking, widget hidden but script runs for notifications */
(function(){
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // Hide the chat widget AFTER it loads, not before
  window.Tawk_API.onLoad = function() {
    window.Tawk_API.hideWidget();
  };

  // Also hide on status change
  window.Tawk_API.onStatusChange = function() {
    window.Tawk_API.hideWidget();
  };

  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/69cf4be4b8aa781c3b30f8f2/1jl8s0tge';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
