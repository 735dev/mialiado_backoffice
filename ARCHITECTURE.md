# Arquitectura — `aliado_backoffice`

Panel web del equipo de Aliado: verificar comercios, moderar promociones, atender usuarios y soporte, finanzas, reportes y configuración. Bitácora: [SESSIONS.md](SESSIONS.md).

## Qué es y qué no es

- Es un frontend independiente que consume `aliado_backend` en `/api/admin` (contrato: `aliado_backend/docs/api/admin.md`).
- No comparte build con el backend ni con las apps móviles, pero **sigue las mismas reglas** que las apps (`aliado/ARCHITECTURE.md`, skill `frontend-react-architecture`, `aliado/docs/CONTRATO.md`): mismo patrón de `apiAxios`, `ApiResult`, store, i18n, formularios y guards.
- Diseño de referencia: `aliado_prototipos/backoffice` (B01–B18).

## 1. Stack

React 19 · react-router-dom 6 · Redux Toolkit + redux-persist · axios (solo vía `apiAxios`) · React Hook Form + Zod · Tailwind 3 (`dark` por clase, colores por variables CSS) · Radix Dialog · sonner · lucide-react · Vitest + Testing Library + jsdom · ESLint 9.

`@tanstack/react-query` se quitó: las listas usan providers + `usePagination`.

## 2. Estructura de `src/`

| Carpeta | Contenido |
| --- | --- |
| `app/` | Arranque: `App`, `Providers` (Redux, Persist, Tema, Router, Toaster, DisplayMessage), `AppRoutes` |
| `lib/api/` | `client.ts` (axios + interceptores 401/5xx), `api.ts` (`apiAxios`), `handlers.ts`, `types.ts` (`ApiResult<T>`, `Paginated<T>`) |
| `lib/store/` | Slices `auth` (token, refresh, usuario, **permisos**), `theme`, `lang`, `ui` |
| `lib/i18n/` | `index.ts` y `locales/{es,en}.json` (común: `common`, `nav`, `roles`, `errors`, …) |
| `lib/routes/` | `paths.ts` (rutas de TODAS las pantallas), `types.ts` (`ACCESS`, `defineScreens`), `access.ts` (`can`, `decideAccess`, `homePath`), `Guards.tsx`, `screens.ts` |
| `lib/constants/` | `roles.ts` (admin · moderador · soporte · finanzas), `modules.ts` (los 13 módulos de permisos) |
| `lib/{hooks,utils,theme,config}/` | `useT`, `useAuth`, `useTheme`, `useLang`, `usePagination`, `notify`, `cn`, esquemas Zod, `env.ts` |
| `lib/secciones.ts` | Las 13 secciones del menú (id = módulo de permisos, ruta, grupo, pantalla B0x, icono) |
| `providers/` | Servicios que devuelven `ApiResult<T>`: `adminAuthProvider`, `refreshProvider`, `pendientesProvider` |
| `components/` | `ui/` (Button, Input…, Badge, EmptyState), `form/` (RHF+Zod), `feedback/` (DisplayMessage, Toaster, ErrorBoundary), `pagination/`, `shell/` (AppShell, Sidebar), `layout/` (SectionPlaceholder) |
| `pages/<feature>/` | `views/`, `components/`, `hooks/`, `schemas/`, `i18n/{es,en}.json`, `routes.ts` |
| `styles/tokens.css` | Colores de Aliado, claro y oscuro (`.dark` en `<html>`) |
| `test/` | `setup.ts`, `utils.tsx` (`renderWithProviders`, `signInAs`) |

Features: `acceso` (B01, B18) · `resumen` (B02) · `comercios` (B03, B04) · `usuarios` (B05, B06) · `promociones` (B07; B17 es un modal de B07) · `impulsos` (B08) · `finanzas` (B09) · `niveles` (B10) · `categorias` (B11) · `notificaciones` (B12) · `soporte` (B13) · `reportes` (B14) · `equipo` (B15) · `auditoria` (B16).

