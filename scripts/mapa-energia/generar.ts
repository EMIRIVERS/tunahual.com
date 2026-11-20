/**
 * Generador de "Tu Mapa de Energía" (PDF personal de 8 páginas).
 *
 * Hay solo 260 kines posibles → se arman los 260 PDFs desde las mismas piezas.
 *
 *   bun scripts/mapa-energia/generar.ts --kin 7-aqabal           # un kin genérico
 *   bun scripts/mapa-energia/generar.ts --all                    # los 260 en ./mapas-generados
 *   bun scripts/mapa-energia/generar.ts --nombre "Ana" --fecha 1990-03-15
 *                                                               # personalizado (portada con nombre,
 *                                                               # luna, Cuenta Larga y cargador)
 *
 * Los textos salen de src/data (nahuales, tonos, conocimiento expandido). Lo que
 * Azul Anaité aún no ha dictado (decretos, preguntas, invitación) va marcado
 * como BORRADOR en el pie de la página, para que lo revise antes de vender.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { nahuales as nahualesStatic, tones as tonesStatic } from "../../src/data/mayanCalendar";
import { getNahualConocimiento } from "../../src/data/mayanKnowledge";
import { potenciasGuia } from "../../src/data/energiaDelDia";
import { nahualToSlug } from "../../src/data/nahualSlugs";
import { getMaizInfo } from "../../src/data/maices";
import { cargadorPorFecha } from "../../src/utils/cargador";
import { calcularLuna } from "../../src/utils/luna";
import { calcularCuentaLarga, calcularHaab } from "../../src/utils/cuentaLarga";

const RAIZ = resolve(import.meta.dir, "../..");
const NOMBRES = Object.keys(nahualToSlug); // en el orden de la cuenta: Imox = 1 … Ajpu = 20

const BRONCE = rgb(0.64, 0.45, 0.17);
const TINTA = rgb(0.16, 0.11, 0.07);
const SUAVE = rgb(0.45, 0.38, 0.3);
const CREMA = rgb(0.973, 0.945, 0.882);
const A4: [number, number] = [595, 842];
const M = 60; // margen

export interface Kin {
  tono: number;
  nahual: number; // 1–20
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

function kinPorFecha(fecha: Date): Kin {
  // Ancla de la app: 8 ago 2002 = 12 E (E = índice 12).
  const a = Date.UTC(2002, 7, 8, 12);
  const b = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12);
  const d = Math.floor((b - a) / 86400000);
  return { nahual: mod(12 - 1 + d, 20) + 1, tono: mod(12 - 1 + d, 13) + 1 };
}

function desplazar(k: Kin, signos: number, tonos: number): Kin {
  return { nahual: mod(k.nahual - 1 + signos, 20) + 1, tono: mod(k.tono - 1 + tonos, 13) + 1 };
}

export function parseKin(texto: string): Kin {
  const [t, slug] = texto.split("-");
  const nombre = NOMBRES.find((n) => nahualToSlug[n] === slug);
  const tono = Number(t);
  if (!nombre || !(tono >= 1 && tono <= 13)) throw new Error(`Kin inválido: ${texto} (ej. 7-aqabal)`);
  return { tono, nahual: NOMBRES.indexOf(nombre) + 1 };
}

const nombreNahual = (k: Kin) => NOMBRES[k.nahual - 1];
const nombreTono = (n: number) => tonesStatic.find((t) => t.number === n)!;
const etiqueta = (k: Kin) => `${k.tono} ${nombreNahual(k)}`;
const slugKin = (k: Kin) => `${k.tono}-${nahualToSlug[nombreNahual(k)]}`;

/** pdf-lib con fuentes estándar solo codifica WinAnsi: se descarta lo demás. */
const limpiar = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’ʼ]/g, "'").replace(/[—–]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

interface Ctx {
  doc: PDFDocument;
  serif: PDFFont;
  serifB: PDFFont;
  serifI: PDFFont;
  logo: Awaited<ReturnType<PDFDocument["embedPng"]>>;
}

function lineas(texto: string, font: PDFFont, size: number, ancho: number): string[] {
  const out: string[] = [];
  for (const parrafo of limpiar(texto).split("\n")) {
    let actual = "";
    for (const p of parrafo.split(/\s+/)) {
      const prueba = actual ? `${actual} ${p}` : p;
      if (font.widthOfTextAtSize(prueba, size) > ancho && actual) {
        out.push(actual);
        actual = p;
      } else actual = prueba;
    }
    out.push(actual);
  }
  return out;
}

/** Escribe texto con salto de línea; devuelve la nueva y. */
function parrafo(page: PDFPage, texto: string, font: PDFFont, size: number, x: number, y: number, ancho: number, color = TINTA, interlineado = 1.5): number {
  for (const l of lineas(texto, font, size, ancho)) {
    page.drawText(l, { x, y, size, font, color });
    y -= size * interlineado;
  }
  return y;
}

function centrado(page: PDFPage, texto: string, font: PDFFont, size: number, y: number, color = TINTA) {
  const t = limpiar(texto);
  page.drawText(t, { x: (A4[0] - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });
}

function nuevaPagina(c: Ctx, titulo: string, numero: number, borrador = false): PDFPage {
  const p = c.doc.addPage(A4);
  p.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: CREMA });
  p.drawRectangle({ x: 24, y: 24, width: A4[0] - 48, height: A4[1] - 48, borderColor: BRONCE, borderWidth: 0.6, opacity: 0, borderOpacity: 0.5 });
  centrado(p, "AZUL ANAITE  ·  TU MAPA DE ENERGIA", c.serifB, 8, A4[1] - 52, BRONCE);
  centrado(p, titulo, c.serifB, 24, A4[1] - 100);
  p.drawLine({ start: { x: A4[0] / 2 - 30, y: A4[1] - 114 }, end: { x: A4[0] / 2 + 30, y: A4[1] - 114 }, thickness: 1, color: BRONCE });
  centrado(p, String(numero), c.serif, 9, 40, SUAVE);
  if (borrador) centrado(p, "BORRADOR - pendiente del texto de Azul Anaite", c.serifI, 8, 54, rgb(0.7, 0.3, 0.2));
  return p;
}

