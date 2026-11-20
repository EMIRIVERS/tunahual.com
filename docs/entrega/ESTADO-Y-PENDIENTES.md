# Estado al 20 de noviembre de 2026

## Funciona hoy en producción

- Calculadora del Cholq'ij: nahual, tono, glifo, maíz, elemento y trecena, libres para cualquiera.
- Lectura por capas: la Cruz Maya y «El cielo de tu nacimiento» (luna, Cuenta Larga, Haab') se abren al dejar nombre, correo y WhatsApp, con aceptación de términos y privacidad.
- Guardado de leads en Supabase y panel `/admin` con exportación a CSV.
- Páginas por nahual (`/nahuales`, `/nahual/:slug`), por kin (`/kin`, `/kin/:kin`) y de resultado compartible.
- Widget «Energía de hoy» con la luna del día.
- Tarjeta 9:16 para historias de Instagram.
- App instalable (PWA) con pantalla sin conexión.
- Video de fondo (oculto en móvil), 404 en español, canonical a `www`.

## Construido pero apagado a propósito

| Pieza | Por qué está apagada | Qué falta para encender |
|---|---|---|
| Cobro del Oráculo Maya (Stripe, 11 USD) | Lo decidimos así hasta que Azul Anaité apruebe los textos | Aprobar los 44 archivos de `content/oraculo` (hoy en `revision: pendiente-azul`), confirmar precio, verificar dominio en Resend, compra de prueba. Pasos en `docs/activar-ventas.md`. |
| Generación del PDF del Oráculo (~24 páginas) | Depende de lo anterior | Igual. Probado de punta a punta en Preview: ~6 s, ~430 MB. |
| Correo de la lectura (Resend) | Dominio `tunahual.com` sin verificar en Resend (403) | Verificar el dominio en la cuenta de `shakticacao@gmail.com`. |
| Copia de leads al CRM Azul Anaité OS | En Vercel faltan `AZULANAITEOS_URL` y `AZULANAITEOS_TRECENA_ID`, y la llave puesta es de un proyecto viejo | Cargar las tres variables del proyecto `zuimegiggyumwbpimdhv` y volver a publicar. |
| Etiquetas en Kajabi | Falta `KAJABI_WEBHOOK_URL` | Crear el webhook en Kajabi (o Make/Zapier). |
| Cargador del año | Faltan los textos de los cuatro cargadores | `CARGADOR_HABILITADO` en `src/utils/cargador.ts`; decidir el ancla (1 Kej vs 2 Kej). |
| Analítica (GA4, Meta Pixel) y Sentry | No hay cuentas configuradas | Poner las variables y volver a publicar. |

## Decisiones abiertas (de la clienta)

1. Aprobación de los textos del Oráculo (`content/oraculo`).
2. Precio final y si el Oráculo reemplaza al Mapa de 8 páginas.
3. Zona horaria de la «fecha de compra» (hoy Ciudad de México).
4. Textos de las páginas 2, 7 y 8 del Mapa de Energía (llevan pie «BORRADOR»).
5. Direcciones Este, Norte y Sur de los maíces (solo Oeste está confirmada).

## Deuda técnica conocida

- `bun run lint` marca 6 errores heredados de la plantilla inicial (tipos `any`, interfaces vacías, un `require` en `tailwind.config.ts`). No afectan al sitio.
- Usar `bun run test` (Vitest). `bun test` a secas corre otro motor y da fallos falsos.
- `@vercel/og` no funciona en este proyecto; la imagen dinámica para redes está pendiente con otra técnica.
- Hay un aviso de `bun pm untrusted` por dos scripts de instalación bloqueados; no afectan al build.

## Historia del código (por si alguien revisa git)

El historial de GitHub llegaba hasta el 2 de octubre de 2026. Los commits posteriores (lectura por capas, Oráculo, cobro) se publicaron a Vercel desde otra máquina y no se subieron a GitHub. El 20 de noviembre de 2026 recuperamos el código exacto del deployment de producción y lo subimos como un solo commit sobre `master`, así que `master` vuelve a ser idéntico a lo que sirve el sitio.
