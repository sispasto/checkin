const templateCache = {};
var arrayGlobal = []; //array de promotores
var folderPathIMG = ""; //variable que guarda id de carpeta donde se guardan las imagenes
var versionApp = localStorage.getItem("asist_app_version") || ""; //La version se debe cambiar en service-worker.js y main.js
let swRegistration = null; // 🔥 referencia global
let intervalSW = null;
let newVersionAvailable = null;
//Para Notificaciones push
const DB_NAME = "AsistenciaDB";
const STORE_NAME = "configuracion";

/* =========================
   GESTIÓN DE PUSH Y INDEXEDDB
========================= */

// Asegura que la DB y el Almacén existan
function inicializarIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
}

// Guarda el UUID en IndexedDB (Solo lo llamas en la terminal del ADMIN)
async function autorizarComoAdmin(uuid) {
  await inicializarIndexedDB();
  const db = await new Promise((res) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onsuccess = (e) => res(e.target.result);
  });
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(uuid, "uuid_cliente");
  console.log("Terminal autorizada localmente como Admin.");
}

/***************************************************/

// main.js - Función Global de Identificación de Hardware
async function obtenerUUIDHardwareGlobal() {
  const specs = {};
  try {
    // 1. Recolección de GPU
    const canvasGL = document.createElement("canvas");
    const gl =
      canvasGL.getContext("webgl") || canvasGL.getContext("experimental-webgl");

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      specs.gpu = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "Generic GPU";
    } else {
      specs.gpu = "Not Supported";
    }

    // 2. Hardware y Pantalla
    specs.cores = navigator.hardwareConcurrency || "N/A";
    specs.memory = navigator.deviceMemory
      ? `${navigator.deviceMemory}GB`
      : "N/A";
    specs.screen = `${window.screen.width}x${window.screen.height}`;
    specs.pixel_ratio = Math.round(window.devicePixelRatio || 1);
    specs.langs = navigator.language;
    specs.platform = navigator.platform;

    // 3. Generación de Canvas DNA (Huella gráfica de renderizado)
    const canvas2D = document.createElement("canvas");
    const ctx = canvas2D.getContext("2d");
    canvas2D.width = 200;
    canvas2D.height = 40;

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(10, 10, 50, 10);
    ctx.fillStyle = "#069";
    ctx.fillText("ASIST-2026-FIXED", 15, 12);

    // Guardamos la representación visual como base64
    specs.canvas_dna = canvas2D.toDataURL();

    // 4. Retorno puro de specs
    return {
      status: "ready",
      specs: specs,
    };
  } catch (e) {
    console.error("Error recolectando ingredientes de hardware:", e);
    return {
      status: "error",
      specs: null,
      message: e.message,
    };
  }
}

function registrarServidor() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const registroServidor = document.createElement("registrar-servidor");
  registroServidor.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(registroServidor);
}

function registrarTerminal() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const registroTerminal = document.createElement("registrar-terminal");
  registroTerminal.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(registroTerminal);
}

function generarToken() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmGenerarToken = document.createElement("generar-token-component");
  frmGenerarToken.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmGenerarToken);
}

function marcarAsistencia() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmMarcarAsistencia = document.createElement(
    "marcar-asistencia-component",
  );
  frmMarcarAsistencia.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmMarcarAsistencia);
}

function crearPlanilla() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmCrearPlanilla = document.createElement("crear-planilla-component");
  frmCrearPlanilla.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmCrearPlanilla);
}

function excluirGuias() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmExcluirGuias = document.createElement("excluir-guias-component");
  frmExcluirGuias.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmExcluirGuias);
}

function cerrarPlanilla() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmCerrarplanilla = document.createElement("cerrar-planilla-component");
  frmCerrarplanilla.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmCerrarplanilla);
}

function getPlanillasMensajero() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmPlanillasMensajero = document.createElement("planillas-mensajero");
  frmPlanillasMensajero.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmPlanillasMensajero);
}

function consultarPlanillas() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmConsultarPlanillas = document.createElement(
    "consultar-planillas-component",
  );
  frmConsultarPlanillas.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmConsultarPlanillas);
}

function entregarDevoluciones() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmEntregarDevoluciones = document.createElement(
    "recepcion-devolucion-component",
  );
  frmEntregarDevoluciones.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmEntregarDevoluciones);
}

function crearPlanillaDevolucion() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmCrearPlanillaDevolucion = document.createElement(
    "planilla-devolucion-component",
  );
  frmCrearPlanillaDevolucion.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmCrearPlanillaDevolucion);
}

function crearPlanillaDevolucion() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmCrearPlanillaDevolucion = document.createElement(
    "planilla-devolucion-component",
  );
  frmCrearPlanillaDevolucion.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmCrearPlanillaDevolucion);
}

function anularPlanilla() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const frmAnularPlanilla = document.createElement("anular-planilla-component");
  frmAnularPlanilla.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  main.appendChild(frmAnularPlanilla);
}

function getHome() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  // 🔥 SIEMPRE leer la versión más reciente
  versionApp = localStorage.getItem("asist_app_version") || "";
  const componente = document.createElement("welcome-component");
  componente.setAttribute("container", "#App");
  componente.versionApp = versionApp;

  main.appendChild(componente);
}

function acercade() {
  let main = document.getElementById("App");
  removeALLChilds(main);
  const componente = document.createElement("acercade-component");
  componente.setAttribute("container", "#App"); // <-- aquí pasas el parámetro
  componente.versionApp = versionApp; // <-- Aquí se pasa la versión antes de renderizar
  componente.fecInicial = "19/01/2026"; // <-- Aquí se pasa la fecha inicial antes de renderizar
  componente.fecFinal = "19/01/2027"; // <-- Aquí se pasa la fecha final antes de renderizar
  main.appendChild(componente);
  /******************************************************** */
}

