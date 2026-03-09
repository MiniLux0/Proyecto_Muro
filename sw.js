/* ══════════════════════════════════════════
   PROYECTO MURO — sw.js  (Service Worker)
   ══════════════════════════════════════════ */

const CACHE  = 'muro-v2';
const BASE   = self.registration.scope.replace(self.location.origin, '').replace(/\/$/, '');
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/css/estilos.css',
  BASE + '/js/main.js',
  BASE + '/js/anuncios.js',
  BASE + '/manifest.json',
  BASE + '/images/favicon.png',
  BASE + '/images/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap'
];

/* Instalar y cachear assets críticos */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* Limpiar caches viejos */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Estrategia: Network first, cache fallback */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
