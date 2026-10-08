# aliado_backoffice

Panel web del equipo de Aliado (React + Vite + TypeScript). Sigue las mismas reglas que las apps (`aliado`): Redux Toolkit + redux-persist, axios solo vía `apiAxios`/`ApiResult`, RHF + Zod, i18n es/en, tema claro/oscuro y un `routes.ts` por feature.

| Por dónde empezar | |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, estructura, cómo registrar una pantalla, sesión y permisos |
| [SESSIONS.md](SESSIONS.md) | Bitácora de cambios y convención de ramas |

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173 (envía /api a aliado_backend en 127.0.0.1:5010)
npm run check      # typecheck + eslint (--max-warnings=0) + vitest + build
```

Backend para probar el login real (`..\aliado_backend`, con `.env` local en SQLite):

```bash
python -m scripts.seed                 # una vez
python -m uvicorn main:app --port 5010
```

Cuentas de demo (contraseña `Demo12345`, mismo TOTP): `carlos.mendoza@aliado.app` (admin), `laura.rojas@aliado.app` (moderador), `valeria.contreras@aliado.app` (finanzas), `diego.alvarado@aliado.app` (soporte), con segundo factor TOTP (secreto `JBSWY3DPEHPK3PXP`; el código de 6 dígitos se genera con cualquier app autenticadora o un script TOTP).

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, sin avisos permitidos |
| `npm test` | Vitest (incluye `src/architecture.test.ts`) |
| `npm run build` | `tsc` + build de producción en `dist/` |

## Variables de entorno

`VITE_API_BASE` (por defecto `/api/admin`). Solo `src/lib/config/env.ts` lee `import.meta.env`.

## Estado

Pantallas B01–B18 construidas (B17 es un modal) y revisadas en navegador; lo no verificado y los pendientes están en [ARCHITECTURE.md](ARCHITECTURE.md#pendientes).
