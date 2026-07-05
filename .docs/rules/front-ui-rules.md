# Reglas de UI/UX: Módulo Front (Invitados)

## Principios de Diseño
- Objetivo: Emoción, conversión rápida (RSVP fácil) y rendimiento SEO.
- Renderizado: Priorizar Server Components donde sea posible para velocidad de carga y LCP. Marcar con `"use client"` solo componentes interactivos.

## Animaciones e Interactividad
- Uso extensivo de `Framer Motion` para entradas fluidas (fade-in, slide-up).
- Efectos de Parallax sutiles permitidos en portadas.
- Los botones de acción (Ej. Confirmar Asistencia) deben ser prominentes, flotantes si es necesario, y dar feedback visual inmediato (Loaders).

## Estructura de Componentes
- Diseño "Mobile-First" estricto. Las invitaciones se verán en un 95% desde celulares.
- No asumir que el usuario tiene cuenta. Todo flujo de invitado se basa en el ID de invitado en la URL y el Token público de la invitación.