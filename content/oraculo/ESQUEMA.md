---
estado: borrador-claude
revision: pendiente-azul
---

# Tu Mapa de Energía · esquema de páginas

Producto: el Oráculo Maya de Azul Anaité mezclado con el Mapa de tunahual.com. 22 páginas A4. La fecha de referencia es la de **compra**; no hay lenguaje de «sesión».

Notación: `archivo#seccion`. `N` = nahual (slug en `nahual/<slug>.md`), `T` = tono (`tono/<n>.md`), `P` = posición (`posicion/<1-9>.md`). «Calculado» = plantilla con reglas, sin texto de Azul.

## Orden de páginas

| Pág. | Página | Sale de |
|---|---|---|
| 1 | Portada | `{{nombre}}`, tono + nahual de nacimiento, trecena (calculado), `{{fecha_compra}}`, `universal#portada-lema` |
| 2 | Apertura | `universal#apertura` + `N(nacimiento)#decreto` como mantra de entrada |
| 3 | El Cholq'ij | `universal#cholqij` |
| 4 | La promesa y cómo leer esto | `universal#promesa` + `universal#como-usar` |
| 5 | El día de tu compra | `universal#dia-de-compra` + `N(día de compra)#esencia` (resumen) + `T(día de compra)#frase` |
| 6 | Tu cruz de destino | Diagrama de 9 glifos (calculado) con `P1..P9` frontmatter `etiqueta` como leyenda |
| 7 | Las cuatro puertas | Maíz, elemento y rumbo por casilla (calculado, `src/data/maices.ts`); repeticiones (calculado) |
| 8 | Tu tono | `T(nacimiento)#esencia` + `#como-se-vive` + `#frase` |
| 9 | Tu trecena | Tabla de 13 días (calculado): columna «el paso» = `tono/<n>` frontmatter `paso`; «lo que se enciende» = `N#esencia` (1.ª línea); `T(nacimiento)#paso-de-la-trecena`; fechas de regreso (calculado, +260 días) |
| 10 | Origen · concepción | `P1#texto` + `N#por-posicion/origen-concepcion` + `T#frase` + `P1#pregunta` |
| 11 | Origen · poder | `P2` + `N#por-posicion/origen-poder` + `T#frase` |
| 12 | Origen · esencia | `P3` + `N#por-posicion/origen-esencia` + `T#frase` |
| 13 | Tu esencia · nacimiento | `P4` + `N#esencia` + `N#animal-y-elemento` + `N#por-posicion/nacimiento` |
| 14 | Tu nahual de nacimiento, a fondo | `N#don` + `N#sombra` + `N#como-llamarlo` |
| 15 | Tus manos | `P5` + `N#por-posicion/mano-derecha` · `P6` + `N#por-posicion/mano-izquierda` |
| 16 | Destino · desde los 52 | `P7` + `N#por-posicion/destino` + `T#frase` |
| 17 | Destino · poder y esencia | `P8` + `N#por-posicion/destino-poder` · `P9` + `N#por-posicion/destino-esencia` |
| 18 | Tu cuerpo | `N(nacimiento)#cuerpo` + `N(nacimiento)#cuerpo-mujer` (solo mujer) |
| 19 | Tu canal central | Origen, nacimiento y destino juntos (calculado) + `N#decreto` de los tres |
| 20 | Preguntas para llevar adentro | `P1..P9#pregunta` (las nueve) |
| 21 | Cierre | `universal#cierre` |
| 22 | Aviso | `universal#aviso` |

`universal#pie` va en el pie de **todas** las páginas salvo la portada, con el número de página.

## Páginas que se pueden quitar para llegar a 18

14, 17 (fusionar en 16), 19 y 20 (mover las preguntas al final de cada página de posición).

## Posiciones de la cruz

Numeración de `posicion/<n>.md` y su equivalencia en `src/utils/mayanCalculations.ts` (`calculateMayanCrossFromDB`). La `clave` coincide con las subsecciones `### <clave>` de `nahual/<slug>.md#por-posicion`.

| n | clave | Código | Lado en la hoja |
|---|---|---|---|
| 1 | origen-concepcion | `concepcion.centro` | arriba, centro |
| 2 | origen-poder | `concepcion.derecho` (−6) | arriba, izquierda |
| 3 | origen-esencia | `concepcion.izquierdo` (+6) | arriba, derecha |
| 4 | nacimiento | `nacimiento.centro` | centro |
| 5 | mano-derecha | `nacimiento.derecho` (−6) | centro, izquierda |
| 6 | mano-izquierda | `nacimiento.izquierdo` (+6) | centro, derecha |
| 7 | destino | `destino.centro` | abajo, centro |
| 8 | destino-poder | `destino.derecho` (−6) | abajo, izquierda |
| 9 | destino-esencia | `destino.izquierdo` (+6) | abajo, derecha |

Ojo: en el código, `derecho` es el −6, que en el PDF de Azul se dibuja a la **izquierda** de la hoja (poder / mano derecha). No usar `calculateMayanCross` de `mayanCalendar.ts`: da otra cruz.

## Marcadores

- `{{nombre}}`, `{{fecha_compra}}` (fecha larga en español, p. ej. «4 de octubre de 2026»).
- `{{kin_compra}}` = número de kin 1–260; `{{tono_compra}}` = número del tono (1–13); `{{nahual_compra}}` = nombre del nahual; `{{trecena_compra}}` = nombre del nahual que abre la trecena. Todos del día de compra.
- Género: `{{femenino|masculino|neutro}}`; se elige una de las tres según lo que marque quien compra.
- `<!--solo:mujer-->` … `<!--/solo-->`: se borra el bloque completo si quien compra no es mujer. Puede envolver una sección entera (`## cuerpo-mujer`).
- Encabezados `## clave` separan secciones; el título visible de cada página lo pone la plantilla, no el `.md`.
