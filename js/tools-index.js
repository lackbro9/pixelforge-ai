(function () {
  "use strict";
  var grid = document.getElementById("index-tools-grid");
  if (!grid) return;
  var fixedCategory = grid.getAttribute("data-fixed-category");
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").toLowerCase();
  var activeTab = "all";

  function apply(tools) {
    return tools.filter(function (t) {
      var catOk = fixedCategory ? t.category === fixedCategory : (activeTab === "all" || t.category === activeTab || (activeTab === "popular" && t.popular));
      var qOk = !query || t.name.toLowerCase().indexOf(query) !== -1 || t.desc.toLowerCase().indexOf(query) !== -1;
      return catOk && qOk;
    });
  }

  fetch("/data/tools.json").then(function (r) { return r.json(); }).then(function (data) {
    function render() { window.PFToolGrid.render(grid, apply(data)); }
    render();
    document.querySelectorAll(".filter-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".filter-tab").forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        tab.setAttribute("aria-pressed", "true");
        activeTab = tab.getAttribute("data-filter");
        render();
      });
    });
    var searchInput = document.getElementById("index-search-input");
    if (searchInput) {
      searchInput.value = params.get("q") || "";
      searchInput.addEventListener("input", function () { query = searchInput.value.toLowerCase(); render(); });
    }
  }).catch(function () {
    grid.innerHTML = '<div class="empty-state"><p>Tools could not be loaded right now. Please refresh the page.</p></div>';
  });
})();