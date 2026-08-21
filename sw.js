/* PixelForge AI - Service Worker
   Network-first for everything: every request always tries the live network
   first, so a fresh deploy is visible on the very next load with zero chance
   of a stale cache masking it. The cache is only ever used as a fallback -
   when the device is genuinely offline or the network request fails - which
   is what gives this app real offline support without risking the "stuck on
   old code" trap a cache-first strategy can cause. */
"use strict";

var CACHE_NAME = "pixelforge-ai-v5";
var CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./js/theme.js",
  "./js/components.js",
  "./js/main.js",
  "./js/tool-grid.js",
  "./js/tool-workspace.js",
  "./data/tools.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.map(function (url) {
          return fetch(url, { cache: "reload" })
            .then(function (response) {
              if (response && response.ok) return cache.put(url, response);
            })
            .catch(function () {
            });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("./index.html");
          return undefined;
        });
      })
  );
});
