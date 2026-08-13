(function () {
  "use strict";
  var STORAGE_KEY = "pf-theme";
  function getStoredPreference() { return localStorage.getItem(STORAGE_KEY) || "auto"; }
  function systemPrefersDark() { return window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function resolveTheme(pref) { if (pref === "auto") return systemPrefersDark() ? "dark" : "light"; return pref; }
  function applyTheme(pref) {
    var resolved = resolveTheme(pref);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-pref", pref);
    updateToggleUI(pref);
  }
  function updateToggleUI(pref) {
    var buttons = document.querySelectorAll("[data-theme-option]");
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-option") === pref;
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }
  function setPreference(pref) { localStorage.setItem(STORAGE_KEY, pref); applyTheme(pref); }
  function init() {
    applyTheme(getStoredPreference());
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-theme-option]");
      if (!btn) return;
      setPreference(btn.getAttribute("data-theme-option"));
    });
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        if (getStoredPreference() === "auto") applyTheme("auto");
      });
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();