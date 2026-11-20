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
- **Frontend** (ref `kthmoffuateddameqafx`, org «Azul Anaite»; desde el 4-oct-2026):
  nahuales, tonos, leads. Se reconstruyó desde cero con `supabase/migrations/` +
  `supabase/seed.sql`; los leads del proyecto anterior `yzijamjsnaardrnqdycl`
  (inaccesible) se perdieron. Guardianes, conceptos y conocimiento expandido
  (solo los usa `/admin`) quedaron vacíos. PAT en Keychain: `supabase-tunahual-pat`.
  Los proyectos viejos `yzijamjsnaardrnqdycl` y `baqytauorsncevhqsrkp` ya no se usan.
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

## Cobro del Mapa de Energía (Stripe) — construido, INACTIVO
Checkout Session de 11 USD (pago único) para «Tu Mapa de Energía». Todo va por
variables de entorno; sin llaves no cobra ni revienta.
- `api/create-checkout.ts`: valida kin/nahual/tono/fecha y crea la sesión
  (`STRIPE_PRICE_ID` o `price_data` de 1100 USD). Sin `STRIPE_SECRET_KEY` → 503.
- `api/stripe-webhook.ts`: verifica firma sobre el cuerpo CRUDO
  (`STRIPE_WEBHOOK_SECRET`), atiende `checkout.session.completed` con
  `payment_status=paid` del producto `mapa-energia`, guarda el pedido en
  `public.pedidos` (único por `stripe_session_id` → idempotente) y entrega:
  correo Resend con el PDF `MAPA_PDF_BASE_URL/mapa-<tono>-<nahual>.pdf` adjunto
  + etiqueta `mapa-energia` en Kajabi. «Entregado» = correo enviado; si falta
  cualquier variable el pedido queda `pendiente` con el motivo en `entrega_detalle`.
- Migración `20261005000000_pedidos.sql` (RLS sin políticas, solo service role).
  **Aplicada** el 4-oct-2026 en `kthmoffuateddameqafx` y registrada en `schema_migrations`.
- Frontend: botón en el cierre de la lectura (`ComprarMapa.tsx`), solo con
  `VITE_CHECKOUT_MAPA=1`; página `/gracias`.
- Los 260 PDFs se generan con `bun run mapas` y hay que subirlos a la carpeta de
  `MAPA_PDF_BASE_URL`. **No cobrar de verdad** mientras el generador deje páginas
  con BORRADOR (2, 7 y 8) y el cargador (1 Kej vs 2 Kej) esté sin decidir.

### Oráculo Maya (PDF a pedido) — desplegado, APAGADO
El producto de pago pasa de ser el Mapa de 8 páginas a un **Oráculo Maya** de ~24 páginas generado a pedido desde `content/oraculo/` (textos de Azul Anaité, en borrador: `revision: pendiente-azul`). Detalle y límites de Vercel en `docs/oraculo-asincrono.md`.
- Formulario de compra: nombre y género (Mujer / Hombre / Prefiero no decirlo = neutro). El género es obligatorio en `create-checkout`, va a la metadata de Stripe y a `pedidos.genero`; el contenido de útero y cérvix es solo para `mujer`. Nunca se deduce del nombre.
- Fecha de referencia = día de la **compra** (`pedidos.fecha_compra`, zona `ORACULO_TZ`, por defecto Ciudad de México). Sin lenguaje de «sesión».
- Motor y maqueta en `src/lib/oraculo/` (marcadores `{{nombre}}`, `{{a|b|c}}`, `<!--solo:mujer-->`). El cálculo usa `mayanCalculations.ts`, NUNCA el `calculateMayanCross` de `mayanCalendar.ts`.
- `bun run oraculo:muestra -- --nombre "Persona Ficticia" --fecha 1990-05-14 --genero mujer|hombre|neutro --out <carpeta fuera del repo>` renderiza un PDF con Chromium local; `bun run oraculo:lote` hace los 260 kines. Persona ficticia siempre: nada de datos reales en plantilla ni fixtures.
- Generación asíncrona: `api/generar-oraculo.ts` (reexporta `api/_oraculo/generar.ts`) está **desplegada en producción y apagada** (sin `ORACULO_PDF_HABILITADO=1` responde 503; sin token, 401). Probada de punta a punta en un Preview (24 páginas, ~6 s en frío, ~430 MB de pico). Migración `20261006000000_pedidos_oraculo.sql` **aplicada** y bucket privado `oraculos` creado (10 MB, solo PDF). `vercel.json` lleva `includeFiles` de `content/oraculo/**` y `assets/oraculo/**`, `maxDuration: 300` (Hobby con Fluid) y un cron diario de reintentos.
- Mientras `content/oraculo` tenga `revision: pendiente-azul` la función **se niega a entregar**. `ORACULO_PERMITIR_BORRADOR=1` y `ORACULO_SIN_CORREO=1` existen solo para pruebas en Preview: se ignoran si `VERCEL_ENV=production` y **nunca** deben existir en Production.

**Seguridad del cobro:** `api/create-checkout` solo crea sesiones con `CHECKOUT_HABILITADO=1` en el servidor (por defecto cerrado). El filtro de origen (`api/_lib/origen.ts`, host exacto) frena navegadores ajenos pero NO a quien falsifique el encabezado con curl; el cierre real es el interruptor. Las sesiones sin pagar caducan a los 30 min. Un curl de prueba contra producción con llave puesta crea una sesión live: no lo hagas sin el interruptor apagado.

### Activación: ver `docs/activar-ventas.md`
Ese documento trae los pasos exactos y ordenados, quién decide cada uno, la compra de prueba con reembolso y cómo cerrar rápido. Revisión en cualquier momento: `bun run preflight:cobro` (tabla PASS/FAIL/PENDIENTE; solo lee; `-- --correo` envía una prueba a emiriversccc@gmail.com).

Estado al 5-oct-2026, **listo para abrir ventas, pendiente de la aprobación de Azul**:
- **Ya en Vercel Production:** `STRIPE_SECRET_KEY` (rk_live), `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ORACULO_TOKEN`, `CRON_SECRET` y las `VITE_SUPABASE_*`. Keychain: `oraculo-tunahual-token`, `oraculo-tunahual-cron`, `stripe-tunahual-rk-live`.
- **Faltan, y dependen de personas:** aprobación de Azul de los 44 archivos de `content/oraculo`; dominio `tunahual.com` verificado en Resend (hoy 403); `KAJABI_WEBHOOK_URL`; confirmar precio (11 USD).
- **Interruptores sin definir a propósito:** `CHECKOUT_HABILITADO`, `VITE_CHECKOUT_MAPA`, `ORACULO_PDF_HABILITADO`. Se encienden en ese orden: generación, cobro, botón. Encender el botón o el cobro sin la generación activa cobra sin entregar.
- `MAPA_PDF_BASE_URL` no hace falta con la generación activa (solo la usa el Mapa viejo de 8 páginas).
- Si en tu `vercel build` o en el de Vercel aparece un aviso de tipos en `api/`, corre `npx tsc --noEmit --skipLibCheck --target es2022 --module nodenext --moduleResolution nodenext --strict false api/*.ts api/_oraculo/*.ts api/_lib/*.ts` (Vercel compila `api/` con resolución nodenext: los imports relativos llevan extensión `.js`): el proyecto compila sin `strict`, así que las uniones discriminadas por booleano (`{ok:true}|{ok:false}`) no se estrechan; usa `"campo" in x`. Hoy sale limpio.

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
`20261004000000_canon_maices_elementos.sql` alinea la BD (**aplicada** el 4-oct-2026).
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
