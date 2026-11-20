# Accesos e inventario de servicios

Las llaves secretas **no van escritas en este documento**. Vercel guarda como «sensibles» las llaves de servidor y no permite leerlas de vuelta; por eso la forma segura de entregar es una de estas dos:

- **A. Transferir las cuentas** (Vercel, GitHub, Supabase): las llaves viajan dentro del proyecto y no hay que copiarlas a mano.
- **B. Mudarlo a cuentas nuevas** (recomendado para un equipo nuevo): se generan llaves nuevas en sus cuentas siguiendo `MIGRAR-A-SU-CLOUD.md`, y las viejas se revocan.

En los dos casos, al terminar la entrega conviene **rotar** (regenerar) las llaves de Stripe, Resend y Supabase service role.

## Inventario

| Servicio | Para qué | Cuenta / dueño hoy | Identificadores | Cómo se entrega |
|---|---|---|---|---|
| **Dominio** `tunahual.com` | Dirección del sitio | Registrador externo (no está en Vercel; Vercel lo marca «Third Party») | DNS apuntando a Vercel | El dueño del dominio cambia los registros DNS al nuevo Vercel, o se transfiere el dominio. |
| **Vercel** | Hosting del sitio y funciones `/api` | Equipo `emi-rivers-projects` (Celyum), plan Hobby | Proyecto `tu-nahual` · `prj_HEjN1LcqGKp5CJzgCUa5AKWYkhi5` · equipo `team_gPmGsZbnkfFhq1PzAsAUih6G` · región `iad1` · Node 24 · Fluid Compute activo | Opción A: Settings → General → Transfer Project al equipo de ustedes. Opción B: proyecto nuevo (ver guía). |
| **GitHub** | Código fuente | `EMIRIVERS/tunahual.com` | Rama `master` = producción | Settings → Transfer ownership a su organización, o clonar el `.bundle` en un repo propio. |
| **Supabase (sitio)** | Base de datos, login del panel, almacenamiento de PDFs | Organización «Azul Anaite» | Proyecto `kthmoffuateddameqafx` · URL `https://kthmoffuateddameqafx.supabase.co` | Invitar al nuevo responsable como Owner de la organización (Organization → Team), o crear proyecto nuevo y correr migraciones. |
| **Supabase (CRM Azul Anaité OS)** | Recibe copia de cada lead (`api/sync-lead.ts`) | Cuenta de la clienta | Proyecto `zuimegiggyumwbpimdhv` | Ya es de la clienta. Ver nota de pendientes: la conexión no está completa en Vercel. |
| **Stripe** | Cobro del Oráculo (apagado) | Cuenta «Azul Anaite Nueva» `acct_1TOlABIynb2qUwrR`, **modo LIVE** con clientes reales | Producto `prod_VNmf3Cy4abACzb` · precio `price_1UN16RIynb2qUwrRZqKzc99n` (11 USD) · webhook `we_1UN16SIynb2qUwrR0mGZCPMI` (`checkout.session.completed` → `https://www.tunahual.com/api/stripe-webhook`) | La cuenta es de la clienta. Para un equipo nuevo: crear una llave restringida nueva y un webhook nuevo apuntando a su dominio. |
| **Resend** | Correo de la lectura y entrega del PDF | Cuenta de `shakticacao@gmail.com` | Dominio `tunahual.com` **sin verificar** (responde 403) | La dueña de la cuenta invita al nuevo equipo o crea la llave. Falta verificar el dominio (DNS). |
| **Kajabi** | Etiquetar contactos (`tunahual`, `nahual-<slug>`) | Cuenta de Azul Anaité | Falta crear el webhook | Ver `ESTADO-Y-PENDIENTES.md`. |
| **Google Analytics / Meta Pixel** | Medición | No configurados | — | Poner `VITE_GA_ID` y `VITE_META_PIXEL_ID` y volver a publicar. |
| **Sentry** | Errores en producción | No configurado | — | Poner `VITE_SENTRY_DSN` y volver a publicar. |

## Valores públicos (se pueden compartir)

Estos valores ya están dentro del sitio publicado y cualquiera los puede ver; no son secretos.

```
VITE_SUPABASE_URL=https://kthmoffuateddameqafx.supabase.co
VITE_SUPABASE_PROJECT_ID=kthmoffuateddameqafx
VITE_SUPABASE_PUBLISHABLE_KEY=(llave «anon», está en plantilla.env de la carpeta de entrega)
```

## Llaves secretas que existen hoy en Vercel (Production)

| Variable | Qué es | Dónde se regenera |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso total a la base del sitio (solo servidor) | Supabase → Project Settings → API |
| `STRIPE_SECRET_KEY` | Llave restringida `rk_live_…` | Stripe → Developers → API keys → Restricted keys |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook `whsec_…` | Stripe → Developers → Webhooks → el endpoint → Signing secret |
| `STRIPE_PRICE_ID` | ID del precio (no es secreto) | `price_1UN16RIynb2qUwrRZqKzc99n` |
| `RESEND_API_KEY` | Envío de correo | Resend → API Keys |
| `ORACULO_TOKEN` | Contraseña para reprocesar un pedido a mano | Cualquier texto aleatorio largo (`openssl rand -hex 32`) |
| `CRON_SECRET` | Contraseña del cron diario de reintentos | Igual: texto aleatorio largo |
| `CELYUM_METRICS_TOKEN` | Endpoint interno de métricas para Celyum | Se puede borrar junto con `api/celyum-metrics.ts` si ya no se usa |
| `AZULANAITEOS_SERVICE_KEY` | Llave del CRM | Supabase del CRM → Project Settings → API. **La que está hoy es de un proyecto viejo**: hay que reemplazarla. |

## Acceso al panel de administración

El panel vive en https://www.tunahual.com/admin/login. Entra cualquier usuario de Supabase Auth que tenga el rol `admin` en la tabla `user_roles`. Cómo dar de alta a alguien está en `DASHBOARD.md`, sección «Dar acceso a una persona».
