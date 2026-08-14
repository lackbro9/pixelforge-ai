window.PFToolGrid = (function () {
"use strict";
var BASE = (function () {
  var s = document.querySelector('script[src$="js/tool-grid.js"]');
  var src = s ? s.getAttribute("src") : "";
  return src.replace(/js\/tool-grid\.js$/, "");
})();
var ICONS = {
  compress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v4a1 1 0 0 1-1 1H3M16 3v4a1 1 0 0 0 1 1h4M8 21v-4a1 1 0 0 0-1-1H3M16 21v-4a1 1 0 0 1 1-1h4"/></svg>',
  resize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M21 21l-6-6M21 21v-5M21 21h-5"/></svg>',
  crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
  convert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22a10 10 0 1 1 10-10c0 2-2 3-4 3h-2a2 2 0 0 0-1.5 3.3c.4.5.5 1.2 0 1.7-.5.5-1.5 2-2.5 2z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M9 20h6M12 4v16"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>'
};
function icon(key) { return ICONS[key] || ICONS.sparkles; }
function card(tool) {
  var statusBadge = tool.status === "soon" ? '<span class="badge badge-soon">Coming Soon</span>' : '<span class="badge badge-available">Available</span>';
  var popularBadge = tool.popular ? '<span class="badge badge-popular">Popular</span>' : "";
  return (
    '<article class="tool-card" data-category="' + tool.category + '" data-status="' + tool.status + '" data-name="' + tool.name.toLowerCase() + '">' +
    '<div class="tool-card-icon">' + icon(tool.icon) + '</div>' +
    '<h3>' + tool.name + '</h3>' +
    '<p>' + tool.desc + '</p>' +
    '<div class="tool-card-meta">' + statusBadge + popularBadge + '<span class="badge badge-category">' + tool.category + '</span></div>' +
    '<a class="tool-card-link" href="' + BASE + tool.url + '">' + (tool.status === "soon" ? "View details" : "Open tool") + ' &rarr;</a>' +
    '</article>'
  );
}
function render(container, tools) {
  if (!tools.length) { container.innerHTML = '<div class="empty-state"><p>No tools match your search. Try a different keyword or category.</p></div>'; return; }
  container.innerHTML = tools.map(card).join("");
}
return { icon: icon, render: render };
})();
