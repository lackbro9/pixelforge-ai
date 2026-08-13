(function () {
  "use strict";
  var state = { tools: [], category: "all", query: "" };
  function applyFilters() {
    var q = state.query.trim().toLowerCase();
    return state.tools.filter(function (t) {
      var matchesCategory = state.category === "all" || t.category === state.category || (state.category === "popular" && t.popular);
      var matchesQuery = !q || t.name.toLowerCase().indexOf(q) !== -1 || t.desc.toLowerCase().indexOf(q) !== -1;
      return matchesCategory && matchesQuery;
    });
  }
  function render() {
    var grid = document.getElementById("home-tools-grid");
    if (!grid) return;
    window.PFToolGrid.render(grid, applyFilters());
  }
  function wireTabs() {
    var tabs = document.querySelectorAll(".filter-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        tab.setAttribute("aria-pressed", "true");
        state.category = tab.getAttribute("data-filter");
        render();
      });
    });
  }
  function wireSearch() {
    var input = document.getElementById("home-search-input");
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) { input.value = params.get("q"); state.query = params.get("q"); }
    input.addEventListener("input", function () { state.query = input.value; render(); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    wireTabs();
    wireSearch();
    fetch("/data/tools.json").then(function (r) { return r.json(); }).then(function (data) {
      state.tools = data;
      render();
    }).catch(function () {
      var grid = document.getElementById("home-tools-grid");
      if (grid) grid.innerHTML = '<div class="empty-state"><p>Tools could not be loaded right now. Please refresh the page.</p></div>';
    });
  });
})();