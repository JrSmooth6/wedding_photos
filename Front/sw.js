self.addEventListener('install', (e) => {
    console.log('[ServiceWorker] Install');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (e) => {
    console.log('[ServiceWorker] Activate');
  });
  
  self.addEventListener('fetch', function(event) {
    // Pour que tout passe à travers le réseau (pas de cache pour les photos)
    event.respondWith(fetch(event.request));
  });
  