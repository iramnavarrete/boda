# Skill: Evaluate Admin Code
Description: Audita componentes, hooks y stores del módulo Admin para garantizar el cumplimiento de Clean Architecture y las guías de UI/UX del backoffice.

## Instructions
1. Lee silenciosamente los siguientes blueprints:
   - `.docs/rules/clean-architecture.md`
   - `.docs/rules/admin-ui-rules.md`
2. Analiza el código del archivo o directorio proporcionado.
3. Evalúa si el código respeta la inyección de dependencias (Ej. NO llamar a Firebase directamente en el UI, usar `src/services/`).
4. Evalúa la UI:
   - ¿Usa la paleta de colores permitida (`#F9F7F2`, `#C5A669`, etc.)?
   - ¿Está optimizado para móviles (evitando depender exclusivamente de `:hover`)?
   - Si es un Modal o Tooltip, ¿tiene aceleración por hardware y protección contra parpadeos?
5. Genera un reporte estructurado resaltando los errores.
6. Proporciona el código refactorizado listo para copiar y pegar, explicando brevemente los cambios.

## Constraints
- NUNCA sugieras estilos pensados para el cliente final (Front). Esto es un panel de administración.
- Exige tipado estricto en TypeScript. Rechaza el uso de `any`.
- Si el código no pertenece a la carpeta `admin/`, detén la ejecución y avisa al usuario.