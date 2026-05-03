export const MENUS = {
  // MENU POR DEFECTO (INVITADO)
  // MENU POR DEFECTO (Dinámico según vinculación)
  DEFAULT: () => {
    const marcaVinculado = btoa("vnc_active_Dispositivo vinculado");
    const estaVinculado = localStorage.getItem("asist_vnc") === marcaVinculado;

    // Obtenemos el tipo de Hardware (leído como string del localStorage)
    // Si es "false" -> Es PC/Servidor
    // Si es "true" -> Es Celular
    const esCelular = localStorage.getItem("tipoHW") === "true";

    // Item de autenticación (siempre visible)
    const itemAutenticar = `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="showLoginModal()">
          <i class="bi bi-person-lock"></i> Autenticarse
        </a>
      </li>`;

    /** * Lógica del Item QR:
     * 1. Debe estar vinculado (estaVinculado)
     * 2. NO debe ser celular (!esCelular), es decir, debe ser Servidor (tipoHW: false)
     */
    const itemQR =
      estaVinculado && !esCelular
        ? `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="generarToken()">
          <i class="bi bi-qr-code-scan"></i> Generar QR para Asistencia
        </a>
      </li>`
        : "";

    return `
      <ul class="navbar-nav flex-grow-1 pe-3">
        <li class="nav-item">
          <a class="nav-link active" href="#" onclick="Toolbar.ejecutarAccion(getHome)">
            <i class="bi bi-house"></i> Inicio
          </a>
        </li>
        ${itemAutenticar}
        ${itemQR}
      </ul>`;
  },

  // ROL PROMOTOR
  PROMOTOR: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(getHome)">
          <i class="bi bi-house-door"></i> <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(registrarTerminal)">
          <i class="bi bi-search"></i> <span>Registrar celular</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(marcarAsistencia)">
          <i class="bi bi-search"></i> <span>Registrar Asistencia</span>
        </a>
      </li>
      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-key"></i> <span>Cambiar Clave</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-box-arrow-right"></i> <span>Salir</span>
        </a>
      </li>
    </ul>`,

  // ROL COORDINADOR
  COORDINADOR: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(getHome)">
          <i class="bi bi-house-door text-primary"></i> <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item mb-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(registrarTerminal)">
          <i class="bi bi-people"></i> <span>Registrar dispositivo</span>
        </a>
      </li>    
      <li class="nav-item mb-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(reportePromotores)">
          <i class="bi bi-people"></i> <span>Reporte de promotores</span>
        </a>
      </li> 
      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-shield-lock"></i> Seguridad
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-power"></i> <span>Finalizar Sesión</span>
        </a>
      </li>
    </ul>`,

  // ROL ADMINISTRADOR
  ADMIN: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(getHome)">
          <i class="bi bi-house-door text-primary"></i> <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item mb-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(registrarServidor)">
          <i class="bi bi-people"></i> <span>Registrar servidor</span>
        </a>
      </li>     

      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="Toolbar.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-shield-lock"></i> Seguridad
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-power"></i> <span>Finalizar Sesión</span>
        </a>
      </li>
    </ul>`,
};

const MenuManager = {
  // Manejo de submenús dentro del Offcanvas
  toggleSubMenu: (id, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const elemento = document.getElementById(id);
    if (elemento) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(elemento);
      bsCollapse.toggle();
    }
  },

  // Ejecuta la acción y cierra el menú lateral
  ejecutarAccion: (callback) => {
    if (typeof callback === "function") callback();
    const el = document.getElementById("offcanvasDarkNavbar");
    const instance = bootstrap.Offcanvas.getInstance(el);
    if (instance) instance.hide();
  },

  // Método principal para renderizar el menú por ROL
  mostrarMenuPorRol: (rol, nombreUsuario = "") => {
    const contenedor = document.querySelector(
      "#offcanvasDarkNavbar .offcanvas-body",
    );
    const tituloMenu = document.getElementById("offcanvasDarkNavbarLabel");
    const textUser = document.getElementById("textUser");

    if (!contenedor) return;

    // 1. Actualizar el Navbar Brand (Texto visible junto al botón de menú)
    if (textUser) {
      textUser.innerHTML = `<i class="bi bi-person-circle me-2"></i> ${nombreUsuario.toUpperCase()}`;

      // --- PREVENCIÓN DE DESBORDE ---
      textUser.style.fontSize = "0.95rem"; // Tamaño sutilmente más pequeño
      textUser.style.maxWidth = "160px"; // Límite de ancho para no empujar el botón
      textUser.style.whiteSpace = "nowrap"; // Prohibir saltos de línea
      textUser.style.overflow = "hidden"; // Ocultar lo que exceda el ancho
      textUser.style.textOverflow = "ellipsis"; // Agregar "..." si es muy largo
      textUser.style.display = "inline-block"; // Necesario para que maxWidth funcione
      textUser.style.verticalAlign = "middle";
      textUser.style.letterSpacing = "0.5px";
    }

    // 2. Actualizar el título interno del Offcanvas (Cuando el menú ya está abierto)
    if (tituloMenu) {
      tituloMenu.innerHTML = `<i class="bi bi-person-circle me-2"></i> ${nombreUsuario.toUpperCase()}`;
      tituloMenu.style.fontSize = "1.1rem";
      tituloMenu.style.letterSpacing = "1px";
      // Aquí no limitamos el ancho porque hay espacio de sobra
    }

    // 3. Inyectar el HTML del menú según el rol
    const r = Number(rol);
    if (r === 1) contenedor.innerHTML = MENUS.PROMOTOR;
    else if (r === 2) contenedor.innerHTML = MENUS.COORDINADOR;
    else if (r === 3) contenedor.innerHTML = MENUS.ADMIN;
    else MenuManager.mostrarMenuInvitado();
  },

  // Método para el estado inicial o cerrar sesión
  mostrarMenuInvitado: () => {
    const contenedor = document.querySelector(
      "#offcanvasDarkNavbar .offcanvas-body",
    );
    const tituloMenu = document.getElementById("offcanvasDarkNavbarLabel");
    const textUser = document.getElementById("textUser");

    if (tituloMenu) {
      tituloMenu.innerHTML = `<i class="bi bi-building-fill me-2"></i> ASIST`;
      tituloMenu.style.fontSize = "1rem";
    }

    if (contenedor) contenedor.innerHTML = MENUS.DEFAULT();

    if (textUser) {
      textUser.innerHTML = `<i class="bi bi-building-fill me-2"></i> ASIST`;
      textUser.style.fontSize = "1rem";
      textUser.style.maxWidth = "none"; // Sin límite para el nombre de la app
    }
  },
};

// EXPOSICIÓN GLOBAL
window.Toolbar = MenuManager;
