import { analizarCruz, cruzOraculo, energiaDelDia, fechaLarga, proximosRegresos, tablaTrecena, type CeldaCruz, type CruzOraculo } from "./calculo.js";
import { Contenido, type Documento } from "./contenido.js";
import { ErrorPlantilla, renderizarPlantilla } from "./plantilla.js";
import { type Genero } from "./genero.js";
import { esc, mdAHtml, versos } from "./md.js";
import { nahualToSlug } from "../../data/nahualSlugs.js";
import { cssFuentes, glifoUri, logoUri } from "./assets.js";

/**
 * Maqueta HTML/CSS del PDF del Oráculo (A4). Reconstruida a ojo desde el PDF
 * de referencia: portada y cierre oscuros, páginas crema, Lora para titulares y
 * cuerpo, Montserrat para rótulos, Lato para tablas. Cada página es una <section>;
 * si un texto no cabe, Chromium lo continúa en la hoja siguiente.
 *
 * Los textos salen de content/oraculo (Contenido). Lo calculado (cruz, trecena,
 * cuatro puertas) se arma aquí con plantillas propias y pasa por el mismo motor
 * de género, así que nada de lo calculado lleva un género fijo.
 */

export interface DatosOraculo {
  nombre: string;
  /** YYYY-MM-DD */
  fechaNacimiento: string;
  genero: Genero;
  /** YYYY-MM-DD, el día de la compra. */
  fechaCompra: string;
}

export class ErrorDatos extends Error {
  constructor(m: string) {
    super(m);
    this.name = "ErrorDatos";
  }
}

/** Puntos del nombre en la portada: un nombre largo baja de tamaño para caber en dos líneas sin pisar lo que sigue. */
export function tamanoNombrePortada(nombre: string): number {
  const n = nombre.length;
  return n <= 28 ? 23.5 : n <= 44 ? 19 : n <= 64 ? 15.5 : 12.5;
}

/** Nombre apto para imprimir: sin saltos ni control, ≤ 100 caracteres, al menos 2 letras. */
export function limpiarNombre(n: string): string {
  const limpio = String(n ?? "").replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim().slice(0, 100);
  if (limpio.replace(/[^\p{L}]/gu, "").length < 2) throw new ErrorDatos("El nombre debe tener al menos 2 letras.");
  return limpio;
}

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

const MAIZ_PUNTO: Record<string, string> = { Rojo: "#b23a2e", Blanco: "#ffffff", Negro: "#14100d", Amarillo: "#e3b02a" };

const ESTRELLA = `<svg class="estrella" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5C11.3 16.9 7.1 12.7 1.5 12 7.1 11.3 11.3 7.1 12 1.5z" fill="currentColor"/></svg>`;
const ESTRELLAS3 = `<div class="estrellas3">${ESTRELLA}${ESTRELLA}${ESTRELLA}</div>`;
/** Divisor ornamental: dos filetes finos y la estrella al centro. */
/** 13 tonos × 20 nahuales = 260 días: la cuenta del Cholq'ij como cifra. */
const CIFRAS_CHOLQIJ = `<div class="cifras"><div class="cf"><div class="v">13</div><div class="l">tonos</div></div><div class="op">×</div><div class="cf"><div class="v">20</div><div class="l">nahuales</div></div><div class="op">=</div><div class="cf total"><div class="v">260</div><div class="l">días · nueve lunas</div></div></div>`;
const ORN = `<div class="orn"><i></i>${ESTRELLA}<i></i></div>`;

/** Numeral maya de barra y punto (1–13), dibujado de abajo hacia arriba en una caja de 20×13. */
function numeralMaya(n: number): string {
  const barras = Math.floor(n / 5);
  const puntos = n % 5;
  const partes: string[] = [];
  let y = 12.6;
  for (let i = 0; i < barras; i++) {
    y -= 2.6;
    partes.push(`<rect x="1" y="${y.toFixed(1)}" width="18" height="2.6"/>`);
    y -= 1.3;
  }
  if (puntos) {
    const cy = y - 1.5;
    const x0 = 10 - ((puntos - 1) * 4.4) / 2;
    for (let i = 0; i < puntos; i++) partes.push(`<circle cx="${(x0 + i * 4.4).toFixed(1)}" cy="${cy.toFixed(1)}" r="1.5"/>`);
  }
  return `<svg viewBox="0 0 20 13" aria-hidden="true" fill="currentColor">${partes.join("")}</svg>`;
}

/** Tira de los trece tonos con el de la persona resaltado. */
function tiraTonos(tuyo: number): string {
  return `<div class="tonos">${Array.from({ length: 13 }, (_, i) => i + 1)
    .map((t) => `<div class="tono${t === tuyo ? " tuyo" : ""}">${numeralMaya(t)}<div class="k">${t}</div></div>`)
    .join("")}</div>`;
}

/* ───────────── CSS ───────────── */

/** Texto seguro dentro de un string CSS: sin comillas, barras ni «<» que puedan cerrar el <style>. */
const cssStr = (t: string) =>
  t
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
    .replace(/</g, "\\3C ")
    .replace(/>/g, "\\3E ");

