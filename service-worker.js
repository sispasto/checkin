const APP_VERSION = "1.7"; // Subimos versión por el cambio estructural
const CACHE_NAME = `asist-app-cache-v${APP_VERSION}`;

// --- LÓGICA DE NOTIFICACIONES SIMPLIFICADA ---

async function procesarNotificacionPush(event) {
  let data = {
    title: "SISTEMA DE ASISTENCIA",
    body: "Nueva novedad registrada",
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Error parseando JSON del Push", e);
  }

  const options = {
    body: data.body,
    icon: "/checkin/assets/icon_push-192x192.png",
    badge: "/checkin/assets/badge.png",
    vibrate: [300, 150, 300, 150, 500],
    tag: "Asistencia-alerta",
    renotify: true,
    requireInteraction: true, // Se mantiene hasta que el usuario la gestione
    data: {
      url: data.url || "/checkin/index.html",
    },
  };

  return self.registration.showNotification(data.title, options);
}

// --- EVENTOS DEL SERVICE WORKER ---

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/checkin/",
        "/checkin/index.html",
        "/checkin/css/home.css",
        "/checkin/js/main.js",
        "/checkin/componentes/index.js",
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

// ESCUCHA DE PUSH (Ya no valida admin, confía en el servidor)
self.addEventListener("push", (event) => {
  event.waitUntil(procesarNotificacionPush(event));
});

// CLICK EN NOTIFICACIÓN
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow(event.notification.data.url);
      }),
  );
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
    event.source.postMessage({ type: "VERSION", version: APP_VERSION });
  }
  if (event.data?.action === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
