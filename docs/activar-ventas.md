# Activar las ventas del Oráculo / Mapa de Energía

Estado al 5-oct-2026: **todo lo técnico está desplegado y probado; las ventas siguen cerradas a propósito.** Lo único pendiente son decisiones de Azul y de Emi. Este documento es el orden exacto para abrir.

Comandos desde la raíz del repo, con la CLI de Vercel ya autenticada (`--scope emi-rivers-projects`).

## Revisar en cualquier momento

```bash
bun run preflight:cobro            # tabla PASS / FAIL / PENDIENTE; solo lee, no cobra
bun run preflight:cobro -- --correo   # además envía UN correo de prueba a emiriversccc@gmail.com
```

No abrir ventas mientras haya algún FAIL. Los PENDIENTE son los pasos de abajo.

## Qué hace cada interruptor

| Variable | Dónde | Qué hace |
|---|---|---|
| `CHECKOUT_HABILITADO=1` | servidor, Production | Sin ella `create-checkout` responde 503 aunque haya llaves. Es el cierre real del cobro. |
| `VITE_CHECKOUT_MAPA=1` | se hornea en el build | Muestra el botón «Obtener mi Mapa». Exige redeploy. |
| `ORACULO_PDF_HABILITADO=1` | servidor, Production | El webhook avisa a `/api/generar-oraculo` y la función trabaja. Sin ella el pedido cae al Mapa viejo (necesita `MAPA_PDF_BASE_URL` y 260 PDFs). |

Combinaciones (el preflight las imprime):

| CHECKOUT / VITE / ORACULO | Qué pasa |
|---|---|
| 0 / 0 / 0 | **Hoy.** Cerrado, nadie compra. |
| 0 / 1 / * | Malo: botón visible y `create-checkout` responde 503. Nunca encender el botón antes que el cobro. |
| 1 / 0 / * | API abierta sin botón: solo sirve para la compra de prueba (con curl). |
| 1 / 1 / 0 | **Peligro:** se cobra y el Oráculo no se genera. |
| 1 / 1 / 1 | Abierto: compra, webhook, generación, PDF en Storage, correo. |

Con `ORACULO_PDF_HABILITADO=1` y contenido sin aprobar la función **se niega a entregar** (el pedido queda `fallido`): quien pagó no recibe nada. Por eso el paso 1 va primero.

`ORACULO_PERMITIR_BORRADOR` y `ORACULO_SIN_CORREO` son solo para pruebas en Preview; la función los ignora si `VERCEL_ENV=production`, y el preflight da FAIL si existen en Production. No definirlas nunca ahí.

## Pasos, en orden

### 1. Azul aprueba el contenido — decide: Azul
Cada archivo de `content/oraculo/**/*.md` (hoy 44 en `revision: pendiente-azul`) debe pasar a `revision: aprobada` después de que Azul lo lea. Nadie más cambia ese campo.

```bash
grep -rh "^revision:" content/oraculo | sort | uniq -c     # debe quedar solo «aprobada»
git add content/oraculo && git commit -m "Oráculo: contenido aprobado por Azul"
```

También decidir con ella: si el Oráculo reemplaza al Mapa de 8 páginas, y la zona horaria de la «fecha de compra» (hoy Ciudad de México).

### 2. Emi decide el precio — decide: Emi (con Azul)
Hoy el precio vigente en Stripe es 11 USD (`price_1UN16RIynb2qUwrRZqKzc99n`, único). Si cambia, se crea un precio nuevo (un precio de Stripe no se edita) y se actualiza la variable:

```bash
printf '%s' "price_NUEVO" | vercel env add STRIPE_PRICE_ID production --force --scope emi-rivers-projects
```
El texto del botón («Obtener mi Mapa · 11 USD») está en `src/components/ComprarMapa.tsx`: actualizarlo y commitear si el precio cambia.

### 3. Emi verifica el dominio en Resend — decide: Emi
Hoy Resend responde `403: The tunahual.com domain is not verified`. La cuenta de Resend es de `shakticacao@gmail.com`: pedirle el acceso o que haga los pasos. En resend.com/domains dar de alta `tunahual.com`, copiar los registros DNS (SPF, DKIM) al DNS del dominio y esperar «Verified». Después:

```bash
bun run preflight:cobro -- --correo    # debe dar PASS «enviado a emiriversccc@gmail.com»
```
Opcional, para fijar el remitente: `printf '%s' 'Tu Nahual <tu-nahual@tunahual.com>' | vercel env add EMAIL_FROM production --scope emi-rivers-projects`.

### 4. Emi crea el webhook de Kajabi — decide: Emi
Crear en Kajabi (o Make/Zapier) el formulario/webhook que recibe el contacto con etiquetas y cargar la URL:

```bash
printf '%s' 'https://…' | vercel env add KAJABI_WEBHOOK_URL production --scope emi-rivers-projects
```
Sin ella la compra se entrega igual, pero la compradora no queda etiquetada en Kajabi.

### 5. Verificar que todo está en verde con el cobro aún cerrado
```bash
bun run preflight:cobro -- --correo
```
Esperado: 0 FAIL; Contenido `PASS` (todos aprobados); Resend `PASS`; KAJABI `PASS`; `create-checkout` en 503.

### 6. Abrir — decide: Emi
Orden obligatorio: primero la generación, luego el cobro, al final el botón.

