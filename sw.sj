self.addEventListener('install', (e) => {
  console.log('Servis işçisi yüklendi!');
});

self.addEventListener('fetch', (e) => {
  // Uygulamanın dosyaları internet yokken bile çekmesini sağlar
});

