/**
 * Texto de PRUEBA con la misma forma que content/oraculo. Sirve para probar la
 * maqueta, la paginación y el motor cuando falta un archivo real. No es
 * contenido del producto: nada de aquí debe llegar a un comprador.
 * Persona ficticia, sin datos de nadie.
 */

export const CLAVES_POSICION = [
  ["origen-concepcion", "ORIGEN · CONCEPCIÓN", "Tu origen · la concepción", "Origen", "Canal central"],
  ["origen-poder", "ORIGEN · PODER", "Tu origen · el poder", "Origen", "Lado de poder"],
  ["origen-esencia", "ORIGEN · ESENCIA", "Tu origen · la esencia", "Origen", "Lado de esencia"],
  ["nacimiento", "NACIMIENTO · TU ESENCIA", "Tu esencia · tu nahual de nacimiento", "Nacimiento", "Canal central"],
  ["mano-derecha", "MANO DERECHA · LO QUE DAS", "Tu mano derecha · lo que viniste a dar", "Nacimiento", "Lado de poder"],
  ["mano-izquierda", "MANO IZQUIERDA · LO QUE RECIBES", "Tu mano izquierda · lo que recibes siempre", "Nacimiento", "Lado de esencia"],
  ["destino", "DESTINO · DESDE LOS 52", "Tu destino · desde los 52", "Destino", "Canal central"],
  ["destino-poder", "DESTINO · PODER", "Tu destino · el poder", "Destino", "Lado de poder"],
  ["destino-esencia", "DESTINO · ESENCIA", "Tu destino · la esencia", "Destino", "Lado de esencia"],
] as const;

const FRASES = [
  "Texto de prueba para comprobar el ancho de columna, el interlineado y el corte de página.",
  "Esta frase solo existe para medir; el contenido real lo escribe y aprueba Azul Anaité.",
  "Quien lee, {{nombre}}, encuentra aquí un marcador de posición que ocupa lo mismo que un párrafo verdadero.",
  "Se repite a propósito: la maqueta debe aguantar párrafos largos sin desbordar ni dejar viudas.",
];

const parrafo = (n: number) => Array.from({ length: 4 }, (_, i) => FRASES[(n + i) % FRASES.length]).join(" ");
const parrafos = (n: number, cuantos = 3) => Array.from({ length: cuantos }, (_, i) => parrafo(n + i)).join("\n\n");

const FM = (extra = "") => `---\nestado: borrador-fixture\nrevision: pendiente-azul\n${extra}---\n\n`;

export function relleno(ruta: string): string | null {
  let m: RegExpExecArray | null;
  if (ruta === "universal.md") {
    const sec = (n: string, k: number) => `## ${n}\n\n${parrafos(k, 2)}\n\n`;
    return (
      FM() +
      `## portada-lema\n\nLema de prueba.\n\n${sec("apertura", 1)}${sec("cholqij", 2)}${sec("promesa", 3)}${sec("dia-de-compra", 4)}${sec("como-usar", 5)}` +
      `## cierre\n\n{{nombre}}, texto de prueba.\n\nMedio de prueba.\n\nVerso de prueba.\nOtro verso de prueba.\n\n${sec("aviso", 6)}## pie\n\n© Azul Anaité · prueba\n`
    );
  }
  if ((m = /^nahual\/([a-z]+)\.md$/.exec(ruta))) {
    const subs = CLAVES_POSICION.map(([c]) => `### ${c}\n\n${parrafo(c.length)}`).join("\n\n");
    return (
      FM(`slug: ${m[1]}\n`) +
      `# Prueba\n\n## esencia\n\n${parrafos(1, 4)}\n\n## animal-y-elemento\n\n${parrafos(2)}\n\n## don\n\n${parrafos(3)}\n\n## sombra\n\n${parrafos(4)}\n\n` +
      `## como-llamarlo\n\n${parrafos(5)}\n\n## decreto\n\nSoy una línea de prueba.\nSoy otra línea de prueba.\nSoy {{la última|el último|lo último}} verso de prueba.\n\n` +
      `## por-posicion\n\n${subs}\n\n## cuerpo\n\n${parrafos(6)}\n\n<!--solo:mujer-->\n## cuerpo-mujer\n\n${parrafos(7, 2)}\n<!--/solo-->\n`
    );
  }
  if ((m = /^tono\/(\d+)\.md$/.exec(ruta))) {
    return (
      FM(`numero: ${m[1]}\nnombre: "Prueba"\nsignificado: "Prueba"\npaso: "Paso de prueba"\n`) +
      `## esencia\n\n${parrafos(1, 2)}\n\n## como-se-vive\n\n${parrafos(2, 2)}\n\n## paso-de-la-trecena\n\n${parrafos(3, 2)}\n\n## frase\n\nFrase de prueba.\nOtra línea de prueba.\n`
    );
  }
  if ((m = /^posicion\/(\d)\.md$/.exec(ruta))) {
    const [clave, etiqueta, titulo, linea, lado] = CLAVES_POSICION[Number(m[1]) - 1];
    return (
      FM(`numero: ${m[1]}\nclave: "${clave}"\nlinea: "${linea}"\nlado: "${lado}"\ntitulo: "${titulo}"\netiqueta: "${etiqueta}"\n`) +
      `## texto\n\n${parrafos(Number(m[1]), 2)}\n\n## pregunta\n\n¿Pregunta de prueba número ${m[1]}?\n`
    );
  }
  return null;
}
