/* PixelForge AI - Service Worker
   Deliberately minimal: this app is under active development, so the
   service worker must never be able to trap a device on old code.

   It only caches a small set of static, rarely-changing assets (icons,
   manifest) for offline use. HTML, CSS and JS are NEVER intercepted or
   cached here - those always go straight to the network, so a fresh
   deploy is visible on the very next load with zero chance of a stale
   cache masking it. */
"use strict";

var CACHE_NAME = "pixelforge-ai-v4";
var STATIC_ASSETS = [
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Only these extensions are ever allowed to be served from cache.
var CACHEABLE_RE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i;

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        STATIC_ASSETS.map(function (url) {
          return fetch(url, { cache: "reload" })
            .then(function (response) {
              if (response && response.ok) return cache.put(url, response);
            })
            .catch(function () {
              /* Ignore individual asset failures so install never hard-fails */
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

  // Only ever consider same-origin GET requests; everything else (including
  // all navigations, HTML, CSS and JS) passes straight through untouched.
  if (
    request.method !== "GET" ||
    request.mode === "navigate" ||
    new URL(request.url).origin !== self.location.origin ||
    !CACHEABLE_RE.test(new URL(request.url).pathname)
  ) {
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
        return caches.match(request);
      })
  );
});
