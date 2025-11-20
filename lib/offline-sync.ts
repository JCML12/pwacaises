// Sistema de sincronización offline
const DB_NAME = 'medicamentos-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-changes';

interface PendingChange {
  id?: number;
  type: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body: any;
  timestamp: number;
  retries: number;
}

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function savePendingChange(change: Omit<PendingChange, 'id' | 'retries'>): Promise<number> {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const pendingChange: PendingChange = {
    ...change,
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const request = store.add(pendingChange);
    request.onsuccess = () => {
      resolve(request.result as number);
      // Registrar sync en background
      if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
        (navigator.serviceWorker.ready as Promise<ServiceWorkerRegistration>).then((registration) => {
          (registration as any).sync.register('sync-pending-changes').catch(() => {
            // Background Sync no disponible, se intentará en el próximo fetch
          });
        });
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingChange(id: number): Promise<void> {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function incrementRetry(id: number): Promise<void> {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const change = getRequest.result;
      if (change) {
        change.retries += 1;
        const putRequest = store.put(change);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function syncPendingChanges(): Promise<void> {
  if (!navigator.onLine) {
    return;
  }

  const changes = await getPendingChanges();
  if (changes.length === 0) return;

  for (const change of changes) {
    try {
      const response = await fetch(change.url, {
        method: change.type,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(change.body),
      });

      if (response.ok) {
        await removePendingChange(change.id!);
      } else if (response.status >= 500 && change.retries < 3) {
        // Reintentar en errores del servidor
        await incrementRetry(change.id!);
      } else if (response.status < 500) {
        // Errores del cliente (400, 401, etc.) no se reintentan
        await removePendingChange(change.id!);
      }
    } catch (error) {
      if (change.retries < 3) {
        await incrementRetry(change.id!);
      }
    }
  }
}

export async function fetchWithOfflineSupport(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Si está offline y es un POST/PUT/DELETE, guardar para sincronizar después
    if (!navigator.onLine && options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      const body = options.body ? JSON.parse(options.body as string) : null;
      await savePendingChange({
        type: options.method as 'POST' | 'PUT' | 'DELETE',
        url,
        body,
        timestamp: Date.now(),
      });

      // Devolver respuesta simulada exitosa
      return new Response(
        JSON.stringify({ 
          ok: true, 
          offline: true, 
          message: 'Cambio guardado localmente. Se sincronizará cuando haya conexión.' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    throw error;
  }
}

// Detectar cuando vuelve la conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingChanges();
  });
}

