(function () {
  "use strict";
  var NAV_LINKS = [
    { label: "Tools", href: "/tools.html" },
    { label: "AI Tools", href: "/ai-tools.html" },
    { label: "Image Tools", href: "/categories/image-tools.html" },
    { label: "Pricing", href: "/pricing.html" },
    { label: "About", href: "/about.html" }
  ];
  function headerTemplate() {
    var path = window.location.pathname.replace(/\/index\.html$/, "/");
    var navHtml = NAV_LINKS.map(function (l) {
      var current = path === l.href ? ' aria-current="page"' : "";
      return '<li><a href="' + l.href + '"' + current + '>' + l.label + '</a></li>';
    }).join("");
    return (
      '<div class="container header-inner">' +
        '<a class="logo" href="/index.html"><span class="logo-mark">PF</span>PixelForge AI</a>' +
        '<nav class="main-nav" aria-label="Primary"><ul>' + navHtml + '</ul></nav>' +
        '<div class="header-actions">' +
          '<form class="header-search" role="search" action="/tools.html" method="get">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
            '<input type="search" name="q" placeholder="Search tools..." aria-label="Search tools">' +
          '</form>' +
          '<div class="theme-toggle" role="group" aria-label="Theme">' +
            '<button type="button" data-theme-option="light" aria-label="Light theme" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg></button>' +
            '<button type="button" data-theme-option="dark" aria-label="Dark theme" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg></button>' +
            '<button type="button" data-theme-option="auto" aria-label="Auto theme" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></button>' +
          '</div>' +
          '<button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" id="pf-nav-toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-nav" id="pf-mobile-nav"><ul>' + navHtml + '</ul></div>'
    );
  }
  function footerTemplate() {
    var year = new Date().getFullYear();
    return (
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-col"><a class="logo" href="/index.html"><span class="logo-mark">PF</span>PixelForge AI</a>' +
            '<p>Practical, honest image and creative tools that run in your browser wherever possible. No gimmicks, no fake results.</p></div>' +
          '<div class="footer-col"><h4>Product</h4><ul><li><a href="/tools.html">All Tools</a></li><li><a href="/ai-tools.html">AI Tools</a></li><li><a href="/pricing.html">Pricing</a></li></ul></div>' +
          '<div class="footer-col"><h4>Company</h4><ul><li><a href="/about.html">About</a></li><li><a href="/contact.html">Contact</a></li></ul></div>' +
          '<div class="footer-col"><h4>Legal</h4><ul><li><a href="/privacy.html">Privacy Policy</a></li><li><a href="/terms.html">Terms of Service</a></li></ul></div>' +
        '</div>' +
        '<div class="footer-bottom"><span>(c) ' + year + ' PixelForge AI. All rights reserved.</span><span>Tools that process files locally never upload them to a server.</span></div>' +
      '</div>'
    );
  }
  function injectPartials() {
    var headerEl = document.getElementById("site-header");
    var footerEl = document.getElementById("site-footer");
    if (headerEl) headerEl.innerHTML = headerTemplate();
    if (footerEl) footerEl.innerHTML = footerTemplate();
  }
  function wireMobileNav() {
    var toggle = document.getElementById("pf-nav-toggle");
    var nav = document.getElementById("pf-mobile-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }
  function prefillSearchFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (!q) return;
    document.querySelectorAll('.header-search input[type="search"]').forEach(function (input) { input.value = q; });
  }
  document.addEventListener("DOMContentLoaded", function () { injectPartials(); wireMobileNav(); prefillSearchFromQuery(); });
})();