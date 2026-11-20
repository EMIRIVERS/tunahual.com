# Oráculo Maya: generación asíncrona del PDF

Estado al 5-oct-2026: **desplegado en producción y apagado** (`ORACULO_PDF_HABILITADO` sin definir). Migraciones aplicadas, bucket `oraculos` creado, probado de punta a punta en un Preview. Pasos para abrir ventas: `docs/activar-ventas.md`.

## Qué es el producto

«Tu Mapa de Energía» (11 USD por ahora) pasa a ser el Oráculo Maya en PDF: unas 24 páginas A4 armadas desde `content/oraculo/` (textos de Azul Anaité, en borrador) con el nombre, la fecha de nacimiento y el género de quien compra, más la energía del día de la compra. El PDF se genera **a pedido**; no hay 260 PDFs pregenerados.

## Piezas

| Pieza | Dónde |
|---|---|
| Motor de plantilla (tokens, género, bloques solo-mujer) | `src/lib/oraculo/plantilla.ts` |
| Lectura de `content/oraculo/*.md` | `src/lib/oraculo/contenido.ts` |
| Kin, cruz de nueve, trecena, regresos | `src/lib/oraculo/calculo.ts` (usa `mayanCalculations.ts`) |
| Maqueta HTML/CSS A4 | `src/lib/oraculo/maqueta.ts`, fuentes y glifos en `assets/oraculo/` |
| HTML a PDF con Chromium | `src/lib/oraculo/render.ts` |
| Muestra local / lote de 260 | `bun run oraculo:muestra`, `bun run oraculo:lote` |
| Generación asíncrona (lógica y handler) | `api/_oraculo/generar.ts` (el prefijo `_` evita que Vercel la publique) |
| Aviso desde el webhook | `encolarOraculo` en `api/stripe-webhook.ts`, solo con `ORACULO_PDF_HABILITADO=1` |

## Flujo

```
Stripe ─checkout.session.completed─> api/stripe-webhook
                                       │ guarda el pedido (genero, fecha_compra, generacion_estado = pendiente)
                                       │ responde 200 enseguida; avisa a /api/generar-oraculo (mejor esfuerzo, 2,5 s)
                                       ▼
                          api/generar-oraculo  (función aparte, su propio maxDuration)
                            1. lee el pedido y lo TOMA con bloqueo optimista (dos ejecuciones no chocan)
                            2. arma el HTML con el género elegido (sin género: neutro, nunca se adivina)
                            3. rechaza si el contenido no está aprobado por Azul (revision: aprobada)
                            4. Chromium imprime el PDF
                            5. lo sube a Supabase Storage, bucket PRIVADO «oraculos», ruta <session_id>.pdf
                            6. firma un enlace de 7 días y envía el correo por Resend (adjunto si ≤ 8 MB + enlace)
                            7. marca listo + entregado
```

Si algo falla: `generacion_estado = fallido`, se reintenta hasta 3 veces; un `generando` de más de 10 min se considera huérfano y se retoma. Pasados los 3 intentos queda para revisión manual.

Reproceso: `POST /api/generar-oraculo {"session_id":"cs_…"}` con `Authorization: Bearer $ORACULO_TOKEN`, o `GET /api/generar-oraculo?pendientes=1` con `Authorization: Bearer $CRON_SECRET` (el cron diario de Vercel).

## Límites de Vercel (confirmados el 5-oct-2026)

Verificado por API: el equipo `emi-rivers-projects` está en plan `hobby` y el proyecto `tu-nahual` tiene Fluid Compute activo (`resourceConfig.fluid = true`), región `iad1`, Node 24. `maxDuration: 300` se desplegó sin error. Mediciones reales en el Preview: función completa ~6,3 s en frío y ~3,5 s en caliente, pico de RSS Node + Chromium ~430 MB (muestreado por el código, porque Observabilidad de Vercel requiere Pro). La función termina aunque quien la llamó corte a los 2,5 s (probado con `curl -m 2.5`). Lo de abajo es la estimación original, que las mediciones superan con holgura.

- **Duración.** Sin Fluid Compute, una función en Hobby tiene 10 s por defecto y hasta 60 s con `maxDuration`. Con Fluid Compute el máximo en Hobby es 300 s. La generación local tarda ~1,2 s con el navegador ya abierto y ~2 s en frío; en Vercel hay que sumar la descompresión de Chromium (`@sparticuz/chromium`, ~65 MB) y una CPU más lenta: estimación 10 a 30 s. Dentro de 60 s, pero hay que medirlo.
- **Memoria.** Hobby: 2 GB fijos; Pro con Fluid hasta 4 GB. Medido local: pico de **~1,2 GB** entre todos los procesos de Chromium, más ~220 MB de Node. Cabe en 2 GB con poco margen: no generar dos PDFs a la vez en la misma instancia (el cron procesa 2 por corrida, en serie).
- **Tamaño del paquete.** Chromium comprimido + `content/` + `assets/oraculo/` (~7 MB) queda muy por debajo del límite de 250 MB, pero `includeFiles` debe incluir `content/oraculo/**` y `assets/oraculo/**` (ver abajo).
- **Cron.** En Hobby un cron de Vercel corre como máximo una vez al día. No sirve como cola de reintentos rápida: la entrega normal depende del aviso del webhook; el cron es la red de seguridad. Si un pedido queda pendiente más de 15 minutos, hay que revisarlo a mano (o activar alerta).
- **Aviso del webhook.** El webhook espera como máximo 2,5 s a `generar-oraculo` y sigue. Se asume que la función destino termina aunque quien la llamó corte la conexión; **verificarlo en un preview** (si no, usar un Database Webhook de Supabase o `waitUntil`).

## Mediciones locales (Mac, Chrome 154, 4-oct-2026)

Ver el reporte de la orden; en resumen: 260 PDFs (uno por kin) por cada género, sin errores, 24 páginas todos, 2,0 a 2,3 MB cada uno, mediana ~1,2 s por PDF con Chromium abierto, pico ~1,2 GB de Chromium.

## Activación

Hechos el 5-oct-2026: migración `20261006000000` aplicada y registrada; bucket privado `oraculos` creado (10 MB, solo PDF, sin políticas); `api/generar-oraculo.ts` publicado; `vercel.json` con `functions`, `crons` y `X-Robots-Tag`; `ORACULO_TOKEN` y `CRON_SECRET` en Production (Keychain `oraculo-tunahual-token` y `oraculo-tunahual-cron`).

**Último paso, a cargo de Emi y solo con el contenido aprobado por Azul:** `ORACULO_PDF_HABILITADO=1` en Production y redeploy. Ver el orden completo en `docs/activar-ventas.md`.

Mientras el contenido tenga `revision: pendiente-azul` la función **se niega a entregar** (queda `fallido`, no reintentable). `ORACULO_PERMITIR_BORRADOR=1` y `ORACULO_SIN_CORREO=1` lo saltan y solo valen fuera de producción (`VERCEL_ENV !== "production"`).

## Decisiones abiertas

- Precio (11 USD por ahora) y si el Oráculo reemplaza al Mapa de 8 páginas o se vende aparte.
- Zona horaria de la «fecha de compra» (hoy Ciudad de México): decide qué día cuenta para quien compra cerca de medianoche.
- Quién aprueba el contenido y cuándo; mientras tanto la función no entrega.
- Qué pasa con las páginas que el esquema deja opcionales (ver `content/oraculo/ESQUEMA.md`).
