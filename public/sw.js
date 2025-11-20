
const CACHE_NAME = 'medicamentos-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js',
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, lo devuelve
        if (response) {
          return response;
        }
        
        // Si no está en cache, lo busca en la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Guarda en cache para la próxima vez
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Si falla la red, devuelve una respuesta por defecto
            return new Response('Offline');
          });
      })
  );
});