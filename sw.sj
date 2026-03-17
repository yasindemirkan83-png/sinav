self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('anfa-v1').then((cache) => cache.addAll([
      'index.html',
      'style.css',
      'app.js',
      'anfa.gif'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
