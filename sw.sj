self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Sadece sorular.json hariç diğerlerini cache'den çekmeye çalış
    if (e.request.url.includes('sorular.json')) {
        e.respondWith(fetch(e.request));
    } else {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    }
});