function css(pieDePagina: string, pieDerecho: string, marcaBorrador: boolean): string {
  const pie = cssStr(pieDePagina);
  return `
${cssFuentes()}
:root{--crema:#fbf7ef;--tinta:#1c1612;--texto:#2a211a;--gris:#5e4f3a;--bronce:#8b6f2a;--bronce-osc:#6f5520;--dorado:#c9a54a;--dorado-claro:#f5d36c;--marfil:#f2e3bd;--pie:#7f6c48;--oscuro:#0c0908;--marco:#5a4c29;--linea:#e2d1a2;--velo:#f4ead2}
@page{size:A4;margin:19mm 20mm 26mm 20mm;background:var(--crema);
  @bottom-center{content:"${pie} · " counter(page);white-space:nowrap;font:500 6.6pt Montserrat;letter-spacing:.16em;text-transform:uppercase;color:var(--pie);vertical-align:top;padding-top:5mm}
  @bottom-left{content:"${marcaBorrador ? "borrador" : ""}";font:500 6.2pt Montserrat;letter-spacing:.18em;text-transform:uppercase;color:#b3a27c;vertical-align:top;padding-top:5mm}
  @bottom-right{content:"${cssStr(pieDerecho)}";white-space:nowrap;font:500 6.2pt Montserrat;letter-spacing:.06em;color:var(--pie);vertical-align:top;padding-top:5mm}}
@page oscura{size:A4;margin:0;background:var(--oscuro);@bottom-center{content:none}@bottom-right{content:none}@bottom-left{content:none}}
*{box-sizing:border-box}
html{background:var(--crema);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:400 11.5pt/1.6 Lora,serif;color:var(--texto);background:var(--crema);font-kerning:normal;font-variant-numeric:oldstyle-nums;hyphens:manual}
p{margin:0 0 3.4mm;orphans:3;widows:3}
em{font-style:italic}
strong{font-weight:600;color:var(--tinta)}
.pag{break-before:page}
.pag:first-child{break-before:auto}
.kicker{font:600 7.2pt/1.4 Montserrat;letter-spacing:.24em;text-transform:uppercase;color:var(--bronce-osc);margin:0 0 6mm}
h1{font:400 30pt/1.06 Lora;color:var(--tinta);margin:0 0 3mm;letter-spacing:-.012em;break-after:avoid}
h1 em{display:block;color:var(--bronce);font-size:.82em;line-height:1.2;letter-spacing:-.005em}
.sub{font:italic 400 11pt/1.5 Lora;color:var(--gris);margin:0 0 6mm}
.regla{width:14mm;height:.55mm;border:0;margin:5mm 0 8mm;background:var(--bronce)}
h2{font:600 7.4pt/1.4 Montserrat;letter-spacing:.22em;text-transform:uppercase;color:var(--bronce-osc);margin:8mm 0 3mm;padding-top:3mm;break-after:avoid;break-inside:avoid;background:linear-gradient(var(--dorado),var(--dorado)) no-repeat 0 0/7mm .45mm}
.mantra{text-align:center;font:italic 400 15pt/1.55 Lora;color:var(--tinta);margin:5mm 0 4mm;break-inside:avoid}
.mantra p{margin:0;orphans:1;widows:1}
.estrella{width:3.4mm;height:3.4mm;color:var(--dorado)}
.estrellas3{display:flex;justify-content:center;gap:5mm;margin:5mm 0 8mm}
.estrella-sola{text-align:center;margin:0 0 2mm}
.orn{display:flex;align-items:center;gap:4mm;margin:8mm 0;break-after:avoid}
.orn i{flex:1;height:.25mm;background:var(--linea)}
.orn .estrella{width:3mm;height:3mm}
.cita{position:relative;padding:0 0 0 8mm;margin:7mm 0 7mm;font:italic 400 12.5pt/1.6 Lora;color:var(--tinta);break-inside:avoid}
.cita::before{content:"";position:absolute;left:0;top:1.4mm;bottom:1.4mm;width:.5mm;background:var(--dorado)}
.cita p{margin:0 0 2mm}
.cita p:last-child{margin:0}
.recuadro{border-top:.5mm solid var(--bronce);border-bottom:.25mm solid var(--linea);padding:5mm 0 5.5mm;margin:8mm 0 0;break-inside:avoid}
.recuadro .kicker{margin-bottom:2.6mm}
.recuadro p{font:italic 400 12.5pt/1.55 Lora;color:var(--tinta);margin:0}
/* cabeceras de nahual */
.cabecera{display:flex;gap:6mm;align-items:center;margin:0 0 8mm;break-inside:avoid;break-after:avoid}
.cabecera img{width:27mm;height:27mm;flex:none}
.cabecera .kicker{margin:0 0 1.5mm}
.cabecera .nombre{font:400 24pt/1.1 Lora;color:var(--tinta)}
.cabecera .nombre b{font-weight:400;color:var(--bronce)}
.cabecera .sub2{font:italic 400 10pt/1.4 Lora;color:var(--gris);margin-top:1.5mm}
.cabecera.grande{justify-content:space-between;gap:8mm;padding:0 0 7mm;margin:0 0 8mm;border-bottom:.25mm solid var(--linea)}
.cabecera.grande img{width:40mm;height:40mm;order:2}
.cabecera.grande .nombre{font-size:34pt;line-height:1.02;letter-spacing:-.015em;margin-top:1mm}
.cabecera.grande .nombre .t{font-variant-numeric:lining-nums}
.cabecera.grande .sub2{font-size:11pt;margin-top:3mm}
.apertura-nahual{text-align:center;margin:0 0 8mm;break-inside:avoid}
.apertura-nahual img{width:50mm;height:50mm;display:block;margin:0 auto 6mm}
.apertura-nahual .kicker{margin:0 0 3mm}
.apertura-nahual .nombre{font:400 44pt/1 Lora;color:var(--tinta);letter-spacing:-.02em;font-variant-numeric:lining-nums}
.apertura-nahual .nombre b{font-weight:400;color:var(--bronce)}
.apertura-nahual .sub2{font:italic 400 11.5pt/1.4 Lora;color:var(--gris);margin-top:3.5mm}
.apertura-nahual .regla{margin:7mm auto 0}
.pregunta{font:italic 400 12pt/1.55 Lora;margin:7mm 0 0;padding-top:5mm;border-top:.25mm solid var(--linea);color:var(--tinta);break-inside:avoid}
.pregunta::before{content:"Para ti";display:block;font:600 6.8pt Montserrat;font-style:normal;letter-spacing:.22em;text-transform:uppercase;color:var(--bronce-osc);margin-bottom:2mm}
ol,ul{margin:0 0 3.6mm 0;padding:0 0 0 7mm}
li{margin:0 0 1.8mm;padding-left:1mm}
ol li::marker{font:600 10.5pt Lora;color:var(--bronce);font-variant-numeric:lining-nums}
/* cruz */
.cruz{position:relative;height:126mm;margin:4mm 0 8mm}
.cruz svg.ejes{position:absolute;left:0;top:0;width:170mm;height:126mm}
.celda{position:absolute;width:56mm;margin-left:-28mm;text-align:center}
.celda .disco{width:21mm;height:21mm;margin:0 auto 2.4mm;border-radius:50%;background:var(--crema);border:.3mm solid var(--linea);display:flex;align-items:center;justify-content:center}
.celda.canal .disco{border:.5mm solid var(--dorado)}
.celda img{width:14mm;height:14mm}
.celda.centro .disco{width:27mm;height:27mm;margin-top:-3mm;background:var(--oscuro);border:.6mm solid var(--dorado)}
.celda.centro img{width:19mm;height:19mm}
.celda .n,.celda .r{display:table;margin-left:auto;margin-right:auto;background:var(--crema);padding:0 1.6mm}
.celda .n{font:400 13pt/1.15 Lora;color:var(--tinta);font-variant-numeric:lining-nums}
.celda.centro .n{font-size:15pt}
.celda .r{font:600 6.2pt/1.45 Montserrat;letter-spacing:.16em;text-transform:uppercase;color:var(--bronce-osc);margin-top:1.4mm}
.celda .punto{display:inline-block;width:2mm;height:2mm;border-radius:50%;margin-right:1.4mm;border:.25mm solid rgba(0,0,0,.4);vertical-align:.2mm}
.leyenda{display:grid;grid-template-columns:38mm 1fr;border-top:.5mm solid var(--bronce);font:400 10.2pt/1.5 Lora}
.leyenda>div{padding:2.6mm 0;border-bottom:.25mm solid var(--linea)}
.leyenda>div:nth-child(odd){font:600 6.6pt/1.6 Montserrat;letter-spacing:.18em;text-transform:uppercase;color:var(--bronce-osc);padding-top:3.2mm;padding-right:4mm}
/* rumbos */
.rumbos{display:grid;grid-template-columns:repeat(4,1fr);border-top:.5mm solid var(--bronce);border-bottom:.25mm solid var(--linea);margin:7mm 0 8mm;break-inside:avoid}
.rumbo{padding:3.4mm 4mm 3mm 0;border-right:.25mm solid var(--linea)}
.rumbo+.rumbo{padding-left:4mm}
.rumbo:last-child{border-right:0}
.rumbo .d{font:600 6.6pt/1.4 Montserrat;letter-spacing:.18em;text-transform:uppercase;color:var(--bronce-osc)}
.rumbo .c{font:400 38pt/1 Lora;color:var(--tinta);margin:2.5mm 0 1.5mm;font-variant-numeric:lining-nums}
.rumbo .c small{font:500 7pt Montserrat;letter-spacing:.1em;color:var(--gris);margin-left:1.5mm}
.rumbo.cero .c{color:#cdbb8e}
.rumbo .ns{font:italic 400 9.6pt/1.4 Lora;color:var(--gris);min-height:4mm}
.rumbo .punto{display:inline-block;width:2.2mm;height:2.2mm;border-radius:50%;margin-right:1.6mm;border:.25mm solid rgba(0,0,0,.4);vertical-align:-.1mm}
/* tira de los 13 tonos */
.tonos{display:grid;grid-template-columns:repeat(13,1fr);align-items:end;border-top:.25mm solid var(--linea);border-bottom:.25mm solid var(--linea);padding:3mm 0 2.4mm;margin:4mm 0 6mm;break-inside:avoid}
.tono{text-align:center;color:#d3be88}
.tono svg{width:10.5mm;height:6.8mm;display:block;margin:0 auto}
.tono .k{font:500 7pt Montserrat;letter-spacing:.06em;color:#a48f5e;margin-top:1.8mm}
.tono.tuyo{color:var(--bronce)}
.tono.tuyo svg{width:12.5mm;height:8.1mm}
.tono.tuyo .k{font-weight:700;color:var(--tinta);border-top:.5mm solid var(--dorado);padding-top:1mm}
/* cifras del Cholq'ij */
.cifras{display:flex;align-items:flex-end;gap:5mm;margin:2mm 0 9mm;padding:0 0 5mm;border-bottom:.25mm solid var(--linea);break-inside:avoid}
.cifras .cf{flex:none}
.cifras .v{font:400 44pt/1 Lora;color:var(--tinta);letter-spacing:-.02em;font-variant-numeric:lining-nums}
.cifras .cf.total .v{color:var(--bronce)}
.cifras .l{font:600 6.6pt/1.4 Montserrat;letter-spacing:.18em;text-transform:uppercase;color:var(--bronce-osc);margin-top:2mm}
.cifras .op{font:300 22pt/1 Lora;color:var(--dorado);padding-bottom:8mm}
/* trecena */
table.trecena{width:100%;border-collapse:collapse;font:400 9.6pt/1.32 Lato;margin:3mm 0 0;border-top:.5mm solid var(--bronce)}
.trecena th{font:600 6.6pt Montserrat;letter-spacing:.18em;text-transform:uppercase;color:var(--bronce-osc);text-align:left;padding:2mm 0 1.8mm;border-bottom:.25mm solid var(--linea)}
.trecena td{padding:.6mm 2mm .6mm 0;border-bottom:.25mm solid #ece0bf;vertical-align:middle}
.trecena td:first-child{font:400 10pt Lora;width:34mm;white-space:nowrap;font-variant-numeric:lining-nums}
.trecena td:first-child img{width:4.4mm;height:4.4mm;vertical-align:middle;margin-right:2mm;opacity:.55}
.trecena td:nth-child(2){width:46mm;color:var(--gris)}
.trecena tr.marca td{background:var(--velo)}
.trecena tr.marca td:first-child img{opacity:1}
.trecena tr.marca td:first-child{padding-left:1.5mm}
.trecena tr.tuyo td:first-child{color:var(--bronce);font-weight:600}
.trecena strong{font:600 6.4pt Montserrat;letter-spacing:.12em;text-transform:uppercase;color:var(--bronce-osc);white-space:nowrap}
/* canal central */
.canal-v{position:relative;margin:6mm 0 0}
.canal-v .eje{position:absolute;left:12mm;top:12mm;bottom:12mm;width:.5mm;background:var(--dorado)}
.canal-v .tramo{display:grid;grid-template-columns:24mm 1fr;gap:8mm;align-items:start;margin:0 0 7mm;break-inside:avoid;position:relative}
.canal-v .tramo:last-child{margin-bottom:0}
.canal-v .disco{width:24mm;height:24mm;border-radius:50%;background:var(--crema);border:.5mm solid var(--dorado);display:flex;align-items:center;justify-content:center}
.canal-v .tramo.centro .disco{background:var(--oscuro)}
.canal-v .disco img{width:16mm;height:16mm}
.canal-v .decreto-de{text-align:left;margin:1.5mm 0 2mm}
.canal-v .mantra{text-align:left;font-size:12pt;line-height:1.5;margin:0}
.decreto-de{font:600 6.8pt Montserrat;letter-spacing:.22em;text-transform:uppercase;color:var(--bronce-osc);text-align:center;margin:6mm 0 0}
.compacto p{font-size:11pt;line-height:1.58}
.dos{display:block}
.dos .bloque{margin-bottom:3.5mm}
.dos .bloque+.bloque{padding-top:6mm;border-top:.25mm solid var(--linea)}
.dos p{font-size:10.6pt;line-height:1.56;margin-bottom:2.8mm}
.dos .cita{font-size:10.8pt;line-height:1.55;margin:4mm 0 3mm;padding-left:6mm}
.dos .cabecera{margin-bottom:4mm}
.dos .cabecera img{width:18mm;height:18mm}
.dos .cabecera .nombre{font-size:20pt}
.chica p{font-size:10.6pt;line-height:1.56;margin-bottom:2.8mm}
.media p{font-size:11pt;line-height:1.56;margin-bottom:3mm}
.media h2{margin-top:6.5mm}
.media .cita{margin:6mm 0 0}
.chica h2{margin:6mm 0 2.4mm}
.glifo-cuerpo{display:block;width:62mm;height:62mm;margin:4mm auto 12mm}
.aviso-pag{height:247mm;display:flex;flex-direction:column}
.aviso-pag .aviso-fin{margin-top:auto;border-top:.5mm solid var(--bronce);padding-top:6mm}
.aviso p{font:400 9.4pt/1.65 Lato;color:var(--gris)}
.lineas p{margin:0}
.preg{display:grid;grid-template-columns:11mm 1fr;gap:5mm;margin:0 0 5.6mm;break-inside:avoid}
.preg img{width:11mm;height:11mm;margin-top:.6mm}
.preg .e{font:600 6.4pt Montserrat;letter-spacing:.18em;text-transform:uppercase;color:var(--bronce-osc);margin-bottom:1mm}
.preg .q{font:italic 400 10.8pt/1.5 Lora;color:var(--tinta)}
.preg .raya{height:6.5mm;border-bottom:.25mm solid var(--linea)}
/* páginas oscuras */
.oscura{page:oscura;break-before:page;break-after:page;width:210mm;height:296.6mm;position:relative;overflow:hidden;color:var(--marfil);background:radial-gradient(ellipse at 50% 38%,#2a1a12 0%,#120d0a 45%,#0a0706 100%)}
.oscura .marco{position:absolute;inset:11mm;border:.3mm solid var(--marco)}
.oscura .marco2{position:absolute;inset:14mm;border:.2mm solid rgba(90,76,41,.4)}
.logo{position:absolute;left:50%;transform:translateX(-50%);width:112mm}
.centrado{position:absolute;left:0;right:0;text-align:center}
.portada .anillo{position:absolute;left:50%;top:52mm;width:102mm;height:102mm;margin-left:-51mm;border:.2mm solid rgba(201,165,74,.28);border-radius:50%}
.portada .glifo{position:absolute;left:50%;top:58mm;width:90mm;height:90mm;margin-left:-45mm}
.portada .k1{top:168mm;font:500 7.4pt Montserrat;letter-spacing:.46em;text-transform:uppercase;color:var(--dorado)}
.portada .titulo{top:176mm;font:400 41pt/1.1 Lora;color:#fff}
.portada .nom{top:198mm;font:italic 400 23.5pt/1.2 Lora;color:var(--marfil);padding:0 24mm}
.portada .kin{top:216mm;font:500 9.4pt Montserrat;letter-spacing:.5em;text-transform:uppercase;color:var(--dorado-claro)}
.portada .filete{position:absolute;left:50%;top:225mm;width:34mm;margin-left:-17mm;height:.25mm;background:var(--dorado);opacity:.7}
.portada .l1,.portada .l2{font:300 10.4pt/1.7 Lato;letter-spacing:.07em;color:#d3c6a6}
.portada .l1{top:231mm}.portada .l2{top:237.5mm}
.portada .lema{position:absolute;left:0;right:0;bottom:22mm;text-align:center;font:500 6.2pt Montserrat;letter-spacing:.34em;text-transform:uppercase;color:#a48a4c;padding:0 22mm}
.cierre .glifo{position:absolute;left:50%;top:27mm;width:30mm;margin-left:-15mm}
.cierre .cuerpo{position:absolute;left:0;right:0;top:66mm;text-align:center;padding:0 24mm}
.cierre .t1{font:italic 400 17pt/1.4 Lora;color:var(--marfil);margin:0 0 9mm}
.cierre .t2{font:300 10pt/1.75 Lato;color:#d8cbab;margin:0 0 5mm}
.cierre .t3{font:600 12pt/1.75 Lora;color:var(--dorado-claro);margin:9mm 0 0}
.cierre .logo{bottom:48mm;width:112mm}
.cierre .contacto{bottom:46mm;font:500 6.6pt Montserrat;letter-spacing:.26em;text-transform:uppercase;color:#cdbf9d}
.cierre .legal{bottom:17mm;font:300 6.6pt/1.5 Lato;color:#9c8a62;padding:0 24mm}
`;
}

