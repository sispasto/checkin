class DesvincularTerminalComponent extends HTMLElement {
  constructor() {
    super();
    this._versionApp = "1.0";
  }

  async connectedCallback() {
    const containerSelector = this.getAttribute("container");
    const container = document.querySelector(containerSelector);

    if (!container) {
      console.error(`Contenedor no encontrado: ${containerSelector}`);
      return;
    }

    try {
      // 1. Cargamos el archivo desvincularterminal.html con cache-busting
      const response = await fetch(
        `view/desvincularterminal.html?v=${new Date().getTime()}`,
        { cache: "no-store" },
      );
      const htmlText = await response.text();

      const template = document.createElement("template");
      template.innerHTML = htmlText;

      // 2. Manejar scripts internos de la vista
      const scripts = template.content.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // 3. Renderizar contenido HTML y estilos CSS en el DOM del componente
      this.innerHTML = "";
      this.appendChild(template.content.cloneNode(true));

      // 4. Actualizar versión si existe la etiqueta en la vista
      const versionLabel = this.querySelector("#version-label");
      if (versionLabel) {
        versionLabel.textContent = `Checkin v${this.versionApp}`;
      }

      // 5. Limpiar scripts dinámicos previos en el contenedor global e inyectar los nuevos
      container
        .querySelectorAll('script[data-dynamic="true"]')
        .forEach((s) => s.remove());

      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        newScript.setAttribute("data-dynamic", "true");
        container.appendChild(newScript);
      });
    } catch (error) {
      console.error("Error al cargar desvincularterminal.html:", error);
    }
  }

  set versionApp(value) {
    this._versionApp = value;
    const label = this.querySelector("#version-label");
    if (label) label.textContent = `Checkin v${value}`;
  }

  get versionApp() {
    return this._versionApp;
  }
}

// Registro del elemento personalizado con la etiqueta correspondiente
customElements.define(
  "desvincular-terminal-component",
  DesvincularTerminalComponent,
);
