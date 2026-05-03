const APP_VERSION = "2.5"; // Subimos versión por el cambio estructural
const CACHE_NAME = `asist-app-cache-v${APP_VERSION}`;

// --- LÓGICA DE NOTIFICACIONES SIMPLIFICADA ---

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
  // NO uses una función externa async aparte si no retorna la promesa correctamente
  event.waitUntil(procesarNotificacionPush(event));
});

async function procesarNotificacionPush(event) {
  let data = { title: "SISTEMA", body: "Novedad" };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    console.error(e);
  }

  // IMPORTANTE: El 'tag' es lo que agrupa y evita duplicados
  const options = {
    body: data.body,
    icon: "/checkin/assets/icon_push-192x192.png",
    badge: "/checkin/assets/badge.png",
    tag: "reporte-asistencia", // <--- Mismo tag siempre
    renotify: true,
    data: {
      url: data.url || "/checkin/index.html",
    },
  };

  // ESTA LÍNEA es la que calla a Chrome
  return self.registration.showNotification(data.title, options);
}

// CLICK EN NOTIFICACIÓN - Versión Corregida
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Obtenemos la URL que mandó la Edge Function
  const urlDestino = event.notification.data?.url || "/checkin/index.html";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si la app ya está abierta en alguna pestaña
        for (const client of clientList) {
          // Verificamos si es nuestra App (ajusta el path si es necesario)
          if (client.url.includes("/checkin/") && "navigate" in client) {
            // ¡ESTA ES LA MAGIA! Forzamos a la pestaña abierta a ir al reporte
            client.navigate(urlDestino);
            return client.focus();
          }
        }
        // Si la app no estaba abierta, la abre desde cero
        if (clients.openWindow) {
          return clients.openWindow(urlDestino);
        }
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