/* ───────────── Piezas ───────────── */

function mantra(texto: string): string {
  return `<div class="estrella-sola">${ESTRELLA}</div><div class="mantra">${versos(texto).map((v) => `<p>${esc(v)}</p>`).join("")}</div>`;
}

function seccion(doc: Documento, nombre: string, etiqueta?: string): string {
  const t = doc.secciones[nombre];
  if (!t) return "";
  return `${etiqueta ? `<h2>${esc(etiqueta)}</h2>` : ""}${mdAHtml(t)}`;
}

const ETIQUETAS_NAHUAL: Record<string, string> = {
  esencia: "La esencia",
  "animal-y-elemento": "Tu guardián y tu elemento",
  don: "Tu don",
  sombra: "Tu sombra",
  cuerpo: "En tu cuerpo",
  "cuerpo-mujer": "Tu ciclo",
  "como-llamarlo": "Cómo llamarlo",
};

function pagina(kicker: string, cuerpo: string, extraClase = ""): string {
  return `<section class="pag ${extraClase}"><div class="kicker">${esc(kicker)}</div>${cuerpo}</section>`;
}

function titulo(linea1: string, linea2: string): string {
  return `<h1>${esc(linea1)}<em>${esc(linea2)}</em></h1>`;
}

/* Cruz dibujada: columnas a 28, 85 y 142 mm; filas cada 42 mm. Los ejes van en SVG detrás de los nodos. */
const CRUZ_X = [28, 85, 142];
const CRUZ_Y = 42;