Reglas (las vigilan ESLint y `src/architecture.test.ts`): sin imports cruzados entre features (ni por alias ni por ruta relativa); `lib/`, `components/` y `providers/` no importan `pages/`; axios solo en `lib/api`; sin `fetch` directo; sin `localStorage` fuera del store; sin `alert/prompt/confirm`; solo `env.ts` lee `import.meta.env`; ningún archivo pasa de 1000 líneas (`max-lines`); cada feature tiene `routes.ts` e `i18n` es/en con las mismas claves.

## 3. Cómo registrar una pantalla

Cada feature exporta `routes` en `src/pages/<feature>/routes.ts`. `lib/routes/screens.ts` las descubre con `import.meta.glob('/src/pages/*/routes.ts')`: **una feature nueva no obliga a tocar ningún archivo común**, y dos personas en features distintas nunca chocan.

1. Crea `src/pages/<feature>/views/MiVista.tsx` con `export const routeName = PATHS.xxx` y `export default` del componente. Si la ruta es nueva, agrégala **una vez** en `lib/routes/paths.ts` (ya están B01–B18).
2. Agrega la entrada en `src/pages/<feature>/routes.ts`: `{ code, path, load: () => import('./views/MiVista'), access, layout }`.
   - `access`: `ACCESS.modulo('comercios')` (exige `ver`; `ACCESS.modulo('comercios', 'aprobar')` para otra acción), `ACCESS.auth` (cualquier persona del equipo) o `ACCESS.public`.
   - `layout`: `'shell'` (con menú lateral) o `'plain'` (pantalla completa, solo login).
3. Textos en `src/pages/<feature>/i18n/es.json` y `en.json`; se leen como `t('<feature>.clave')` (el nombre de la feature no puede coincidir con una clave común: `common`, `nav`, `roles`, `errors`, `pagination`, `placeholder`, `theme`, `lang`).
4. Datos: un `providers/<dominio>Provider.ts` que devuelva `ApiResult<T>` usando `apiAxios` (base `/api/admin`, URL relativa como `/comercios`) y `handleErrorAxios`; listas con `usePagination` + `PaginatedComplete`; formularios con `useZodForm` + `Form` + `FormInput`…; avisos con `notify.*`.

Hoy cada vista es un `SectionPlaceholder`; quien construya la pantalla reemplaza el cuerpo de la vista y deja `routeName` y su entrada en `routes.ts`. `src/lib/routes/routes.test.ts` comprueba que cada vista exporte un `routeName` igual a su ruta, que no haya rutas ni códigos repetidos, que estén B01–B16 y B18, y que las 13 secciones del menú coincidan con los 13 módulos del backend.

## 4. Sesión, roles y permisos

- **Login B01 en dos pasos**: `POST /auth/login` (correo + contraseña) devuelve un `challenge_token` y `configurado`; `POST /auth/2fa` (código TOTP de 6 dígitos) devuelve la sesión. En el primer ingreso (`configurado: false`) se muestra el `secreto` y el enlace `otpauth_uri`. Con la sesión se pide `GET /auth/me` (perfil + matriz de permisos) y recién entonces se guarda todo junto en el store (`signedIn`): nunca hay una sesión a medias.
- 401/403 de `/auth/login` y `/auth/2fa` (credenciales o código malos, sin rol, suspendido) se muestran **en el formulario**; el resto de errores pasa por `notify.fromApiError`.
- Renovación: un 401 con sesión renueva el par con `POST /auth/refresh` **una vez** (promesa compartida entre peticiones simultáneas) y reintenta; si el refresh falla con 401/403 → `logout` + `persistor.purge()` + `/login`; sin red o 5xx la sesión se conserva. Las rutas `/auth/login|2fa|aceptar-invitacion|refresh|logout` nunca disparan renovación.
- Al abrir el panel con una sesión guardada, el `AppShell` refresca `/auth/me` (la matriz puede cambiar en B15) y las insignias del menú desde `/pendientes`.
- **Roles** (`lib/constants/roles.ts`): `admin` (todo), `moderador` (Operaciones), `soporte`, `finanzas`. **Permisos**: matriz `{ módulo: { ver, editar, aprobar } }` que entrega el backend; `can(session, módulo, acción)` (admin siempre puede). El menú solo muestra las secciones con `ver`; `RequireAccess` manda sin sesión a `/login` y sin permiso a **B18 `/sin-permiso`** (accesible para cualquiera con sesión, así que no hay bucles), que muestra quién puede dar acceso (`admins` de `/auth/me`) y a qué sí puede entrar. Tras el login se va a la primera sección permitida (`homePath`).
- Los componentes de pantalla usan `useAuth().puede('comercios', 'aprobar')` para mostrar u ocultar acciones; el backend sigue siendo la autoridad (403 → aviso).
- Cerrar sesión: `POST /auth/logout` (si falla, igual se cierra local), `logout()` y `persistor.purge()`.

