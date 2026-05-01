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
          <a class="nav-link active" href="#" onclick="NovaMenu.ejecutarAccion(getHome)">
            <i class="bi bi-house"></i> Inicio
          </a>
        </li>
        ${itemAutenticar}
        ${itemQR}
      </ul>`;
  },

  // ROL EMPRESA
  EMPRESA: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(getHome)">
          <i class="bi bi-house-door text-primary"></i> <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item mb-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(registrarServidor)">
          <i class="bi bi-people"></i> <span>Registrar servidor</span>
        </a>
      </li>     

      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-shield-lock"></i> Seguridad
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-power"></i> <span>Finalizar Sesión</span>
        </a>
      </li>
    </ul>`,

  // ROL MENSAJERO
  MENSAJERO: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(getHome)">
          <i class="bi bi-house-door"></i> <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(registrarTerminal)">
          <i class="bi bi-search"></i> <span>Registrar celular</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(marcarAsistencia)">
          <i class="bi bi-search"></i> <span>Registrar Asistencia</span>
        </a>
      </li>
      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-key"></i> <span>Cambiar Clave</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-box-arrow-right"></i> <span>Salir</span>
        </a>
      </li>
    </ul>`,

  // ROL ADMINISTRADOR
  ADMIN: `
    <ul class="navbar-nav flex-grow-1 pe-3 custom-menu">
      <li class="nav-item mb-2">
        <a class="nav-link active d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(getHome)">
          <i class="bi bi-shield-check text-success"></i> <span>Inicio (Panel Admin)</span>
        </a>
      </li>
      <li class="nav-item menu-section">
        <a class="nav-link section-header d-flex justify-content-between align-items-center" 
           href="javascript:void(0)" onclick="NovaMenu.toggleSubMenu('catAdminConfig', event)">
          <span class="d-flex align-items-center gap-2">
            <i class="bi bi-gear-fill"></i> Configuración
          </span>
          <i class="bi bi-chevron-right chevron-icon" style="font-size: 0.7rem;"></i>
        </a>
        <div class="collapse" id="catAdminConfig">
          <ul class="list-unstyled submenu-list ms-3 border-start border-secondary-subtle">
            <li><a class="nav-link" href="#" onclick="NovaMenu.ejecutarAccion(gestionarEmpresas)">Gestionar Empresas</a></li>
            <li><a class="nav-link" href="#" onclick="NovaMenu.ejecutarAccion(configurarTarifas)">Maestro de Tarifas</a></li>
            <li><a class="nav-link" href="#" onclick="NovaMenu.ejecutarAccion(gestionarZonas)">Zonas y Cobertura</a></li>
          </ul>
        </div>
      </li>
      <li class="nav-item menu-section mt-2">
        <a class="nav-link section-header d-flex justify-content-between align-items-center" 
           href="javascript:void(0)" onclick="NovaMenu.toggleSubMenu('catAdminAudit', event)">
          <span class="d-flex align-items-center gap-2">
            <i class="bi bi-journal-text"></i> Auditoría Global
          </span>
          <i class="bi bi-chevron-right chevron-icon" style="font-size: 0.7rem;"></i>
        </a>
        <div class="collapse" id="catAdminAudit">
          <ul class="list-unstyled submenu-list ms-3 border-start border-secondary-subtle">
            <li><a class="nav-link" href="#" onclick="NovaMenu.ejecutarAccion(verLogsSistema)">Logs del Sistema</a></li>
            <li><a class="nav-link" href="#" onclick="NovaMenu.ejecutarAccion(reporteGeneralVentas)">Reporte Consolidado</a></li>
          </ul>
        </div>
      </li>
      <li class="nav-item mt-4 border-top border-secondary pt-3">
        <a class="nav-link d-flex align-items-center gap-2" href="#" onclick="NovaMenu.ejecutarAccion(showChangePasswordModal)">
          <i class="bi bi-lock"></i> Seguridad Admin
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
          <i class="bi bi-power"></i> <span>Cerrar Sesión</span>
        </a>
      </li>
    </ul>`,
};

const MenuManager = {
  // CORRECCIÓN: Definición limpia de funciones sin prefijos
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

  ejecutarAccion: (callback) => {
    if (typeof callback === "function") callback();
    const el = document.getElementById("offcanvasDarkNavbar");
    const instance = bootstrap.Offcanvas.getInstance(el);
    if (instance) instance.hide();
  },

  mostrarMenuPorRol: (rol, nombreUsuario = "") => {
    const contenedor = document.querySelector(
      "#offcanvasDarkNavbar .offcanvas-body",
    );
    const tituloMenu = document.getElementById("offcanvasDarkNavbarLabel");
    const textUser = document.getElementById("textUser"); // <--- Seleccionamos el elemento del navbar

    if (!contenedor) return;

    // 1. Actualizar el Navbar Brand (el que querías editar)
    if (textUser) {
      // Si hay nombre lo ponemos, si no, dejamos el nombre de la app
      textUser.textContent = nombreUsuario || "";
      textUser.innerHTML = `<i class="bi bi-person-circle me-2"></i> ${nombreUsuario.toUpperCase()}`;
      textUser.style.fontSize = "1rem";
      textUser.style.letterSpacing = "1px";
    }

    // 2. Actualizar el título interno del Offcanvas (opcional, por estética)

    // En mostrarMenuPorRol:
    if (tituloMenu) {
      tituloMenu.innerHTML = `<i class="bi bi-person-circle me-2"></i> ${nombreUsuario.toUpperCase()}`;
      tituloMenu.style.fontSize = "1rem";
      tituloMenu.style.letterSpacing = "1px";
    }

    // 3. Inyectar el HTML del menú según el rol
    const r = Number(rol);
    if (r === 1) contenedor.innerHTML = MENUS.EMPRESA;
    else if (r === 2) contenedor.innerHTML = MENUS.MENSAJERO;
    else if (r === 3) contenedor.innerHTML = MENUS.ADMIN;
    else MenuManager.mostrarMenuInvitado();
  },

  mostrarMenuInvitado: () => {
    const contenedor = document.querySelector(
      "#offcanvasDarkNavbar .offcanvas-body",
    );

    const tituloMenu = document.getElementById("offcanvasDarkNavbarLabel");

    if (tituloMenu) {
      tituloMenu.innerHTML = `<i class="bi bi-person-circle me-2"></i> ASIST`;
      tituloMenu.style.fontSize = "1rem";
      tituloMenu.style.letterSpacing = "1px";
    }

    if (contenedor) contenedor.innerHTML = MENUS.DEFAULT();

    const textUser = document.getElementById("textUser");
    if (textUser) {
      // Si hay nombre lo ponemos, si no, dejamos el nombre de la app
      textUser.innerHTML = `<i class="bi bi-building-fill me-2"></i> ASIST`;
      textUser.style.fontSize = "1rem";
      textUser.style.letterSpacing = "1px";
    }
  },
};

// EXPOSICIÓN GLOBAL
window.NovaMenu = MenuManager;
