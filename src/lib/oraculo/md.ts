/**
 * Markdown mínimo para el Oráculo: párrafos, listas, citas y énfasis.
 * Todo texto se escapa antes de convertir: ningún contenido (ni el nombre de
 * quien compra) puede inyectar HTML en el PDF.
 */

export function esc(t: string): string {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function inline(t: string): string {
  return esc(t)
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?![*\w])/g, "$1<em>$2</em>")
    .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?![_\w])/g, "$1<em>$2</em>");
}

/** Bloques separados por línea en blanco; un salto simple dentro de un párrafo es <br> (versos, decretos). */
export function mdAHtml(texto: string): string {
  const bloques = texto.trim().split(/\n{2,}/);
  return bloques
    .map((b) => {
      const lineas = b.split("\n");
      if (/^\d+\.\s/.test(lineas[0])) {
        // Lista numerada; una línea que no empieza con número continúa el ítem anterior.
        const items: string[] = [];
        for (const l of lineas) {
          if (/^\d+\.\s/.test(l)) items.push(l.replace(/^\d+\.\s+/, ""));
          else items[items.length - 1] += `\n${l.trim()}`;
        }
        const inicio = Number(/^(\d+)\./.exec(lineas[0])![1]);
        return `<ol start="${inicio}">${items.map((i) => `<li>${i.split("\n").map(inline).join("<br>")}</li>`).join("")}</ol>`;
      }
      if (lineas.every((l) => /^[-*]\s/.test(l))) {
        return `<ul>${lineas.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      }
      if (lineas.every((l) => /^>\s?/.test(l))) {
        return `<blockquote>${lineas.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`;
      }
      return `<p>${lineas.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}

/** Versos de un decreto o frase: una línea por verso, sin párrafos. */
export function versos(texto: string): string[] {
  return texto.split("\n").map((l) => l.trim()).filter(Boolean);
}