```bash
printf '1' | vercel env add ORACULO_PDF_HABILITADO production --scope emi-rivers-projects
printf '1' | vercel env add CHECKOUT_HABILITADO production --scope emi-rivers-projects
printf '1' | vercel env add VITE_CHECKOUT_MAPA production --scope emi-rivers-projects
vercel deploy --prod --scope emi-rivers-projects --yes     # VITE_* se hornea en el build: sin redeploy no cambia nada
bun run preflight:cobro                                    # sin FAIL
```
(Si la compra de prueba se hace antes de mostrar el botón, definir `VITE_CHECKOUT_MAPA` después de la prueba y redesplegar de nuevo.)

### 7. Compra de prueba con reembolso — Emi
Es dinero real (la cuenta de Stripe es LIVE). Comprar con una tarjeta propia, de preferencia del precio mínimo posible, y reembolsar de inmediato.

1. Abrir tunahual.com, calcular un kin, y pulsar el botón (o llamar a `create-checkout` con curl desde el origen permitido).
2. Comprobar: fila en `pedidos` con `generacion_estado = listo`, PDF en el bucket `oraculos`, correo recibido con el PDF y el enlace de 7 días, etiqueta en Kajabi.
3. Reenviar el evento desde Stripe (Developers, Webhooks, el evento, «Resend»): no debe duplicar el correo (`duplicate: true`).
4. Reembolsar (ver abajo) y borrar la fila y el PDF de prueba.

Consultas de apoyo (solo lectura, PAT `supabase-tunahual-pat`):

```bash
PAT=$(security find-generic-password -s supabase-tunahual-pat -w)
curl -s -X POST -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  https://api.supabase.com/v1/projects/kthmoffuateddameqafx/database/query \
  -d '{"query":"select stripe_session_id,email,generacion_estado,generacion_detalle,entrega_estado,created_at from pedidos order by created_at desc limit 10"}'
```

## Reembolsar

Dashboard de Stripe: Pagos, el pago, «Reembolsar». Hacerlo desde el Dashboard (no se verificó que la `rk_live` tenga permiso de escritura en Refunds). El reembolso no borra el pedido ni el PDF: si la persona debe dejar de tener acceso, borrar `<session_id>.pdf` del bucket (el enlace firmado deja de abrir).

## Cerrar rápido si algo sale mal

⚠️ Las variables de Vercel se **congelan en cada deployment**: quitar una variable no cierra nada hasta el siguiente deploy. Por eso hay dos vías:

1. **Instantánea:** volver al deployment anterior a la apertura (el que tenía el cobro cerrado).
   ```bash
   vercel ls --prod --scope emi-rivers-projects     # localizar el deployment previo a la apertura
   vercel rollback <url-del-deployment-previo> --scope emi-rivers-projects
   ```
2. **Limpia (1 a 2 min):** quitar el interruptor y redesplegar.
   ```bash
   vercel env rm CHECKOUT_HABILITADO production --yes --scope emi-rivers-projects
   vercel env rm VITE_CHECKOUT_MAPA production --yes --scope emi-rivers-projects
   vercel deploy --prod --scope emi-rivers-projects --yes
   bun run preflight:cobro      # create-checkout debe volver a 503
   ```

Si el problema es la entrega y no el cobro: quitar `ORACULO_PDF_HABILITADO` y redesplegar detiene la generación; los pedidos quedan `pendiente` o `fallido` y se reprocesan después con:

```bash
TK=$(security find-generic-password -s oraculo-tunahual-token -w)
curl -s -X POST https://www.tunahual.com/api/generar-oraculo -H "Authorization: Bearer $TK" -H 'Content-Type: application/json' -d '{"session_id":"cs_live_…"}'
```
El cron diario (14:00 UTC) también reintenta los pendientes. Un pedido con 3 intentos fallidos queda para revisión manual. (Con la generación apagada el endpoint responde 503 aunque el token valga: reactivar antes de reprocesar.)

## Lo medido (Vercel, plan Hobby con Fluid Compute activado en el proyecto)

Prueba del 5-oct-2026 en un deployment de Preview con pedidos sintéticos (borrados después), contenido en borrador permitido solo ahí:

- Generación en frío: ~6,3 s por la función completa (Chromium descomprimido incluido; render 5 a 7 s); en caliente ~3,5 s. PDF de 24 páginas A4, 2,7 MB.
- Memoria: pico de RSS sumando Node y Chromium ~420 a 440 MB (muestreo cada 150 ms, vía `/proc`). Muy por debajo de los 2 GB de Hobby. El pico local en Mac (1,2 GB) no aplica: `@sparticuz/chromium` corre en modo `headless shell`.
- `maxDuration: 300` aceptado (Hobby + Fluid). El plan del equipo `emi-rivers-projects` es `hobby` (legacy); el cron corre una vez al día.
- La función sigue y termina aunque quien la llamó corte a los 2,5 s (como hace el webhook).
- El panel de Observabilidad de Vercel (memoria máxima oficial) requiere Pro; la cifra de memoria es la medida por el propio código.

## Seguridad: qué quedó comprobado

- `api/generar-oraculo` sin token responde 401 (antes que el interruptor), con `X-Robots-Tag: noindex, nofollow`.
- `content/` y `assets/` viajan solo dentro de la función (`includeFiles`); no están en `public/` ni en `dist/`.
- El bucket `oraculos` es privado, límite 10 MB, solo `application/pdf`, sin políticas: únicamente la service role escribe y firma.
- Llaves: `oraculo-tunahual-token` y `oraculo-tunahual-cron` en Keychain, y cargadas en Vercel Production por stdin.