async function imagenGlifo(c: Ctx, nombre: string) {
  const bytes = readFileSync(join(RAIZ, "src/assets/glifos", `${nahualToSlug[nombre]}.jpg`));
  return c.doc.embedJpg(bytes);
}

export interface Opciones {
  kin: Kin;
  nombre?: string;
  fecha?: Date;
}

export async function generarMapa({ kin, nombre, fecha }: Opciones): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const c: Ctx = {
    doc,
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifB: await doc.embedFont(StandardFonts.TimesRomanBold),
    serifI: await doc.embedFont(StandardFonts.TimesRomanItalic),
    logo: await doc.embedPng(readFileSync(join(RAIZ, "src/assets/logo-azul-anaite.png"))),
  };

  const nom = nombreNahual(kin);
  const dato = nahualesStatic.find((n) => n.name === nom);
  if (!dato) throw new Error(`Sin datos estáticos para ${nom}`);
  const saber = getNahualConocimiento(nom);
  const tono = nombreTono(kin.tono);
  const guia = potenciasGuia[kin.tono];
  const maiz = getMaizInfo(nom)!;
  const glifo = await imagenGlifo(c, nom);

  // 1 · Portada
  {
    const p = doc.addPage(A4);
    p.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: CREMA });
    p.drawRectangle({ x: 30, y: 30, width: A4[0] - 60, height: A4[1] - 60, borderColor: BRONCE, borderWidth: 1.2, opacity: 0 });
    const lw = 190;
    const lh = (c.logo.height / c.logo.width) * lw;
    p.drawImage(c.logo, { x: (A4[0] - lw) / 2, y: A4[1] - 80 - lh, width: lw, height: lh });
    const g = 210;
    p.drawImage(glifo, { x: (A4[0] - g) / 2, y: 430, width: g, height: g });
    centrado(p, "TU MAPA DE ENERGIA", c.serifB, 12, 395, BRONCE);
    centrado(p, etiqueta(kin), c.serifB, 54, 335);
    centrado(p, dato.meaning, c.serifI, 16, 300, BRONCE);
    if (nombre) centrado(p, nombre, c.serif, 26, 235);
    if (fecha) centrado(p, fecha.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }), c.serif, 13, 212, SUAVE);
    centrado(p, "tunahual.com", c.serif, 11, 70, SUAVE);
  }

  // 2 · Decreto de apertura (BORRADOR)
  {
    const p = nuevaPagina(c, "Decreto de apertura", 2, true);
    let y = A4[1] - 170;
    y = parrafo(p, `Hoy abro mi energia: ${etiqueta(kin)}.`, c.serifI, 20, M, y, A4[0] - 2 * M, BRONCE, 1.4) - 14;
    y = parrafo(p, `Reconozco ${dato.meaning.toLowerCase()} como parte de quien vine a ser. Camino con ${tono.meaning.toLowerCase()} y recuerdo que mi nahual es un mapa, no un limite.`, c.serif, 14, M, y, A4[0] - 2 * M);
  }

  // 3 · Nahual a fondo
  {
    const p = nuevaPagina(c, `Tu nahual: ${nom}`, 3);
    const g = 90;
    p.drawImage(glifo, { x: A4[0] - M - g, y: A4[1] - 130 - g, width: g, height: g });
    let y = A4[1] - 160;
    y = parrafo(p, dato.description, c.serif, 11.5, M, y, A4[0] - 2 * M - g - 20);
    y = Math.min(y, A4[1] - 280) - 6;
    p.drawText("Cualidades", { x: M, y, size: 12, font: c.serifB, color: BRONCE });
    y = parrafo(p, dato.cualidades.join("  ·  "), c.serif, 11, M, y - 16, A4[0] - 2 * M) - 8;
    p.drawText("Aspectos a trabajar", { x: M, y, size: 12, font: c.serifB, color: BRONCE });
    y = parrafo(p, dato.sombras.join("  ·  "), c.serif, 11, M, y - 16, A4[0] - 2 * M) - 8;
    if (saber) {
      p.drawText("Mensaje espiritual", { x: M, y, size: 12, font: c.serifB, color: BRONCE });
      y = parrafo(p, saber.mensajeEspiritual, c.serifI, 11, M, y - 16, A4[0] - 2 * M);
    }
  }

  // 4 · Tono
  {
    const p = nuevaPagina(c, `Tu tono: ${kin.tono} ${tono.name}`, 4);
    let y = A4[1] - 170;
    y = parrafo(p, `${tono.meaning}. ${tono.description}`, c.serif, 12.5, M, y, A4[0] - 2 * M) - 10;
    p.drawText("Cualidades del tono", { x: M, y, size: 12, font: c.serifB, color: BRONCE });
    y = parrafo(p, tono.cualidades.join("  ·  "), c.serif, 11.5, M, y - 16, A4[0] - 2 * M) - 10;
    if (guia) {
      p.drawText("Para caminar un dia de esta potencia", { x: M, y, size: 12, font: c.serifB, color: BRONCE });
      y -= 20;
      for (const ind of guia.indicaciones) y = parrafo(p, `•  ${ind}`, c.serif, 11.5, M, y, A4[0] - 2 * M) - 4;
    }
  }

  // 5 · Cruz Maya
  {
    const p = nuevaPagina(c, "Tu Cruz Maya", 5);
    const centro = kin;
    const conc = desplazar(centro, -8, -8);
    const dest = desplazar(centro, 8, 8);
    const grid: (Kin & { rol: string })[][] = [
      [{ ...desplazar(conc, 6, 6), rol: "Guia espiritual" }, { ...conc, rol: "Concepcion" }, { ...desplazar(conc, -6, -6), rol: "Apoyo material" }],
      [{ ...desplazar(centro, 6, 6), rol: "Desafio espiritual" }, { ...centro, rol: "Tu nacimiento" }, { ...desplazar(centro, -6, -6), rol: "Apoyo material" }],
      [{ ...desplazar(dest, 6, 6), rol: "Conexion ancestral" }, { ...dest, rol: "Destino" }, { ...desplazar(dest, -6, -6), rol: "Apoyo material" }],
    ];
    const cw = 150;
    const ch = 110;
    const x0 = (A4[0] - 3 * cw - 2 * 12) / 2;
    const yTop = A4[1] - 160;
    grid.forEach((fila, r) =>
      fila.forEach((k, col) => {
        const x = x0 + col * (cw + 12);
        const y = yTop - (r + 1) * ch - r * 12;
        const esCentro = r === 1 && col === 1;
        p.drawRectangle({ x, y, width: cw, height: ch, color: esCentro ? rgb(0.93, 0.87, 0.74) : rgb(1, 1, 1), borderColor: BRONCE, borderWidth: esCentro ? 1.6 : 0.6 });
        const t = limpiar(etiqueta(k));
        p.drawText(t, { x: x + (cw - c.serifB.widthOfTextAtSize(t, 17)) / 2, y: y + ch - 52, size: 17, font: c.serifB, color: TINTA });
        const rol = limpiar(k.rol);
        p.drawText(rol, { x: x + (cw - c.serifI.widthOfTextAtSize(rol, 9.5)) / 2, y: y + ch - 72, size: 9.5, font: c.serifI, color: BRONCE });
      })
    );
    parrafo(p, "Concepcion y Destino forman tu eje del tiempo; los brazos, tu eje del espacio: lo que te sostiene en lo material y lo que te desafia en lo espiritual.", c.serifI, 11, M, yTop - 3 * ch - 2 * 12 - 36, A4[0] - 2 * M, SUAVE);
  }

  // 6 · Maíz, elemento, dirección (+ cielo si hay fecha)
  {
    const p = nuevaPagina(c, "Tu maiz y tu elemento", 6);
    let y = A4[1] - 170;
    const filas: [string, string][] = [
      ["Maiz", maiz.color],
      ["Elemento", maiz.elemento],
      ["Direccion", maiz.direccionTexto + (maiz.confirmada ? "" : "  (por confirmar)")],
      ["Rige", dato.parteDelCuerpo],
      ["Lugar de poder", dato.lugarDelPoder],
    ];
    for (const [k, v] of filas) {
      p.drawText(k, { x: M, y, size: 12, font: c.serifB, color: BRONCE });
      y = parrafo(p, v, c.serif, 12, M + 130, y, A4[0] - 2 * M - 130) - 6;
    }
    if (fecha) {
      y -= 12;
      const car = cargadorPorFecha(fecha);
      const luna = calcularLuna(fecha);
      const cl = calcularCuentaLarga(fecha);
      const hb = calcularHaab(fecha);
      const carNom = NOMBRES[car.nahualIndex - 1];
      p.drawText("El cielo de tu nacimiento", { x: M, y, size: 14, font: c.serifB, color: TINTA });
      y -= 24;
      for (const [k, v] of [
        ["Luna", `${luna.nombre}, ${luna.iluminacion}% iluminada`],
        ["Cuenta Larga", cl.texto],
        ["Haab'", hb.texto],
        ["Cargador del ano", `${car.tono} ${carNom}  (ano maya ${car.anio})`],
      ] as const) {
        p.drawText(k, { x: M, y, size: 12, font: c.serifB, color: BRONCE });
        y = parrafo(p, v, c.serif, 12, M + 130, y, A4[0] - 2 * M - 130) - 6;
      }
    }
  }

  // 7 · Decretos y preguntas (BORRADOR)
  {
    const p = nuevaPagina(c, "Decretos y preguntas", 7, true);
    let y = A4[1] - 170;
    p.drawText("Tres decretos", { x: M, y, size: 13, font: c.serifB, color: BRONCE });
    y -= 22;
    for (const d of [
      `Soy ${etiqueta(kin)} y mi energia tiene un lugar en el mundo.`,
      `Recibo con el corazon abierto lo que ${nom} viene a ensenarme.`,
      "Camino mi dia con presencia, dentro del tiempo sagrado del Cholq'ij.",
    ])
      y = parrafo(p, `•  ${d}`, c.serifI, 12, M, y, A4[0] - 2 * M) - 6;
    y -= 14;
    p.drawText("Tres preguntas de integracion", { x: M, y, size: 13, font: c.serifB, color: BRONCE });
    y -= 22;
    for (const [i, q] of [
      `Que parte de ${dato.meaning.toLowerCase()} reconozco hoy en mi vida?`,
      "Que me pide mi tono en esta etapa?",
      "Cual es el siguiente paso que daria si me acompanara a mi misma?",
    ].entries())
      y = parrafo(p, `${i + 1}.  ${q}`, c.serif, 12, M, y, A4[0] - 2 * M) - 6;
  }

  // 8 · Invitación y cierre (BORRADOR)
  {
    const p = nuevaPagina(c, "Si quieres ir mas profundo", 8, true);
    let y = A4[1] - 170;
    y = parrafo(p, "Este mapa es el comienzo. Si sientes el llamado a una lectura mas completa, el Oraculo Maya de Azul Anaite te espera: 20 lugares al mes, con lista de espera.", c.serif, 13, M, y, A4[0] - 2 * M) - 16;
    y = parrafo(p, "Escribe a shakticacao@gmail.com o visita azulanaite.com.", c.serifI, 12, M, y, A4[0] - 2 * M, BRONCE) - 40;
    centrado(p, "Azul Anaite · Guardiana del Nuevo Tiempo", c.serifB, 13, y, TINTA);
    centrado(p, "Es un honor acompanarte a recordar", c.serifI, 11, y - 20, SUAVE);
    centrado(p, "© Azul Anaite. Todos los derechos reservados. Marca registrada. Prohibida su reproduccion total o parcial sin autorizacion.", c.serif, 7, 70, SUAVE);
  }

  return doc.save();
}

