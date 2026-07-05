# Reglas de UI/UX: Módulo Admin (Backoffice)

## Principios de Diseño
- Estética: Minimalista, elegante, estilo "Luxury Event".
- Objetivo: Eficiencia, densidad de datos, flujos CRUD rápidos sin distracciones.
- Interactividad Móvil: Priorizar menús tipo Dropdown al hacer "click" (onTap) sobre efectos "hover" nativos que fallan en pantallas táctiles.

## Paleta de Colores Estricta
- Fondo general: `#F9F7F2` (Crema suave).
- Superficies (Tarjetas/Paneles): `#FFFFFF` o `#FDFBF7`.
- Primario/Acentos: `#C5A669` (Dorado/Ocre).
- Textos Principales: `#2C2C29` (Gris carbón).
- Textos Secundarios: `#5A5A5A` o `#A8A29E`.
- Feedback: Verde (`#16a34a`, bg `green-50`), Naranja (`#f97316`, bg `orange-50`), Rojo (`#dc2626`, bg `red-50`).

## Componentes UI
- Tablas y Listas: Usar diseño compacto. Consolidar acciones múltiples en "Píldoras Unificadas" (Grouped Pills) o menús desplegables protegidos contra clicks accidentales.
- Modales: Usar `Framer Motion` con aceleración por hardware (`translateZ(0)`, `will-change`) y alturas relativas (`max-h-[95%]`) para evitar parpadeos (blinking) en móviles.
- Tooltips: Usar el componente global interactivo. Deben cerrarse automáticamente al hacer scroll en móviles.

## Tipografía y Bordes
- Títulos principales y modales: `font-serif`.
- Subtítulos de categorías: `text-[10px] font-bold uppercase tracking-widest`.
- Bordes: `rounded-xl` o `rounded-2xl` con divisor color `#EBE5DA`.