function crearLoader() {
  eliminarLoader();
  let containerloader = document.createElement("div");
  containerloader.id = "containerloader";
  let loader = document.createElement("div");
  loader.id = "loader";
  for (let i = 0; i < 4; i++) {
    loader.appendChild(document.createElement("div"));
  }
  loader.classList.add("lds-roller");
  containerloader.appendChild(loader);
  document.body.appendChild(containerloader);
}

function eliminarLoader() {
  let loader = document.getElementById("containerloader");
  if (loader) loader.remove();
}

function cerrarModalesActivos() {
  const allModals = document.querySelectorAll(".modal.show");
  allModals.forEach((modal) => {
    const instance = bootstrap.Modal.getInstance(modal);
    if (instance) instance.hide();
  });
}

function removeALLChilds(parentNode) {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild);
  }
}

function alertSMS(texto, duracion = 10000) {
  // Por defecto 5 segundos
  const myToast = document.getElementById("liveToast");
  const smsToast = myToast.querySelector(".toast-body");

  smsToast.innerHTML = texto;

  const container = myToast.closest(".position-fixed");
  if (container) {
    container.style.zIndex = "1090";
  }

  // Pasamos las opciones al inicializar el Toast
  const toast = new bootstrap.Toast(myToast, {
    autohide: true, // Se oculta solo
    delay: duracion, // Tiempo en milisegundos
  });

  toast.show();
}

/* =========================
   AUTO UPDATE SW
========================= */
function iniciarAutoUpdateSW() {
  if (intervalSW) return;

  intervalSW = setInterval(() => {
    if (swRegistration) {
      //console.log("🔄 Buscando actualización del SW...");
      swRegistration.update();
    }
  }, 300000); // detecta versiones cada 30 minutos (1800000 ms) 30segundos 300000
}

/* =========================
   BOTÓN ACTUALIZACIÓN
========================= */
function mostrarBotonActualizacion() {
  let btn = document.getElementById("btn-update-app");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btn-update-app";

    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "9999";
    btn.style.padding = "10px 15px";
    btn.style.background = "#0d6efd";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";

    document.body.appendChild(btn);
  }

  btn.innerText = newVersionAvailable
    ? `Actualizar a versión ${newVersionAvailable}`
    : "Nueva versión disponible";

  btn.onclick = () => {
    if (swRegistration && swRegistration.waiting) {
      // 🔥 AQUÍ recién aceptas la nueva versión
      if (newVersionAvailable) {
        localStorage.setItem("asist_app_version", newVersionAvailable);
      }

      swRegistration.waiting.postMessage({ action: "SKIP_WAITING" });
    }
  };
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async function () {
  // Inicializamos la DB al arrancar para que el SW no falle al intentar abrirla
  inicializarIndexedDB().catch(console.error);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js", {
        // Al usar "./" buscamos en la carpeta actual, sin importar el dominio
        scope: "/checkin/",
        updateViaCache: "none",
      })
      .then((reg) => {
        swRegistration = reg;

        // 🔥 iniciar revisión automática
        iniciarAutoUpdateSW();

        // 🔥 SIEMPRE obtener versión (incluye primera carga)
        // En lugar de llamar a ready inmediatamente, espera a que el SW esté activo
        navigator.serviceWorker.ready.then((regReady) => {
          // Solo enviamos el mensaje si realmente hay un SW controlando la página
          if (regReady.active && navigator.serviceWorker.controller) {
            regReady.active.postMessage("GET_VERSION");
          }
        });

        // 🔥 si ya hay una versión en espera
        if (reg.waiting && navigator.serviceWorker.controller) {
          //console.log("SW ya estaba esperando");
          mostrarBotonActualizacion();
        }

        // 🔥 detectar nueva versión
        reg.onupdatefound = () => {
          const newSW = reg.installing;
          if (!newSW) return;

          newSW.onstatechange = () => {
            if (newSW.state === "installed") {
              // Solo si ya hay una app corriendo (no primera instalación)
              if (navigator.serviceWorker.controller) {
                console.log("Nueva versión disponible");

                // 🔥 pedir versión del NUEVO SW
                newSW.postMessage("GET_VERSION");

                if (reg.waiting) {
                  mostrarBotonActualizacion();
                }
              }
            }
          };
        };
      })
      .catch((error) => console.error("Error al registrar el SW:", error));

    // 🔥 recibir versión
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.type === "VERSION") {
        if (swRegistration && swRegistration.waiting) {
          // 🔥 nueva versión (NO aplicar aún)
          newVersionAvailable = event.data.version;
          //console.log("Nueva versión detectada:", newVersionAvailable);
          mostrarBotonActualizacion();
        } else {
          // 🔥 versión actual activa
          versionApp = event.data.version;
          localStorage.setItem("asist_app_version", versionApp);

          // 🔥 actualizar UI si estás en home
          const label = document.getElementById("version-label");
          if (label) {
            label.textContent = `NovaEnvios v${versionApp}`;
          }
        }
      }
    });

    // 🔥 recargar SOLO cuando usuario acepta actualización
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    // 🔥 revisar actualización al volver a la pestaña
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (swRegistration) {
          //console.log("Validando actualizaciones...");
          swRegistration.update();
        }
      }
    });
  }

  getHome();
});
