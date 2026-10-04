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
- **Frontend** (ref `yzijamjsnaardrnqdycl`, "TuNahual"): nahuales, tonos, leads.
  El proyecto viejo `baqytauorsncevhqsrkp` ("Tu Nahual") está **pausado** y ya
  no se usa — no confundirlo con el real.
- **CRM "Azul Anaité OS"** (ref `zuimegiggyumwbpimdhv` desde el commit
  `d91ec3f` de AZULANAITEOS que reconstruyó el esquema en un proyecto Supabase
  nuevo; el ref anterior quedó muerto — de ahí ORD-2026-08-26-047): solo lo
  usa `api/sync-lead.ts` con service key. Requiere teléfono. El ref **no va
  hardcodeado** — sale de `AZULANAITEOS_URL` (ver `.env.example`); verifícalo
  siempre contra `AZULANAITEOS/supabase/config.toml` antes de asumirlo, ya
  cambió una vez sin que nadie lo notara.

## Integraciones activadas por variable de entorno (hoy inactivas)
Implementadas; se encienden poniendo su clave en Vercel + redeploy. Sin clave = no-op.
- Analítica GA4/Meta Pixel: `VITE_GA_ID`, `VITE_META_PIXEL_ID` (`src/lib/analytics.ts`).
- Sentry: `VITE_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN/ORG/PROJECT` en build para sourcemaps).
- Email de la lectura (Resend): `RESEND_API_KEY`, `EMAIL_FROM` (`api/send-reading.ts`).
- Ver `.env.example` para la lista completa.

## Flujo actual de la calculadora (desde 2026-10-04, lectura por capas)
Fecha → calcular → **nahual, tono, glifo, maíz, elemento y trecena siguen libres**
(es lo que la gente comparte; no se cobra ni se pide nada). La **Cruz Maya y "El
cielo de tu nacimiento"** (luna, Cuenta Larga, Haab', cargador) aparecen borrosas
(`CapaBloqueada.tsx`) con la invitación "Tus nueve energías te esperan…" hasta que
la persona deja nombre, email y **WhatsApp** (los tres obligatorios, más casilla de
términos/privacidad). Al enviar, la capa se abre al instante, el lead se guarda en
Supabase, se sincroniza al CRM (`api/sync-lead.ts`), se manda a Kajabi con etiquetas
`tunahual` y `nahual-<slug>` (`api/kajabi.ts`, requiere `KAJABI_WEBHOOK_URL`) y se
envía el email si Resend está configurado. El navegador recuerda que ya dejó sus
datos (`localStorage: tunahual_cruz_abierta`).

El cierre del resultado ofrece el "Mapa de Energía" si existe `VITE_OFERTA_PDF_URL`;
sin ella invita a azulanaite.com. Eventos: `calcular_nahual`, `lead_enviado`,
`oferta_pdf_click`, `tarjeta_historia`. GA4/Meta Pixel siguen apagados hasta poner
`VITE_GA_ID` y `VITE_META_PIXEL_ID` en Vercel + redeploy.

Otros: video de fondo (`public/videos/fondo-tu-nahual.mp4`), widget "Energía de hoy"
(con la luna del día), tarjeta 9:16 para historias (`src/utils/tarjetaHistoria.ts`),
app instalable (`public/manifest.webmanifest`, `public/sw.js` solo pantalla offline).

## Fuente única de maíces / elementos / direcciones
`src/data/maices.ts`. Rojo=Agua, Blanco=Aire, Negro=Tierra, Amarillo=Fuego. Se aplica
encima de lo que traiga la tabla `nahuales` (hook `useMayanData`, `useNahualBySlug`,
`KinPage`, `ResultadoPage`, tablas del admin). La migración
`20261004000000_canon_maices_elementos.sql` alinea la BD (**pendiente de aplicar**).
Dirección Oeste (negro) confirmada; Este/Norte/Sur marcadas `confirmada: false`.

## Calendario: cálculos
- `src/utils/cuentaLarga.ts`: Cuenta Larga y Haab', correlación GMT 584283.
- `src/utils/luna.ts`: ocho fases con `astronomy-engine` (corre en el navegador).
- `src/utils/cargador.ts`: ancla 18 feb 2026 = 1 Kej, año maya 5141, años de 365
  días. `CARGADOR_HABILITADO=false`: **no activar hasta tener los textos de los
  cuatro cargadores de Azul Anaité** (`cargadorEsencia` es borrador).
- Todos con tests contra las fechas ancla (3 oct 2026, 14 sep 2026, 15 mar 1990).

## Mapa de Energía (PDF de 11 USD)
`bun run mapas -- --kin 7-aqabal` · `--all` (los 260, ~33 s) ·
`--nombre "Ana" --fecha 1990-03-15` (personalizado, con luna y cargador).
Script en `scripts/mapa-energia/generar.ts`. Las páginas 2, 7 y 8 llevan el pie
BORRADOR hasta que Azul Anaité dicte esos textos.

## Estilo / esencia (NO romper)
- Paleta bronce-oro (`#a3732b`) + crema + esencia maya. Titulares en serif
  (Cormorant Garamond, `font-serif`).
- **No es un lead-magnet "de venta":** nada de "GRATIS" en mayúsculas, contadores
  inflados, urgencia, precios ancla ni pulsos psicológicos. Tono editorial/sobrio.

## Convenciones
- Responder e interfaz en **español** (con acentos correctos).
- Hay un `ErrorBoundary` global: ningún throw debe dejar pantalla blanca.
- Verificar cambios con el navegador real (Playwright) además de compilar.
