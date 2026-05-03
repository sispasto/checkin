class ReporteDetalleComponent extends HTMLElement {
  async connectedCallback() {
    const containerSelector = this.getAttribute("container");
    const container = document.querySelector(containerSelector);

    // Extraer parámetros de la URL (hash)
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const turno = params.get("turno") || "e1";
    const fecha = params.get("fecha") || new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("view/reporteDetalle.html");
      if (!res.ok) throw new Error("No se pudo cargar el archivo HTML");
      let html = await res.text();

      // Inyectamos variables iniciales en el HTML antes de procesar scripts
      html = html
        .replace(/{{turno}}/g, turno.toUpperCase())
        .replace(/{{fecha}}/g, fecha);

      const template = document.createElement("template");
      template.innerHTML = html;

      const scripts = template.content.querySelectorAll("script");
      scripts.forEach((s) => s.remove());

      this.innerHTML = "";
      this.appendChild(template.content.cloneNode(true));

      container
        .querySelectorAll("script[data-dynamic]")
        .forEach((s) => s.remove());

      scripts.forEach((old) => {
        const s = document.createElement("script");
        s.textContent = `
          (function() {
            const TURNO_URL = "${turno}";
            const FECHA_URL = "${fecha}";
            ${old.textContent}
          })();
        `;
        s.setAttribute("data-dynamic", "true");
        container.appendChild(s);
      });
    } catch (e) {
      console.error("Error cargando ReporteDetalleComponent:", e);
      this.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
  }
}

customElements.define("reporte-detalle-component", ReporteDetalleComponent);