function celdaHtml(c: CeldaCruz): string {
  const centro = c.posicion === "nacimiento";
  const canal = c.columna === 1 && !centro;
  return `<div class="celda${centro ? " centro" : ""}${canal ? " canal" : ""}" style="left:${CRUZ_X[c.columna]}mm;top:${c.fila * CRUZ_Y}mm">
    <div class="disco"><img src="${glifoUri(c.slug, centro ? "oro" : "bronce")}" alt=""></div>
    <div class="n">${esc(c.etiqueta)}</div><div class="r"><span class="punto" style="background:${MAIZ_PUNTO[c.maiz.color]}"></span>${esc(c.rotulo)}</div></div>`;
}

function cruzHtml(cruz: CruzOraculo): string {
  const cy = (f: number) => f * CRUZ_Y + 10.5;
  const fino = `stroke="#e2d1a2" stroke-width=".3"`;
  const oro = `stroke="#c9a54a" stroke-width=".6"`;
  const ejes =
    `<line x1="${CRUZ_X[0]}" y1="${cy(0)}" x2="${CRUZ_X[2]}" y2="${cy(0)}" ${fino}/>` +
    `<line x1="${CRUZ_X[0]}" y1="${cy(2)}" x2="${CRUZ_X[2]}" y2="${cy(2)}" ${fino}/>` +
    `<line x1="${CRUZ_X[0]}" y1="${cy(0)}" x2="${CRUZ_X[0]}" y2="${cy(2)}" ${fino}/>` +
    `<line x1="${CRUZ_X[2]}" y1="${cy(0)}" x2="${CRUZ_X[2]}" y2="${cy(2)}" ${fino}/>` +
    `<line x1="${CRUZ_X[0]}" y1="${cy(1)}" x2="${CRUZ_X[2]}" y2="${cy(1)}" ${oro}/>` +
    `<line x1="${CRUZ_X[1]}" y1="${cy(0)}" x2="${CRUZ_X[1]}" y2="${cy(2)}" ${oro}/>` ;
  return `<div class="cruz"><svg class="ejes" viewBox="0 0 170 126" aria-hidden="true">${ejes}</svg>${cruz.celdas.map(celdaHtml).join("")}</div>`;
}