## 5. Estado, idioma y tema

- Slices `auth`, `theme`, `lang` persistidos con redux-persist (clave `aliado-backoffice`); `ui` (modal global) nunca se persiste.
- i18n es/en con `useT()`: claves comunes en `lib/i18n/locales`, cada feature aporta su `i18n/{es,en}.json`. Mensajes de esquemas Zod = claves (`errors.minLength|3`).
- Tema claro/oscuro: variables de `styles/tokens.css` (`:root` y `.dark`) expuestas en `tailwind.config.js` (`bg-surface`, `text-ink-muted`, `bg-primary`…). Nunca hex sueltos. `ThemeProvider` pone la clase `dark` según `light | dark | system`. El menú lateral tiene el interruptor de tema y el de idioma.

## 6. Entorno

| Variable | Uso | Valor local |
| --- | --- | --- |
| `VITE_API_BASE` | Base de la API del panel | `/api/admin` |

En desarrollo, `vite.config.ts` envía `/api` a `http://127.0.0.1:5010` (aliado_backend; `127.0.0.1` y no `localhost`, que en Windows resuelve a `::1` y uvicorn no escucha ahí). `.env.dev` y `.env.production` se versionan; `.env` y `.env.*.local` no. Despliegue de ejemplo: `deploy/nginx.conf.example`.

## 7. Menú y diseño

Menú lateral flotante de 264 px (radio 32) en escritorio y cajón con barra superior en móvil; 13 secciones en 5 grupos (General, Operación, Negocio, Comunidad, Configuración), ítem activo `primary-tint`/`primary-deep`, insignias de pendientes, usuario con su rol y cierre de sesión. Tipografía Plus Jakarta Sans y Spline Sans Mono (Google Fonts en `index.html`).

## Estado final y verificación

Al 2026-10-08: `npm run typecheck`, `npm run lint` (`--max-warnings=0`), `npm test` (99 pruebas, 15 archivos) y `npm run build` en verde. Login verificado contra el backend real (SQLite + seed): login → TOTP generado por script → `/auth/me` (13 módulos) → `/pendientes` → refresh (rotación y rechazo del refresh reutilizado) → logout, a través del proxy de Vite; y el interceptor del cliente renovando un access inválido y cerrando sesión con un refresh revocado.

## Pendientes

- Las vistas de B02–B16 son placeholders; falta construir cada pantalla según su prototipo (B17 es un modal de B07).
- B01: el primer ingreso muestra el secreto y el enlace `otpauth_uri`, pero no dibuja el código QR (no hay librería de QR). Faltan aceptar invitación (`/auth/aceptar-invitacion`), «¿Olvidaste tu contraseña?» y «código de respaldo» del prototipo (el backend no los expone).
- Sin verificar en navegador real (solo jsdom y pruebas contra la API): revisar visualmente el menú en móvil y en oscuro.
- La sesión vive en `localStorage` vía redux-persist; evaluar cookie httpOnly o almacenamiento más seguro antes de producción.
- Un 403 del backend («No tienes acceso a <módulo>») hoy se muestra como aviso; podría llevar a B18.
- Búsqueda global (⌘K) y avatar del encabezado del prototipo no están hechos.
- React Router 6 emite avisos de *future flags* de v7 en las pruebas; migrar a v7 cuando se suba la versión.
- `npm install` avisa de vulnerabilidades en dependencias; revisar con `npm audit`. Node local 18.17: ESLint 9 y algunas dependencias piden 18.18+/20 (solo avisos).
