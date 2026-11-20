# Variables de entorno

Dos reglas que ya costaron caro:

1. **Las variables `VITE_*` se hornean al compilar.** Cambiarlas en Vercel no hace nada hasta volver a publicar (redeploy).
2. **Las variables de Vercel se congelan en cada deployment.** Quitar una variable tampoco tiene efecto hasta el siguiente deploy.

Las que no llevan `VITE_` son secretas y solo existen en el servidor (funciones de `/api`). Nunca ponerlas con prefijo `VITE_`.

## Imprescindibles (sin ellas el sitio no carga)

| Variable | Tipo | Valor |
|---|---|---|
| `VITE_SUPABASE_URL` | build | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build | llave `anon` del proyecto Supabase |
| `VITE_SUPABASE_PROJECT_ID` | build | `<ref>` |

## Captación de leads

| Variable | Tipo | Qué hace | Estado hoy |
|---|---|---|---|
| `AZULANAITEOS_URL` | servidor | URL del Supabase del CRM | **falta** |
| `AZULANAITEOS_SERVICE_KEY` | servidor | Llave service role del CRM | puesta, pero de un proyecto viejo |
| `AZULANAITEOS_TRECENA_ID` | servidor | UUID de la fila «Tu Nahual» en la tabla `trecenas` del CRM | **falta** |
| `KAJABI_WEBHOOK_URL` | servidor | Webhook que recibe el contacto con etiquetas | **falta** |
| `RESEND_API_KEY` | servidor | Envía la lectura por correo | puesta (dominio sin verificar) |
| `EMAIL_FROM` | servidor | Remitente, p. ej. `Tu Nahual <tu-nahual@tunahual.com>` | sin definir (usa el valor por defecto) |

Sin estas, el lead **sí se guarda** en la base del sitio y aparece en el panel; solo deja de copiarse al CRM, a Kajabi o al correo.

## Cobro y Oráculo (todo apagado a propósito)

| Variable | Tipo | Qué hace |
|---|---|---|
| `STRIPE_SECRET_KEY` | servidor | Llave restringida de Stripe |
| `STRIPE_WEBHOOK_SECRET` | servidor | Firma del webhook |
| `STRIPE_PRICE_ID` | servidor | Precio del producto |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | Para guardar pedidos y subir PDFs |
| `ORACULO_TOKEN` | servidor | Reproceso manual de pedidos |
| `CRON_SECRET` | servidor | Cron diario de reintentos (14:00 UTC) |
| `ORACULO_TZ` | servidor | Zona de la «fecha de compra» (por defecto `America/Mexico_City`) |
| `CHECKOUT_HABILITADO` | servidor | **Interruptor** del cobro. Sin `1`, el checkout responde 503. |
| `ORACULO_PDF_HABILITADO` | servidor | **Interruptor** de la generación del PDF. |
| `VITE_CHECKOUT_MAPA` | build | **Interruptor** del botón de compra en la lectura. |
| `MAPA_PDF_BASE_URL` | servidor | Solo para el Mapa viejo de 8 páginas; no hace falta con el Oráculo. |
| `ORACULO_PERMITIR_BORRADOR`, `ORACULO_SIN_CORREO` | servidor | Solo pruebas en Preview. **Nunca en Production.** |

Orden para encender: generación → cobro → botón. Detalle en `docs/activar-ventas.md` del código.

## Opcionales

| Variable | Tipo | Qué hace |
|---|---|---|
| `VITE_GA_ID` | build | Google Analytics 4 |
| `VITE_META_PIXEL_ID` | build | Meta Pixel |
| `VITE_SENTRY_DSN` | build | Reporte de errores |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | build | Sourcemaps para Sentry |
| `VITE_OFERTA_PDF_URL` | build | Liga externa de pago (alternativa al checkout propio) |
| `CELYUM_METRICS_TOKEN` | servidor | Endpoint interno de Celyum; se puede retirar |