const RUMBOS: [string, string][] = [
  ["Rojo", "Oriente"],
  ["Amarillo", "Sur"],
  ["Negro", "Oeste"],
  ["Blanco", "Norte"],
];

/** Cuántos de los nueve nahuales entran por cada puerta, con sus nombres. */
function rumbosHtml(cruz: CruzOraculo): string {
  return `<div class="rumbos">${RUMBOS.map(([color, rumbo]) => {
    const cs = cruz.celdas.filter((c) => c.maiz.color === color);
    const nombres = [...new Set(cs.map((c) => c.nahual))];
    return `<div class="rumbo${cs.length ? "" : " cero"}"><div class="d"><span class="punto" style="background:${MAIZ_PUNTO[color]}"></span>${esc(rumbo)} · ${esc(minus(color))}</div><div class="c">${cs.length}<small>de 9</small></div><div class="ns">${esc(nombres.join(", "))}</div></div>`;
  }).join("")}</div>`;
}

/* Textos calculados: pasan por el motor para que el género se resuelva igual que en content/. */
const T_PUERTAS_INTRO =
  "Los glifos son portales: no le dicen lo mismo a cada quien. Míralos un rato. ¿Qué te dicen a ti?\n\n" +
  "Hay cuatro puertas por donde la energía llega a tu vida. Rojo, el oriente: el amanecer, la infancia. Amarillo, el sur: la juventud, la valentía. " +
  "Negro, el oeste: el atardecer, {{la mujer sabia|el hombre sabio|la sabiduría}} que ya sabe. Blanco, el norte: la sabiduría del ancestro.";

const LEYENDA: [string, string][] = [
  ["Línea de arriba", "Tu origen: la energía que había cuando entraste en el vientre de tu mamá. No empezamos al nacer: ya veníamos haciéndonos. Te impulsa siempre."],
  ["Línea de en medio", "Tu nacimiento, tu presente, tu esencia: lo que siempre está contigo."],
  ["Línea de abajo", "Tu destino. Llega de lleno a los 52… y tú ya estás ahí. Te llama todo el tiempo."],
  ["Los lados", "A la izquierda de la hoja, tus nahuales de poder; a la derecha, los de esencia. En medio, tus manos: la derecha da, la izquierda recibe… y todo llega a tu corazón."],
];

const LISTA = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);
const minus = (s: string) => s.toLowerCase();

/** Lo que se calcula de la cruz, en texto. Cada frase solo aparece si el dato la sostiene. */
function parrafosPuertas(cruz: CruzOraculo, genero: Genero, valores: Record<string, string>): { titulo: [string, string]; html: string; recuadro: string | null } {
  const a = analizarCruz(cruz);
  const por = (col: 0 | 1 | 2) => cruz.celdas.filter((c) => c.columna === col).map((c) => c.nahual);
  const out: string[] = [T_PUERTAS_INTRO];

  if (a.canalUnico) {
    out.push(`Mira tu cruz. Todo tu canal central es maíz ${minus(a.canalUnico.color)}: ${LISTA(por(1))}. Nahuales del ${a.canalUnico.direccionTexto.split(",")[0].toLowerCase()}. Es el eje de tu cruz y marca su tono.`);
  } else {
    out.push(`Mira tu cruz. Tu canal central combina maíces: ${LISTA(cruz.celdas.filter((c) => c.columna === 1).map((c) => `${c.nahual} (${minus(c.maiz.color)})`))}.`);
  }
  if (a.ladosUnico) {
    out.push(`Y a los dos lados, en las seis casillas, solo hay maíz ${minus(a.ladosUnico.color)}: ${LISTA([...new Set(cruz.celdas.filter((c) => c.columna !== 1).map((c) => c.nahual))])}.`);
  }
  if (a.repetidos.length) {
    const rotulos = new Map(cruz.celdas.map((c) => [c.posicion, c.rotulo.split(" · ")[0].toLowerCase() + (c.rotulo.includes("·") ? " · " + c.rotulo.split(" · ")[1].toLowerCase() : "")]));
    out.push(
      "Fíjate además en lo que se repite. " +
        a.repetidos.map((r) => `${r.nahual} aparece ${r.posiciones.length === 2 ? "dos veces" : `${r.posiciones.length} veces`}: en ${LISTA(r.posiciones.map((p) => `tu ${rotulos.get(p)}`))}.`).join(" ")
    );
  }
  const html = mdAHtml(renderizarPlantilla(out.join("\n\n"), genero, valores, "maqueta:cuatro-puertas"));

  const N = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const k = a.enTuTrecena.length;
  const recuadro =
    k >= 2
      ? `${k === 9 ? "Todos" : N[k][0].toUpperCase() + N[k].slice(1)} de tus nueve nahuales viven dentro de tu propia trecena de ${cruz.trecena}: ${LISTA(a.enTuTrecena.map((c) => c.etiqueta))}.` +
        (a.todasImpares ? " Y todos caen en días impares: los días que crean, expanden, gestan, comparten y ofrendan." : "")
      : null;

  const t1 = a.canalUnico ? `Maíz ${minus(a.canalUnico.color)}` : "Tus cuatro puertas";
  const t2 = a.canalUnico && a.ladosUnico ? `custodiado por maíz ${minus(a.ladosUnico.color)}` : "lo que dicen los rumbos de tu cruz";
  return { titulo: [t1, t2], html, recuadro };
}

/* ───────────── Documento ───────────── */

export interface OpcionesMaqueta {
  /** Avisar «borrador» en el pie cuando el contenido no está aprobado. */
  marcaBorrador?: boolean;
}

export interface ResultadoMaqueta {
  html: string;
  pieDePagina: string;
  kin: string;
  trecena: string;
  /** Archivos de content/ que se usaron y siguen sin aprobar. */
  sinAprobar: string[];
  /** Archivos que se sirvieron con texto de relleno (solo muestras). */
  rellenadas: string[];
  /** Avisos de lo que se omitió por falta de contenido. */
  avisos: string[];
}

/**
 * Valores de los tokens {{…}} para el contenido, según content/oraculo/ESQUEMA.md:
 * `kin_compra` es el número de kin (1–260); `tono_compra`, el número del tono.
 */
