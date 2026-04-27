class RegistrarTerminalComponent extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    // Obtenemos el selector del contenedor principal (por defecto #App si no se provee)
    const containerSelector = this.getAttribute("container") || "#App";
    const container = document.querySelector(containerSelector);

    if (!container) {
      console.error(`Contenedor no encontrado: ${containerSelector}`);
      return;
    }

    try {
      // Cargamos el archivo HTML que creamos anteriormente
      const response = await fetch("view/registrarTerminal.html");
      if (!response.ok)
        throw new Error("No se pudo cargar registrarTerminal.html");

      const htmlText = await response.text();

      // Crear template para procesar el contenido
      const template = document.createElement("template");
      template.innerHTML = htmlText;

      // Extraer los scripts para que no se ejecuten automáticamente al insertar el HTML
      const scripts = template.content.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // Inyectar el HTML limpio en el cuerpo del Web Component
      this.innerHTML = "";
      this.appendChild(template.content.cloneNode(true));

      // Limpiar scripts dinámicos de navegaciones anteriores para evitar duplicidad de lógica
      container
        .querySelectorAll('script[data-dynamic="true"]')
        .forEach((s) => s.remove());

      // Inyectar y ejecutar los scripts extraídos de forma dinámica
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");

        if (oldScript.src) {
          // Si el script es una librería externa (como html5-qrcode)
          newScript.src = oldScript.src;
          newScript.async = false; // Importante para mantener el orden de ejecución
        } else {
          // Si es código inline (nuestra lógica nsTerminal)
          newScript.textContent = oldScript.textContent;
        }

        newScript.setAttribute("data-dynamic", "true");
        container.appendChild(newScript);
      });
    } catch (error) {
      console.error("Error al inicializar RegistrarTerminalComponent:", error);
      this.innerHTML = `<div class="alert alert-danger">Error al cargar el módulo de registro: ${error.message}</div>`;
    }
  }
}

// Registro del Custom Element
customElements.define("registrar-terminal", RegistrarTerminalComponent);
