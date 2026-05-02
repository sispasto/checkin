const APP_VERSION = "3.5";
const CACHE_NAME = `app-cache-v${APP_VERSION}`;
const DB_NAME = "AsistenciaDB";
const STORE_NAME = "configuracion";

// --- LÓGICA DE NOTIFICACIONES Y INDEXEDDB ---

async function esTerminalAdmin() {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => resolve(false);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve(false);
        return;
      }
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getUuid = store.get("uuid_cliente");

      getUuid.onsuccess = () => resolve(!!getUuid.result);
      getUuid.onerror = () => resolve(false);
    };
  });
}

async function procesarNotificacionPush(event) {
  // 1. Validar si es Admin antes de hacer nada
  const isAdmin = await esTerminalAdmin();

  if (!isAdmin) {
    console.log("Push recibido: Terminal no autorizada. Silenciando...");
    return;
  }

  // 2. Extraer datos (Supabase enviará un JSON)
  let data = { title: "Marcación", body: "Nueva asistencia registrada" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Error parseando JSON del Push", e);
  }

  const options = {
    body: data.body,
    icon: "/checkin/assets/icon-192x192.png", // ✅ ruta completa
    badge: "/checkin/assets/badge.png", // ✅ ruta completa
    vibrate: [200, 100, 200],
    tag: "asistencia-alerta",
    renotify: true,
    data: {
      url: data.url || "/checkin/index.html", // ✅ también aquí
    },
  };

  return self.registration.showNotification(data.title, options);
}

// --- EVENTOS DEL SERVICE WORKER ---

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./css/home.css",
        "./css/loader.css",
        "./js/main.js",
        "./componentes/index.js",
      ]);
    }),
  );
});

self.addEventListener("activate", (e) => {
  console.log("SW activado - versión", APP_VERSION);
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// ESCUCHA DE PUSH
self.addEventListener("push", (event) => {
  event.waitUntil(procesarNotificacionPush(event));
});

// CLICK EN NOTIFICACIÓN
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request)
        .then((networkRes) => {
          if (
            !networkRes ||
            networkRes.status !== 200 ||
            networkRes.type === "opaque"
          ) {
            return networkRes;
          }

          const responseClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });

          return networkRes;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "GET_VERSION") {
    event.source.postMessage({
      type: "VERSION",
      version: APP_VERSION,
    });
  }

  if (event.data?.action === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
