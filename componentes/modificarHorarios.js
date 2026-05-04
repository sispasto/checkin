class ModificarHorariosComponent extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const containerSelector = this.getAttribute("container") || "#App";
    const container = document.querySelector(containerSelector);

    if (!container) return;

    try {
      const response = await fetch("view/modificarHorarios.html");
      if (!response.ok)
        throw new Error("No se pudo cargar modificarHorarios.html");

      const htmlText = await response.text();
      const template = document.createElement("template");
      template.innerHTML = htmlText;

      // Extraer y procesar scripts como en tu componente original
      const scripts = template.content.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      this.innerHTML = "";
      this.appendChild(template.content.cloneNode(true));

      // Limpieza de scripts dinámicos
      container
        .querySelectorAll('script[data-dynamic="true"]')
        .forEach((s) => s.remove());

      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          newScript.src = oldScript.src;
          newScript.async = false;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        newScript.setAttribute("data-dynamic", "true");
        container.appendChild(newScript);
      });
    } catch (error) {
      console.error("Error:", error);
      this.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }
}

customElements.define(
  "modificar-horarios-component",
  ModificarHorariosComponent,
);