async function main() {
  const args = process.argv.slice(2);
  const val = (f: string) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const out = resolve(val("--out") ?? "mapas-generados");
  mkdirSync(out, { recursive: true });

  if (args.includes("--all")) {
    let n = 0;
    for (let nahual = 1; nahual <= 20; nahual++)
      for (let tono = 1; tono <= 13; tono++) {
        // gcd(13, 20) = 1, así que los 260 pares tono-nahual existen y son todos distintos.
        const k = { tono, nahual };
        writeFileSync(join(out, `mapa-${slugKin(k)}.pdf`), await generarMapa({ kin: k }));
        n++;
      }
    console.log(`${n} mapas en ${out}`);
    return;
  }

  const fechaTxt = val("--fecha");
  if (fechaTxt) {
    const [y, m, d] = fechaTxt.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    const kin = kinPorFecha(fecha);
    const nombre = val("--nombre");
    const archivo = join(out, `mapa-${slugKin(kin)}${nombre ? "-" + nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""}.pdf`);
    writeFileSync(archivo, await generarMapa({ kin, nombre, fecha }));
    console.log(archivo);
    return;
  }

  const kin = parseKin(val("--kin") ?? "7-aqabal");
  const archivo = join(out, `mapa-${slugKin(kin)}.pdf`);
  writeFileSync(archivo, await generarMapa({ kin }));
  console.log(archivo);
}

if (import.meta.main) main();