export function valoresDe(datos: DatosOraculo): Record<string, string> {
  const dia = energiaDelDia(datos.fechaCompra);
  return {
    nombre: limpiarNombre(datos.nombre),
    fecha_compra: dia.fechaTexto,
    kin_compra: String(dia.kin),
    nahual_compra: dia.nahual,
    tono_compra: String(dia.tono),
    trecena_compra: dia.trecena,
  };
}

/** Primera oración de un texto (para «lo que se enciende» en la tabla de la trecena). */
export function primeraFrase(texto: string): string {
  const primero = texto.trim().split(/\n{2,}/)[0] ?? "";
  const m = /^(.+?[.!?…])(\s|$)/s.exec(primero);
  return (m ? m[1] : primero).replace(/\s+/g, " ").slice(0, 140);
}

/** Quita un «Nombre, » inicial y sube la mayúscula: «Ana, Imox es el agua.» → «Imox es el agua.» */
export function sinVocativo(frase: string, nombre: string): string {
  if (!frase.startsWith(`${nombre}, `)) return frase;
  const resto = frase.slice(nombre.length + 2);
  return resto.charAt(0).toUpperCase() + resto.slice(1);
}

const cita = (frase?: string) => (frase ? `<div class="cita">${versos(frase).map((v) => `<p>${esc(v)}</p>`).join("")}</div>` : "");

/** Cabecera de una casilla. `grande` abre la página con el glifo a 40 mm; la compacta va en las páginas dobles. */
function cabeceraCelda(c: CeldaCruz, etiqueta: string, linea: string, grande = false): string {
  return `<div class="cabecera${grande ? " grande" : ""}"><img src="${glifoUri(c.slug, "bronce")}" alt=""><div><div class="kicker">${esc(linea)}</div><div class="nombre"><span class="t">${c.tono}</span> <b>${esc(c.nahual)}</b></div><div class="sub2">${esc(etiqueta)} · maíz ${esc(minus(c.maiz.color))} · ${esc(c.maiz.elemento)}</div></div></div>`;
}

const CLAVE_A_POSICION: Record<string, CeldaCruz["posicion"]> = {
  "origen-concepcion": "origen-concepcion",
  "origen-poder": "origen-poder",
  "origen-esencia": "origen-esencia",
  nacimiento: "nacimiento",
  "mano-derecha": "mano-derecha",
  "mano-izquierda": "mano-izquierda",
  destino: "destino-52",
  "destino-poder": "destino-poder",
  "destino-esencia": "destino-esencia",
};

