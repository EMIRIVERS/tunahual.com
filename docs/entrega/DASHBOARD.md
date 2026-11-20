# Panel de administración (`/admin`)

Dirección: https://www.tunahual.com/admin/login

Es el lugar para gestionar el sitio sin tocar código: ver y exportar los contactos que llegan, revisar estadísticas y editar los textos de la lectura.

## Entrar

1. Abrir `/admin/login` y escribir correo y contraseña.
2. Si la persona olvidó su contraseña, «¿Olvidaste tu contraseña?» manda un correo para restablecerla (`/admin/reset-password`).
3. Solo entra quien tiene el rol `admin`. Cualquier otra cuenta ve el aviso de acceso denegado.

## Qué se puede hacer (pestañas)

| Pestaña | Para qué |
|---|---|
| **Leads** | Lista de cada persona que dejó sus datos: nombre, correo, teléfono (WhatsApp), fecha de nacimiento, nahual, tono, punto cardinal, color de maíz y elemento. Buscar, filtrar y **exportar a CSV** (todo, lo filtrado, o desde el número N en adelante). |
| **Estadísticas** | Total de leads, leads del mes, nahual y tono más comunes, y gráficas de distribución por nahual, por tono y por punto cardinal. |
| **Nahuales** | Editar los textos de los 20 nahuales (significado, descripción, elemento, animal guía, etc.). Los cambios se ven en el sitio al recargar. |
| **Tonos** | Editar los 13 tonos. |
| **Guardianes** | Textos de guardianes (hoy vacíos). |
| **Conceptos** | Conceptos fundamentales del calendario (hoy vacíos). |
| **Configuración** | Valores generales del sitio guardados en la tabla `configuracion`. |

Nota: los colores de maíz, elementos y direcciones tienen una fuente única en el código (`src/data/maices.ts`) que se aplica encima de lo que diga la base. Si se cambian en el panel, el sitio sigue mostrando los del código.

## Dar acceso a una persona

Se hace una sola vez por persona, desde el panel de Supabase del proyecto.

1. Supabase → **Authentication → Users → Add user → Create new user**. Poner su correo y una contraseña temporal; marcar «Auto Confirm User».
2. Supabase → **SQL Editor**, correr (cambiando el correo):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'persona@ejemplo.com'
on conflict do nothing;
```

3. La persona entra en `/admin/login` y cambia su contraseña con «¿Olvidaste tu contraseña?».

Quitar el acceso:

```sql
delete from public.user_roles
where role = 'admin'
  and user_id = (select id from auth.users where email = 'persona@ejemplo.com');
```

Ver quién tiene acceso:

```sql
select u.email, r.role, u.last_sign_in_at
from public.user_roles r join auth.users u on u.id = r.user_id
order by u.email;
```

Importante: en el proyecto actual de Supabase (`kthmoffuateddameqafx`, reconstruido el 4 de octubre de 2026) la tabla `user_roles` puede estar vacía. Si nadie logra entrar, dar de alta al primer administrador con los pasos de arriba.

## Datos que no están en el panel

- **Pedidos del Oráculo** (tabla `pedidos`): hoy 0 filas porque el cobro está apagado. Se consultan en Supabase → Table Editor → `pedidos`.
- **PDFs generados**: Supabase → Storage → bucket privado `oraculos`.
- **Leads del proyecto anterior** (`yzijamjsnaardrnqdycl`): ese proyecto quedó inaccesible y sus leads se perdieron al reconstruir la base el 4 de octubre de 2026. Los leads que se muestran son los posteriores a esa fecha.
