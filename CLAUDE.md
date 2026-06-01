# Tu Nahual — tunahual.com

Calculadora del calendario maya Cholq'ij. El usuario ingresa su fecha de
nacimiento y descubre su Nahual, Tono y Cruz Maya. Es la captación de leads
de **Azul Anaité** (negocio de espiritualidad maya).

## Stack
- **Vite + React 18 + TypeScript**, SPA con React Router. UI: shadcn/ui + Tailwind.
- **Supabase** para datos (nahuales, tonos, leads, configuracion).
- **Vercel** para hosting + funciones serverless en `/api`.
- Gestor de paquetes: **bun**.

## Comandos
- `bun install` · `bun run dev` · `bun run build` · `bun run preview`
- `bun run test:e2e` — smoke tests E2E (Playwright). **Correr antes de cambios grandes.**
- Deploy: `vercel --prod --yes` (previo: `vercel link` al proyecto `tu-nahual`).
  Para riesgo alto, hacer **preview** primero (`vercel` sin `--prod`) y que la
  clienta lo revise antes de promover.

## ⚠️ Baches que ya costaron caro (no repetir)
1. **Variables `VITE_*` se incrustan en BUILD.** Deben estar en Vercel ANTES de
   compilar y hay que **redeploy**. Si faltan las de Supabase, la app no carga.
2. **SPA fallback obligatorio:** `vercel.json` reescribe todo (menos `/api`) a
   `/index.html`. Sin él, toda ruta que no sea `/` da 404. NO borrarlo.
3. **`<title>` de react-helmet-async debe ser UN solo string** (template literal).
   `<title>{numero} {texto}</title>` con un número suelto crashea la página.
4. **`@vercel/og` NO funciona** como Edge Function en este proyecto Vite ("unsupported modules"). El OG dinámico está pendiente con otra técnica.

## Dos proyectos Supabase distintos
- **Frontend** (ref `baqytauorsncevhqsrkp`, "Tu Nahual"): nahuales, tonos, leads.
- **CRM "Azul Anaité OS"** (ref `ydkbwhwcwoxyuytlntoh`): solo lo usa
  `api/sync-lead.ts` con service key. Requiere teléfono.

## Integraciones activadas por variable de entorno (hoy inactivas)
Implementadas; se encienden poniendo su clave en Vercel + redeploy. Sin clave = no-op.
- Analítica GA4/Meta Pixel: `VITE_GA_ID`, `VITE_META_PIXEL_ID` (`src/lib/analytics.ts`).
- Sentry: `VITE_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN/ORG/PROJECT` en build para sourcemaps).
- Email de la lectura (Resend): `RESEND_API_KEY`, `EMAIL_FROM` (`api/send-reading.ts`).
- Ver `.env.example` para la lista completa.

## Flujo actual de la calculadora
Fecha → calcular → **se muestra la lectura primero** (sin muro) → invitación a
"Recibir mi lectura por email" (nombre + email; teléfono opcional). El lead se
guarda en Supabase, se sincroniza al CRM **solo si hay teléfono**, y se envía el
email si Resend está configurado.

## Estilo / esencia (NO romper)
- Paleta bronce-oro (`#a3732b`) + crema + esencia maya. Titulares en serif
  (Cormorant Garamond, `font-serif`).
- **No es un lead-magnet "de venta":** nada de "GRATIS" en mayúsculas, contadores
  inflados, urgencia, precios ancla ni pulsos psicológicos. Tono editorial/sobrio.

## Convenciones
- Responder e interfaz en **español** (con acentos correctos).
- Hay un `ErrorBoundary` global: ningún throw debe dejar pantalla blanca.
- Verificar cambios con el navegador real (Playwright) además de compilar.
