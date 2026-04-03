/* Tawk.to — visitor tracking only, widget completely hidden */
(function(){
  // Force hide with CSS immediately
  var css = document.createElement('style');
  css.textContent = '#tawk-default-container, .tawk-min-container, iframe[title="chat widget"], .widget-visible { display:none !important; visibility:hidden !important; opacity:0 !important; pointer-events:none !important; width:0 !important; height:0 !important; }';
  document.head.appendChild(css);

  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  Tawk_API.onLoad = function(){ Tawk_API.hideWidget(); };
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/69cf4be4b8aa781c3b30f8f2/1jl8s0tge';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
})();
