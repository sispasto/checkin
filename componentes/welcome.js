class WelcomeComponent extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const containerSelector = this.getAttribute("container");
    const container = document.querySelector(containerSelector);

    if (!container) {
      console.error(`Contenedor no encontrado: ${containerSelector}`);
      return;
    }

    try {
      // 1. Cargamos el nuevo archivo welcome.html con cache-busting
      const response = await fetch(
        `view/welcome.html?v=${new Date().getTime()}`,
        { cache: "no-store" },
      );
      const htmlText = await response.text();

      const template = document.createElement("template");
      template.innerHTML = htmlText;

      // 2. Manejar scripts
      const scripts = template.content.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // 3. Renderizar contenido
      this.innerHTML = "";
      this.appendChild(template.content.cloneNode(true));

      // 4. Actualizar versión forzando el prefijo "Asist"
      const versionLabel = this.querySelector("#version-label");
      if (versionLabel) {
        versionLabel.textContent = `Asist v${this.versionApp || "1.0"}`;
      }

      // 5. Inyectar scripts dinámicos
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
      console.error("Error al cargar welcome.html:", error);
    }
  }

  set versionApp(value) {
    this._versionApp = value;
    const label = this.querySelector("#version-label");
    if (label) label.textContent = `Asist v${value}`;
  }

  get versionApp() {
    return this._versionApp;
  }
}

// Cambiamos el nombre de la etiqueta personalizada
customElements.define("welcome-component", WelcomeComponent);
