# Tu Nahual — tunahual.com

Calculadora del calendario maya Cholq'ij. El usuario ingresa su fecha de
nacimiento y descubre su Nahual, Tono y Cruz Maya de 9 posiciones, con
resultado inmediato y sin muro de registro. Es la captación de leads de
**Azul Anaité** (negocio de espiritualidad maya): el lead queda guardado en
Supabase y se sincroniza al CRM propio (Azul Anaité OS).

## Cómo se corre

```sh
npm install
npm run dev       # servidor de desarrollo (Vite)
npm run build     # build de producción
npm run preview   # sirve el build
npm run lint       # ESLint
npm test           # Vitest
npm run test:e2e   # smoke tests E2E con Playwright
```

Las variables `VITE_*` (Supabase, analítica, Sentry) se incrustan en el build
y deben estar configuradas en Vercel **antes** de compilar; ver `.env.example`
para la lista completa. Detalle de stack, integraciones y convenciones del
repo en `CLAUDE.md`.
