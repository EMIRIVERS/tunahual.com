# Levantar Tu Nahual en sus propias cuentas

Tiempo estimado: 1 a 2 horas, sin contar la propagación de DNS.
Requisitos: cuentas en GitHub, Vercel y Supabase; Node 20 o más y bun (`npm i -g bun`); CLI de Supabase (`npm i -g supabase`) y de Vercel (`npm i -g vercel`).

Si en lugar de mudarlo prefieren **recibir las cuentas actuales** (transferir el proyecto de Vercel, el repo y la organización de Supabase), basta con los pasos de transferencia de `ACCESOS.md` y el paso 7 de esta guía.

## 1. Código

```bash
git clone tunahual-2026-11-20.bundle tunahual
cd tunahual
git remote remove origin 2>/dev/null
git remote add origin git@github.com:SU-ORG/tunahual.git
git push -u origin master
bun install
bun run test && bun run build    # debe dar 190 pruebas en verde y compilar
```

## 2. Base de datos (Supabase)

1. Crear un proyecto nuevo en Supabase (región cercana a sus usuarios). Anotar el **ref**, la **URL**, la llave **anon** y la **service_role** (Project Settings → API) y la contraseña de la base.
2. Aplicar el esquema y los datos base:

```bash
supabase login
supabase link --project-ref <SU_REF>
supabase db push                 # aplica supabase/migrations/ en orden
```

3. En el SQL Editor del proyecto, pegar y correr `supabase/seed.sql` (los 20 nahuales y los 13 tonos). Como alternativa, `02-base-de-datos/datos-publicos/` trae la copia JSON de esas tablas tal como están hoy en producción.
4. Crear a mano el bucket de Storage `oraculos` (las migraciones no lo crean): privado, límite 10 MB, tipo permitido `application/pdf`, sin políticas. Solo hace falta si van a abrir el cobro del Oráculo.
5. Authentication → URL Configuration: poner `https://SU-DOMINIO` como Site URL y agregar `https://SU-DOMINIO/admin/reset-password` a Redirect URLs.
6. Dar de alta al primer administrador (ver `DASHBOARD.md`, «Dar acceso a una persona»).
7. Si quieren llevarse los leads del proyecto actual: desde el panel `/admin` del sitio actual, pestaña Leads → Exportar CSV, y en el nuevo Supabase: Table Editor → `leads` → Import data from CSV.

Las funciones de `supabase/functions/` (`generate-nahual-image`, `og-image`, `send-to-make`) son heredadas de la versión inicial. Solo `generate-nahual-image` la llama el sitio y tiene respaldo si falla; se pueden desplegar con `supabase functions deploy <nombre>` si se quieren.

## 3. Hosting (Vercel)

```bash
vercel login
vercel link                      # crear proyecto nuevo, framework Vite
```

Cargar las variables (Settings → Environment Variables, entorno Production, y las `VITE_*` también en Preview):

```bash
printf '%s' 'https://<SU_REF>.supabase.co' | vercel env add VITE_SUPABASE_URL production
printf '%s' '<SU_REF>'                     | vercel env add VITE_SUPABASE_PROJECT_ID production
printf '%s' '<LLAVE_ANON>'                 | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
printf '%s' '<SERVICE_ROLE>'               | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Luego las que usen (lista completa en `VARIABLES-DE-ENTORNO.md`). Publicar:

```bash
vercel deploy --prod
```

Recomendado: conectar el repo de GitHub al proyecto (Settings → Git) para que cada push a `master` publique solo. Hoy el proyecto actual **no** tiene GitHub conectado; se publica con la CLI.

`vercel.json` ya trae lo necesario y no se debe quitar: el reescrito de rutas a `index.html` (sin él toda ruta distinta de `/` da 404), la configuración de la función del Oráculo (300 s, archivos incluidos) y el cron diario.

Nota de plan: la función del Oráculo usa hasta 300 s de duración. En plan Hobby eso requiere Fluid Compute activo (Settings → Functions). En Pro funciona sin ajustes.

## 4. Dominio

En el registrador de `tunahual.com` cambiar los registros a los que indique el nuevo proyecto de Vercel (Settings → Domains → Add `tunahual.com` y `www.tunahual.com`). Retirar el dominio del proyecto viejo para que Vercel lo acepte en el nuevo.

## 5. Correo (Resend)

1. Resend → Domains → Add `tunahual.com`, copiar los registros SPF y DKIM al DNS y esperar «Verified».
2. Crear una API key con permiso de envío y cargarla como `RESEND_API_KEY`; poner `EMAIL_FROM`.

## 6. Cobro (solo cuando decidan abrir ventas)

1. Stripe → crear producto y precio (o reutilizar `price_1UN16RIynb2qUwrRZqKzc99n` en la cuenta de la clienta).
2. Crear una llave **restringida** con permisos de Checkout Sessions (escritura) y lectura de precios; cargarla como `STRIPE_SECRET_KEY`.
3. Webhook nuevo hacia `https://SU-DOMINIO/api/stripe-webhook`, evento `checkout.session.completed`; cargar su `whsec_…` como `STRIPE_WEBHOOK_SECRET`.
4. Generar `ORACULO_TOKEN` y `CRON_SECRET` (`openssl rand -hex 32`).
5. Seguir `docs/activar-ventas.md` paso por paso (aprobación del contenido, compra de prueba con reembolso, orden de interruptores). Revisión: `bun run preflight:cobro`.

## 7. Cerrar la entrega

- Revocar las llaves viejas: Stripe (llave restringida y webhook viejo), Resend, service role del Supabase viejo.
- Quitar a Celyum de los equipos de Vercel, GitHub y Supabase si se transfirieron las cuentas.
- Borrar `CELYUM_METRICS_TOKEN` y, si no se usa, `api/celyum-metrics.ts`.

## Comandos de uso diario

| Comando | Qué hace |
|---|---|
| `bun run dev` | Sitio local en http://localhost:8080 |
| `bun run test` | Pruebas unitarias (Vitest) |
| `bun run test:e2e` | Pruebas en navegador (Playwright) |
| `bun run build` | Compila a `dist/` |
| `bun run mapas -- --all` | Genera los 260 PDFs del Mapa de Energía |
| `bun run oraculo:muestra -- --nombre "Persona Ficticia" --fecha 1990-05-14 --genero neutro --out ../muestras` | PDF de muestra del Oráculo |
| `bun run preflight:cobro` | Revisión del cobro (solo lee) |
| `vercel` / `vercel --prod` | Publicar en preview / producción |
