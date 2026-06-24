# Skill: Scaffold Feature Architecture
Description: Genera el esqueleto completo de una nueva Feature siguiendo estrictamente el estándar Feature-Sliced Design del proyecto.

## Instructions
1. Lee silenciosamente `.docs/rules/clean-architecture.md`.
2. Pide al usuario el nombre de la feature y si pertenece a `admin/` o `front/` (si no lo especificó en el comando).
3. Utilizando el "scratchpad" o generando los archivos directamente, crea la siguiente estructura para la feature:
   - `components/`: Al menos un componente contenedor y uno de UI.
   - `hooks/`: Un hook que centralice la lógica.
   - `stores/`: Un archivo de Zustand base (solo si la feature requiere estado complejo).
4. Crea un archivo en `src/services/` si la feature requiere interacción con la base de datos.
5. Asegúrate de que los componentes importen y utilicen la paleta de colores y estilos correctos según si es Admin o Front (leyendo `.docs/rules/admin-ui-rules.md` o `front-ui-rules.md`).

## Constraints
- Genera código completamente tipado.
- No incluyas llamadas directas a Firebase en los componentes; deja los cascarones listos para usar la capa de `services/`.