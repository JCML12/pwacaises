const CACHE_NAME = 'medicamentos-v3';
const STATIC_CACHE_NAME = 'medicamentos-static-v3';
const API_CACHE_NAME = 'medicamentos-api-v3';

// INSTALL - Cachea recursos estáticos
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activa el nuevo service worker inmediatamente
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        // Cachear solo recursos estáticos que siempre están disponibles
        return cache.addAll([
          '/manifest.json',
        ]).catch((err) => {
          console.log('Error cacheando recursos estáticos:', err);
        });
      })
  );
});

// ACTIVATE - Limpia caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Toma control de todas las páginas
    })
  );
});

// SYNC - Sincronizar cambios pendientes cuando vuelve la conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(syncPendingChanges());
  }
});

// Función para sincronizar cambios pendientes
async function syncPendingChanges() {
  try {
    // Notificar a todos los clientes que sincronicen
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_PENDING_CHANGES' });
    });
  } catch (error) {
    console.error('Error en sync:', error);
  }
}

// FETCH - Estrategia mejorada para offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // NO interceptar conexiones WebSocket (para HMR de Next.js)
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // NO interceptar solicitudes de desarrollo de Next.js
  if (url.pathname.includes('/_next/webpack-hmr') || 
      url.pathname.includes('/_next/static/chunks/webpack') ||
      url.pathname.includes('/_next/static/development')) {
    return;
  }

  // Para APIs: siempre usar red (no cachear)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Para páginas y recursos estáticos: Network First con fallback a cache
  event.respondWith(handlePageRequest(request));
});

// Manejar requests a APIs - siempre usar red
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Si falla la red, para POST/PUT/DELETE guardar para sync
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const body = await request.clone().json().catch(() => null);
      
      // Notificar al cliente que guarde el cambio
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SAVE_PENDING_CHANGE',
          data: {
            method: request.method,
            url: request.url,
            body: body,
          },
        });
      });

      // Devolver respuesta exitosa simulada
      return new Response(
        JSON.stringify({
          ok: true,
          offline: true,
          message: 'Cambio guardado localmente. Se sincronizará cuando haya conexión.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Para GET, devolver error
    return new Response(
      JSON.stringify({ error: 'Sin conexión a internet', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Manejar requests de páginas - Network First con fallback a cache
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Intentar red primero (Network First)
    const networkResponse = await fetch(request);
    // Solo cachear respuestas exitosas y GET requests
    if (networkResponse.status === 200 && request.method === 'GET') {
      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return networkResponse;
  } catch (error) {
    // Si falla la red, buscar en cache (fallback)
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache y es una navegación, devolver página offline
    if (request.mode === 'navigate') {
      const indexPage = await cache.match('/');
      if (indexPage) {
        return indexPage;
      }
      return new Response('Sin conexión', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    return new Response('Recurso no disponible offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}