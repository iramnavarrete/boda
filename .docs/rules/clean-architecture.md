# Reglas Globales de Arquitectura: Plataforma de Invitaciones

## Stack Principal
- Framework: Next.js (App Router) con React.
- Estado Global: Zustand.
- Backend/DB: Firebase (Firestore, Auth, Admin SDK).
- Estilos: Tailwind CSS + Herramientas nativas (clsx/tailwind-merge).

## Estructura de Carpetas (Feature-Sliced Design)
Todo el código debe organizarse por dominio funcional (Features), no por tipo de archivo técnico.
- `src/features/[nombre-feature]/components/`: UI pura.
- `src/features/[nombre-feature]/hooks/`: Lógica de negocio y conexión de estado.
- `src/features/[nombre-feature]/stores/`: Estado global específico de la feature (Zustand).
- `src/services/`: Abstracción estricta de Firebase (Ej. `InvitationsService.ts`).
- `src/api/`: Rutas exclusivas para Firebase Admin SDK (Rutas protegidas de backend).

## Reglas de Inyección y Datos
- PROHIBIDO llamar a Firebase directamente desde un componente `.tsx`. Siempre usa un archivo en `src/services/`.
- PROHIBIDO el "Prop Drilling" excesivo. Usa los selectores de Zustand (`useAuthStore`, `useSeatingStore`) para acceder a datos globales o permisos (`useEventPermissions`).
- Los Custom Hooks deben orquestar la lógica. Los componentes visuales solo deben recibir booleanos simples o funciones limpias.

## Manejo de Autenticación y Permisos
- La autorización se maneja mediante Custom Claims de Firebase (`isRootAdmin`, roles por evento).
- El frontend valida permisos leyendo Zustand de forma síncrona (Costo $0 en lecturas).
- El backend (`/api/admin/`) es la fuente de la verdad y asigna los claims transaccionalmente.