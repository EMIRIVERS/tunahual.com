# Tu Nahual (tunahual.com): entrega del proyecto

Fecha de entrega: 20 de noviembre de 2026
Entregado por: Celyum
Estado: el sitio se entrega tal como está hoy en producción en https://www.tunahual.com

Esta carpeta trae lo necesario para que otra persona o equipo, con sus propias cuentas, opere el sitio y lo siga desarrollando.

## Qué hay en la carpeta

| Carpeta / archivo | Para qué sirve |
|---|---|
| `LEEME.md` | Este documento. Empezar aquí. |
| `01-codigo/` | Código fuente completo: un `.zip` para abrir directo y un `.bundle` de git con todo el historial. |
| `02-base-de-datos/` | Esquema (migraciones SQL), datos semilla y una copia de los catálogos públicos (nahuales y tonos). |
| `ACCESOS.md` | Inventario de cada cuenta y servicio: quién es dueño, identificadores y cómo transferirlo. |
| `VARIABLES-DE-ENTORNO.md` | Todas las variables del sitio, qué hace cada una y dónde se consigue su valor. |
| `plantilla.env` | Archivo de variables listo para llenar con los valores de su cuenta. |
| `DASHBOARD.md` | Manual del panel de administración (`/admin`): leads, estadísticas y contenido. |
| `MIGRAR-A-SU-CLOUD.md` | Pasos exactos para levantar el sitio en su propio Supabase, Vercel y GitHub. |
| `ESTADO-Y-PENDIENTES.md` | Qué funciona hoy, qué está construido pero apagado y qué decisiones siguen abiertas. |

## En una frase

Tu Nahual es una calculadora del calendario maya Cholq'ij. La persona escribe su fecha de nacimiento y recibe su Nahual, su Tono y su Cruz Maya. Funciona como captación de contactos para Azul Anaité: la parte profunda de la lectura se abre cuando la persona deja su nombre, correo y WhatsApp.

## Cómo está construido

- **Sitio:** Vite + React 18 + TypeScript, con Tailwind y shadcn/ui. Es una SPA con React Router.
- **Datos y usuarios:** Supabase (Postgres, autenticación, almacenamiento).
- **Hosting y funciones de servidor:** Vercel. El sitio estático y las funciones de `/api` salen del mismo proyecto.
- **Cobro (construido, apagado):** Stripe Checkout para el Oráculo Maya en PDF.
- **Correo (construido, sin dominio verificado):** Resend.
- **Gestor de paquetes:** bun (también funciona con npm).

## Primeros 15 minutos para quien recibe

1. Abrir `01-codigo/tunahual-codigo-2026-11-20.zip` o clonar el bundle:
   `git clone tunahual-2026-11-20.bundle tunahual`
2. Leer `CLAUDE.md` en la raíz del código. Es la guía técnica viva: comandos, trampas conocidas y convenciones.
3. Copiar `plantilla.env` como `.env.local` en la raíz y llenar las tres variables `VITE_SUPABASE_*`.
4. `bun install` y luego `bun run dev`. El sitio abre en http://localhost:8080
5. Pruebas: `bun run test` (190 pruebas) y `bun run build`.

Para mudarlo a sus cuentas, seguir `MIGRAR-A-SU-CLOUD.md`.

## Verificación hecha el día de la entrega

- El código de esta entrega es el mismo que sirve producción (deployment `dpl_C1KmyZ2UsHPQWttqQ4JaKMC3USVM`, commit `729e4bd`, publicado el 5 de octubre de 2026). Se recuperó directo de ese deployment.
- `bun run test`: 20 archivos, 190 pruebas, todas pasan.
- `bun run build`: compila sin errores.
- https://www.tunahual.com responde 200; `tunahual.com` redirige a `www`.