export function construirOraculo(datos: DatosOraculo, contenido: Contenido, opciones: OpcionesMaqueta = {}): ResultadoMaqueta {
  const nombre = limpiarNombre(datos.nombre);
  const genero = datos.genero;
  const valores = valoresDe(datos);
  const cruz = cruzOraculo(datos.fechaNacimiento);
  const nac = cruz.nacimiento;
  const dia = energiaDelDia(datos.fechaCompra);
  const avisos: string[] = [];
  let n = 0;
  const romano = () => ROMANOS[n++];

  const universal = contenido.universal();
  if (!universal) avisos.push("content/oraculo/universal.md no existe: se omiten las páginas universales.");
  const uni = (clave: string): string | null => {
    const t = universal?.secciones[clave];
    if (universal && !t) avisos.push(`universal.md no trae la sección «${clave}».`);
    return t || null;
  };

  const nahualNac = contenido.nahual(nac.slug);
  const tonoNac = contenido.tono(nac.tono);
  const pos = contenido.posiciones();
  const celda = (clave: string) => cruz.celdas.find((c) => c.posicion === CLAVE_A_POSICION[clave])!;
  const porPos = (clave: string) => contenido.nahual(celda(clave).slug).subsecciones["por-posicion"]?.[clave] ?? (avisos.push(`nahual/${celda(clave).slug}.md: falta «### ${clave}» en por-posicion.`), "");
  const frase = (clave: string) => contenido.tono(celda(clave).tono).secciones.frase;

  /** Página de posición con la receta del ESQUEMA: P#texto + N#por-posicion + T#frase. */
  const bloquePos = (clave: string, grande = false) => {
    const c = celda(clave);
    const p = pos[clave];
    return (
      cabeceraCelda(c, p.meta.etiqueta ?? "", [p.meta.linea, p.meta.lado].filter(Boolean).join(" · "), grande) +
      mdAHtml(p.secciones.texto ?? "") +
      (porPos(clave) ? `<div class="cita">${mdAHtml(porPos(clave))}</div>` : "")
    );
  };

  const paginas: string[] = [];

  /* 1 · Portada */
  const lema = uni("portada-lema");
  paginas.push(`<section class="oscura portada"><div class="marco"></div><div class="marco2"></div>
    <img class="logo" style="top:15mm" src="${logoUri()}" alt="Azul Anaité">
    <div class="anillo"></div><img class="glifo" src="${glifoUri(nac.slug, "oro")}" alt="">
    <div class="centrado k1">Lectura personal · Cholq'ij</div>
    <div class="centrado titulo">Oráculo Maya</div>
    <div class="centrado nom" style="font-size:${tamanoNombrePortada(nombre)}pt">${esc(nombre)}</div>
    <div class="centrado kin">${esc(nac.etiqueta)}</div><div class="filete"></div>
    <div class="centrado l1">Naciste en ${esc(nac.etiqueta)} · trecena de ${esc(cruz.trecena)}</div>
    <div class="centrado l2">Lectura del ${esc(dia.fechaTexto)} · ${esc(dia.etiqueta)}, trecena de ${esc(dia.trecena)}</div>
    ${lema ? `<div class="lema">${esc(lema)}</div>` : ""}
  </section>`);

  /* 2 · Apertura */
  const decreto = nahualNac.secciones.decreto ?? "";
  const apertura = uni("apertura");
  paginas.push(pagina(`Apertura`, titulo("Tu energía,", "en una sola respiración") + `<hr class="regla">` + (decreto ? mantra(decreto) + ORN : "") + (apertura ? mdAHtml(apertura) : "")));

  /* 3 · El Cholq'ij */
  const cholqij = uni("cholqij");
  if (cholqij) paginas.push(pagina(`${romano()} · El Cholq'ij`, titulo("El calendario sagrado,", "la cuenta del destino") + `<hr class="regla">` + CIFRAS_CHOLQIJ + mdAHtml(cholqij)));

  /* 4 · Promesa y cómo leer */
  const promesa = uni("promesa");
  const comoUsar = uni("como-usar");
  if (promesa || comoUsar) {
    paginas.push(pagina(`${romano()} · Cómo leer esto`, titulo("La promesa,", "y cómo leer esto") + `<hr class="regla">` + (promesa ? mdAHtml(promesa) : "") + (comoUsar ? `<h2>Cómo usarlo</h2>${mdAHtml(comoUsar)}` : "")));
  }

  /* 5 · El día de tu compra */
  const diaCompra = uni("dia-de-compra");
  const nahualDia = contenido.nahual(dia.slug);
  const esenciaDia = (nahualDia.secciones.esencia ?? "").trim().split(/\n{2,}/).slice(0, 2).join("\n\n");
  paginas.push(
    pagina(
      `${romano()} · El día de tu compra`,
      `<div class="cabecera grande"><img src="${glifoUri(dia.slug, "bronce")}" alt=""><div><div class="kicker">${esc(dia.fechaTexto)} · trecena de ${esc(dia.trecena)}</div><div class="nombre"><span class="t">${dia.tono}</span> <b>${esc(dia.nahual)}</b></div><div class="sub2">Kin ${dia.kin} · maíz ${esc(minus(dia.maiz.color))} · ${esc(dia.maiz.elemento)}</div></div></div>` +
        (diaCompra ? mdAHtml(diaCompra) : "") +
        (esenciaDia ? `<h2>${esc(dia.nahual)}, el nahual del día</h2>${mdAHtml(esenciaDia)}` : "") +
        cita(contenido.tono(dia.tono).secciones.frase)
    )
  );

  /* 6 · Cruz */
  paginas.push(
    pagina(
      `${romano()} · Tu huella energética`,
      titulo("Tu cruz de destino,", "tus nueve nahuales") +
        `<p class="sub">No eres una sola energía… eres nueve.</p>` +
        cruzHtml(cruz) +
        `<div class="leyenda">${LEYENDA.map(([a, b]) => `<div>${esc(a)}</div><div>${esc(b)}</div>`).join("")}</div>`
    )
  );

  /* 7 · Cuatro puertas */
  const puertas = parrafosPuertas(cruz, genero, valores);
  paginas.push(
    pagina(
      `${romano()} · Las cuatro puertas`,
      titulo(puertas.titulo[0] + ",", puertas.titulo[1]) +
        `<p class="sub">Lo que dicen los rumbos de tu cruz</p>` +
        rumbosHtml(cruz) +
        puertas.html +
        (puertas.recuadro ? `<div class="recuadro"><div class="kicker">Algo que casi nadie ve en su cruz</div><p>${esc(puertas.recuadro)}</p></div>` : "")
    )
  );

  /* 8 · Tu tono */
  paginas.push(
    pagina(
      `${romano()} · Tu tono`,
      titulo(`El ${nac.tono},`, tonoNac.meta.significado ? minus(tonoNac.meta.significado) : "tu potencia") +
        tiraTonos(nac.tono) +
        seccion(tonoNac, "esencia") +
        seccion(tonoNac, "como-se-vive", "Cómo se vive") +
        cita(tonoNac.secciones.frase),
      "media"
    )
  );

  /* 9 · Tu trecena */
  const marcaPos: Record<string, string> = { "origen-concepcion": "Tu origen", "origen-poder": "Tu poder de origen", "origen-esencia": "Tu esencia de origen", "mano-derecha": "Tu mano derecha", nacimiento: "Tu día. Tu nacimiento.", "mano-izquierda": "Tu mano izquierda", "destino-poder": "Tu poder de destino", "destino-52": "Tu destino", "destino-esencia": "Tu esencia de destino" };
  const filas = tablaTrecena(cruz)
    .map((d) => {
      const marcas = d.marcas.map((m) => marcaPos[m.posicion]);
      // En la tabla va sin el vocativo «Nombre, …»: con un nombre largo cada fila crecía y la página desbordaba.
      const enciende = sinVocativo(primeraFrase(contenido.nahual(NOMBRES_NAHUAL_SLUG(d.nahual)).secciones.esencia ?? ""), nombre);
      return `<tr class="${[d.marcas.length ? "marca" : "", d.esTuDia ? "tuyo" : ""].join(" ").trim()}"><td><img src="${glifoUri(NOMBRES_NAHUAL_SLUG(d.nahual), "bronce")}" alt="">${d.dia} ${esc(d.nahual)}</td><td>${esc(contenido.tono(d.dia).meta.paso ?? "")}</td><td>${esc(enciende)}${marcas.length ? ` <strong>${esc(marcas.join(" · "))}</strong>` : ""}</td></tr>`;
    })
    .join("");
  const regresos = proximosRegresos(datos.fechaNacimiento, datos.fechaCompra, 3).map((f) => fechaLarga(f));
  paginas.push(
    pagina(
      `${romano()} · Tu trecena`,
      titulo(`${cruz.trecena},`, "la energía a la que sirves") +
        `<p class="sub">Tu trecena es el entrenamiento de tu vida</p>` +
        `<p>Cada nahual se da a luz a lo largo de trece días. Naciste el día ${nac.tono} de la trecena de ${esc(cruz.trecena)}: tu nahual de nacimiento es quién eres; tu trecena es para qué viniste a entrenarte.</p>` +
        `<table class="trecena"><thead><tr><th>Día</th><th>El paso</th><th>Lo que se enciende</th></tr></thead><tbody>${filas}</tbody></table>` +
        seccion(tonoNac, "paso-de-la-trecena", `Tu día ${nac.tono} en la trecena`) +
        `<p>Tu ${esc(nac.etiqueta)} vuelve a caer el ${esc(LISTA(regresos))}. Cada regreso es una puerta abierta: un buen día para volver a leer esta página.</p>`,
      "chica"
    )
  );

  /* 10–12 · Origen */
  for (const clave of ["origen-concepcion", "origen-poder", "origen-esencia"]) {
    const extra = clave === "origen-concepcion" && pos[clave].secciones.pregunta ? `<p class="pregunta">${esc(pos[clave].secciones.pregunta)}</p>` : "";
    paginas.push(pagina(`${romano()} · ${pos[clave].meta.etiqueta}`, bloquePos(clave, true) + cita(frase(clave)) + extra));
  }

  /* 13 · Nacimiento: el glifo abre la sección; el texto del nahual corre en las hojas siguientes */
  const cNac = celda("nacimiento");
  paginas.push(
    pagina(
      `${romano()} · ${pos.nacimiento.meta.etiqueta}`,
      `<div class="apertura-nahual"><img src="${glifoUri(cNac.slug, "bronce")}" alt=""><div class="kicker">${esc([pos.nacimiento.meta.linea, pos.nacimiento.meta.lado].filter(Boolean).join(" · "))}</div>` +
        `<div class="nombre">${cNac.tono} <b>${esc(cNac.nahual)}</b></div><div class="sub2">${esc(pos.nacimiento.meta.etiqueta ?? "")} · maíz ${esc(minus(cNac.maiz.color))} · ${esc(cNac.maiz.elemento)}</div><hr class="regla"></div>` +
        mdAHtml(pos.nacimiento.secciones.texto ?? "") +
        (porPos("nacimiento") ? `<div class="cita">${mdAHtml(porPos("nacimiento"))}</div>` : "")
    )
  );

  /* 14 · A fondo: esencia, guardián, don, sombra y cómo llamarlo, de corrido */
  paginas.push(
    pagina(
      `${romano()} · ${nac.nahual} a fondo`,
      titulo(`${nac.nahual},`, "a fondo") +
        `<hr class="regla">` +
        seccion(nahualNac, "esencia", "La esencia") +
        seccion(nahualNac, "animal-y-elemento", "Tu guardián y tu elemento") +
        seccion(nahualNac, "don", "Tu don") +
        seccion(nahualNac, "sombra", "Tu sombra") +
        seccion(nahualNac, "como-llamarlo", "Cómo llamarlo") +
        ORN
    )
  );

  /* 15 · Tus manos */
  paginas.push(
    pagina(
      `${romano()} · Tus manos`,
      `<div class="dos">${["mano-derecha", "mano-izquierda"].map((k) => `<div class="bloque">${bloquePos(k)}</div>`).join("")}</div>`
    )
  );

  /* 16 · Destino */
  paginas.push(pagina(`${romano()} · ${pos.destino.meta.etiqueta}`, bloquePos("destino", true) + cita(frase("destino"))));

  /* 17 · Destino: poder y esencia */
  paginas.push(
    pagina(
      `${romano()} · Destino · poder y esencia`,
      `<div class="dos">${["destino-poder", "destino-esencia"].map((k) => `<div class="bloque">${bloquePos(k)}</div>`).join("")}</div>`
    )
  );

  /* 18 · Cuerpo */
  paginas.push(
    pagina(`${romano()} · Tu cuerpo`, titulo("Tu cuerpo,", `donde vive ${nac.nahual}`) +
        `<hr class="regla">` +
        // sin el bloque de ciclo la página queda a media hoja: el glifo la equilibra
        (nahualNac.secciones["cuerpo-mujer"] ? "" : `<img class="glifo-cuerpo" src="${glifoUri(nac.slug, "bronce")}" alt="">`) +
        seccion(nahualNac, "cuerpo") +
        seccion(nahualNac, "cuerpo-mujer", "Tu ciclo"))
  );

  /* 19 · Canal central */
  const canal = ["origen-concepcion", "nacimiento", "destino"].map(celda);
  const a = analizarCruz(cruz);
  paginas.push(
    pagina(
      `${romano()} · Tu canal central`,
      titulo("Origen, nacimiento", "y destino") +
        `<hr class="regla">` +
        `<p>El centro de tu cruz es una línea que va de lo que te impulsa a lo que te llama: ${esc(canal[0].etiqueta)} en tu origen, ${esc(canal[1].etiqueta)} en tu nacimiento y ${esc(canal[2].etiqueta)} en tu destino.${a.canalUnico ? ` Los tres son maíz ${esc(minus(a.canalUnico.color))}.` : ""}</p>` +
        `<div class="canal-v"><div class="eje"></div>${canal
          .map((c) => {
            const centro = c.posicion === "nacimiento";
            return `<div class="tramo${centro ? " centro" : ""}"><div class="disco"><img src="${glifoUri(c.slug, centro ? "oro" : "bronce")}" alt=""></div><div><div class="decreto-de">${esc(c.rotulo.split(" · ")[0])} · ${esc(c.etiqueta)}</div><div class="mantra">${versos(contenido.nahual(c.slug).secciones.decreto ?? "").map((v) => `<p>${esc(v)}</p>`).join("")}</div></div></div>`;
          })
          .join("")}</div>`,
      "compacto"
    )
  );

  /* 20 · Preguntas */
  const claves = Object.values(pos).sort((x, y) => Number(x.meta.numero) - Number(y.meta.numero));
  paginas.push(
    pagina(
      `${romano()} · Para llevar adentro`,
      titulo("Nueve preguntas", "para llevar adentro") +
        `<hr class="regla"><div class="preguntas">${claves
          .filter((p) => p.secciones.pregunta)
          .map((p) => `<div class="preg"><img src="${glifoUri(celda(p.meta.clave ?? "").slug, "bronce")}" alt=""><div><div class="e">${esc(p.meta.etiqueta ?? "")}</div><div class="q">${esc(p.secciones.pregunta)}</div><div class="raya"></div></div></div>`)
          .join("")}</div>`
    )
  );

  /* 21 · Cierre */
  const cierre = uni("cierre");
  if (cierre) {
    const ps = cierre.split(/\n{2,}/);
    const lead = ps[0];
    const mantraFinal = ps.length > 2 ? ps[ps.length - 1] : "";
    const medio = ps.slice(1, mantraFinal ? -1 : undefined);
    paginas.push(`<section class="oscura cierre"><div class="marco"></div><div class="marco2"></div>
      <img class="glifo" src="${glifoUri(nac.slug, "oro")}" alt="">
      <div class="cuerpo"><div class="t1">${esc(lead)}</div>${medio.map((m) => `<div class="t2">${esc(m)}</div>`).join("")}${mantraFinal ? `<div class="t3">${versos(mantraFinal).map(esc).join("<br>")}</div>` : ""}</div>
      <img class="logo" src="${logoUri()}" alt="Azul Anaité">
      <div class="centrado contacto">@azulanaite · azulanaite.com</div>
      <div class="centrado legal">© ${datos.fechaCompra.slice(0, 4)} Azul Anaité. Todos los derechos reservados. Este material es personal e intransferible; queda prohibida su reproducción, total o parcial, sin autorización por escrito.</div>
    </section>`);
  }

  /* 22 · Aviso */
  const aviso = uni("aviso");
  if (aviso)
    paginas.push(
      pagina(`${romano()} · Aviso`, `<div class="aviso-fin">${titulo("Una lectura", "simbólica")}<div class="aviso">${mdAHtml(aviso)}</div></div>`, "aviso-pag")
    );

  const sinAprobar = contenido.sinAprobar();
  const nombrePie = nombre.length > 24 ? `${nombre.slice(0, 23).trimEnd()}…` : nombre;
  const pieDePagina = `Oráculo Maya · ${nombrePie} · ${nac.etiqueta}`;
  const borrador = (opciones.marcaBorrador ?? true) && sinAprobar.length > 0;
  const pieDerecho = uni("pie") ?? "© Azul Anaité";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(`Oráculo Maya · ${nombre} · ${nac.etiqueta}`)}</title><style>${css(pieDePagina, pieDerecho, borrador)}</style></head><body>${paginas.join("\n")}</body></html>`;
  return { html, pieDePagina, kin: nac.etiqueta, trecena: cruz.trecena, sinAprobar, rellenadas: [...contenido.rellenadas], avisos: [...new Set(avisos)] };
}

const NOMBRES_NAHUAL_SLUG = (nombre: string) => nahualToSlug[nombre];
