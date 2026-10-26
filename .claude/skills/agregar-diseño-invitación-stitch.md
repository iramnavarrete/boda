# Skill: agregar-diseño-invitación-stitch

## Propósito
Integrar un nuevo DISEÑO de invitación generado por Stitch (HTML
completo exportado) al sistema de invitaciones digitales. El skill
detecta automáticamente las secciones del HTML (vía `data-purpose`),
las mapea a los componentes existentes del proyecto, aplica
principios DRY (extrayendo patrones visuales repetidos a componentes
compartidos), y genera:

1. Componentes TSX para cada sección (respetando el diseño del HTML).
2. Componentes compartidos para patrones visuales que se repiten
   (DRY).
3. Bindings de placeholders `{{ x }}` a datos de Firestore.
4. Un archivo de configuración por defecto (igual que
   `sofia-xv.config.tsx` y `valentina-xv-sapphire.config.tsx`).
5. La página Next.js que la consume.

## Inputs del usuario
- 1 archivo HTML (export de Stitch) pegado o como path.
- (Opcional) Tipo de evento: `boda` | `xv` | `bautizo` | `cumple`.
  Si no se da, inferir del HTML.
- (Opcional) Slug de la invitación. Si no, proponer uno.
- (Opcional) Nombre del theme. Si no, inferir de la paleta.

## Sistema de referencia

El sistema ya tiene un orchestrator genérico
(`src/features/front/invitations/shared/InvitationPage.tsx`) y
13 secciones base
(`src/features/front/invitations/sections/`):

- CoverSection, QuoteSection, ParentsSection, CountDownSection
- DressCodeSection, GallerySection, GiftsSection
- AssistantsSection, QrSection, FooterSection
- AudioSection
- AccommodationSection, TimelineSection (sub-secciones)

Las configs existentes (`sofia-xv.config.tsx`,
`valentina-xv-sapphire.config.tsx`) son la referencia para entender
el shape de los datos que pasan a cada sección.

## Workflow

### PASO 1 — Parsear el HTML

**1a. Detectar TODOS los `data-purpose` del HTML** (regex):

```js
const purposeRegex = /data-purpose="([^"]+)"/g;
const purposes = new Set();
let m;
while ((m = purposeRegex.exec(html)) !== null) {
  purposes.add(m[1]);
}
```

**1b. Para cada `data-purpose`, extraer el HTML del elemento más
cercano que lo contiene** (DOM walking). Si el `data-purpose` está
en un `<div>` que es el contenedor de la sección, capturar todo el
HTML interno.

**1c. Detectar también secciones con `id`** (por si Stitch usó `id`
en vez de `data-purpose` en algunas). Lista de IDs esperados:

```
cover, quote, parents, countdown, ceremony, reception,
add-to-calendar, gifts, gallery, qr-photos, music, dress-code,
accomodation, timeline, rsvp, footer
```

**1d. Inferir el tipo de evento** (boda/xv/bautizo/cumple) si el
usuario no lo dio:

- `quinceañera`, `xv años`, `mis xv` → **xv**
- `boda`, `matrimonio`, `casamiento` → **boda**
- `bautizo`, `bautismo` → **bautizo**
- `cumpleaños`, `birthday` → **cumple**

Si ambiguo, PREGUNTAR al usuario.

### PASO 2 — Mapeo de data-purpose → secciones del sistema

Tabla de referencia (basada en el HTML del usuario). Si Stitch
usa `data-purpose` con un nombre no listado, hacer un fallback al
nombre de `id` o preguntar al usuario.

| data-purpose del Stitch | Sección del sistema | Estrategia |
|---|---|---|
| `top-branding` | `cover` (parte 1: branding) | REUSE |
| `boarding-pass-main` | `cover` (parte 2: ticket principal) | REUSE |
| `invitation-text-and-photo` | `quote` (texto de invitación) | REUSE |
| `honor-crew-section` | `parents` (familia/padrinos) | REUSE |
| `save-the-date-calendar` | `countdown` (calendario + cuenta regresiva) | REUSE |
| `venue-card` | `dressCode` (que envuelve ceremony + reception + accommodation) | REUSE |
| `wedding-timeline` | `timeline` (sub-sección) | REUSE |
| `couples-photo-gallery` | `gallery` | REUSE |
| `dress-code-and-attire` | `dressCode` (parte 2: dress code) | REUSE |
| `lodging-section` | `accommodation` (sub-sección) | REUSE |
| `gift-registry-section` | `gifts` | REUSE |
| `qr-photo-album-dark` | `qrPhotos` | ⚠️ **ADAPT** |
| `rsvp-ticket-card` | `assistants` | ⚠️ **ADAPT** |
| `destination-ticket-stub` | `footer` (extensión decorativa) | REUSE |
| `page-footer` | `footer` (créditos) | REUSE |
| `wedding-timeline` | `timeline` | REUSE |

**Estrategias**:

- **REUSE**: el HTML es estructuralmente similar al componente
  base. Solo aplicar CSS variables (theme) y bindings de datos.
  Sin cambios de código (más allá de los bindings).
- **⚠️ ADAPT**: el HTML tiene una estructura nueva, pero la sección
  tiene **lógica de negocio** que NO se debe re-implementar:
  - `qrPhotos`: usar `src/features/front/invitations/sections/QrSection.tsx`
    (preservar generación del QR desde `family.id`).
  - `assistants`: usar `src/features/front/invitations/sections/AssistantsSection.tsx`
    (preservar Formik, validaciones, contexto de familia, Firestore,
    integración con WhatsApp).
  - **Cómo adaptar**: tomar del HTML los colores, tipografía,
    layout; aplicarlos al componente existente via:
    1. Una nueva prop `theme` o `variant` en el componente.
    2. O un wrapper con className que sobrescriba los estilos
       del componente base.
    3. Preservar 100% la lógica (hooks, estado, props, integraciones).

### PASO 3 — Detectar patrones DRY (visual repetition)

Antes de generar los componentes, escanear el HTML en busca de
**patrones visuales que se repiten**. Por cada patrón detectado,
proponer un **componente compartido** (DRY).

**Patrones comunes identificados** (del HTML de referencia):

1. **BoardingPassTicket** (wrapper con scallops + notches + header)
   - Aparece 8+ veces en el HTML (BoardingPass, HonorCrew, Calendar,
     Venue, DressCode, Lodging, GiftRegistry, RSVP).
   - Extraer a `src/features/front/components/shared/BoardingPassTicket.tsx`.
   - API:
     ```tsx
     <BoardingPassTicket
       leftLabel="BOARDING PASS"
       centerLabel="WEDDING TICKET"
       rightLabel="FIRST CLASS"
       notchPosition="bottom" // o "top"
     >
       {/* contenido interno */}
     </BoardingPassTicket>
     ```
   - El componente internamente usa:
     `ticket-top-scallop`, `ticket-bottom-scallop`,
     `notch-side-left`, `notch-side-right`, `notch-center-bottom`.

2. **TicketScallop** (decoration SVG/CSS)
   - `ticket-top-scallop` y `ticket-bottom-scallop`
   - Extraer a `src/features/front/components/shared/TicketScallop.tsx`
     o como parte de `BoardingPassTicket`.

3. **StampBadge** (círculo decorativo con borde dashed + inner)
   - Usado en `boarding-pass-main` (sello de Lauren & Marco).
   - Extraer a `src/features/front/components/shared/StampBadge.tsx`.

4. **StarDivider** (línea con ✦ o svg central)
   - Usado como divisor en varias secciones.
   - Extraer a `src/features/front/components/shared/StarDivider.tsx`.

5. **TornPaperEdge** (efecto de borde rasgado)
   - Extraer a `src/features/front/components/shared/TornPaperEdge.tsx`
     si se usa más de una vez.

**Regla de oro**: si un patrón aparece 2+ veces en el HTML,
extraerlo. Si aparece solo 1 vez, dejarlo inline (o también
extraer si es complejo y se va a reusar en futuras invitaciones).

### PASO 4 — Detectar el sistema de theme (CSS variables)

**4a. Localizar el bloque de configuración de Tailwind en el HTML**:

```html
<script data-purpose="tailwind-config">
  tailwind.config = { theme: { extend: { colors: { ... } } } }
</script>
```

Extraer los colores custom (ej. `navy.900: '#060f1c'`,
`parchment.DEFAULT: '#f6f2ea'`, `gold.accent: '#b89f72'`).

**4b. Si NO hay un bloque `data-purpose="tailwind-config"`,
extraer colores de**:
- `<style data-purpose="base-layout">` y otros `<style>` blocks
- `bg-[#hex]` y `text-[#hex]` en las clases del HTML

**4c. Mapear a variables CSS del sistema**:

| Stitch usa | → Variable CSS en `globals.css` |
|---|---|
| Color de fondo del hero | `--<prefix>-bg-deepest` |
| Color de card / ticket | `--<prefix>-bg-card-from` / `--<prefix>-bg-card-to` |
| Color de acento (oro, primary) | `--<prefix>-accent` |
| Color claro (texto sobre fondo oscuro) | `--<prefix>-text-light` |
| Variante con opacidad del accent | `--<prefix>-accent-soft` |

Donde `<prefix>` es `wed`, `xv`, `bau`, `bday` según el tipo de
evento (inferido en PASO 1).

**4d. Generar el bloque CSS** para pegar en `globals.css`:

```css
[data-<prefix>-theme="<nombre>"] {
  --<prefix>-bg-deepest: <#hex>;
  --<prefix>-bg-card-from: <#hex>;
  --<prefix>-bg-card-to: <#hex>;
  --<prefix>-accent: <#hex>;
  --<prefix>-accent-soft: rgb(R G B / 0.5);
  --<prefix>-text-light: <#hex>;
  --<prefix>-whatsapp-top: #25d366;
  --<prefix>-whatsapp-bottom: #128c7e;
  --<prefix>-shadow-text-glow: 0 0 14px rgb(R G B / 0.4);
}
```

### PASO 5 — Generar los componentes compartidos (DRY primero)

**Orden de generación**: primero los compartidos (DRY), después
las secciones individuales.

Para cada patrón DRY detectado en PASO 3, crear el componente en
`src/features/front/components/shared/`. Usar **Server Components
por default** (sin `"use client"` a menos que necesite estado o
efectos).

Ejemplo de `BoardingPassTicket.tsx`:

```tsx
interface BoardingPassTicketProps {
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
  notchPosition?: "top" | "bottom" | "both";
  className?: string;
  children: React.ReactNode;
}

export default function BoardingPassTicket({
  leftLabel,
  centerLabel,
  rightLabel,
  notchPosition = "bottom",
  className,
  children,
}: BoardingPassTicketProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden text-slate-800 shadow-xl",
        "bg-parchment-light",
        className,
      )}
    >
      {/* Top scallop */}
      <div className="absolute top-0 left-0 w-full h-2.5 bg-ticket-top-scallop" />

      {/* Side notches */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-page" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-page" />

      {/* Header */}
      {(leftLabel || centerLabel || rightLabel) && (
        <div className="flex justify-between items-center text-[9px] font-bold tracking-widest text-stone-500 border-b border-dashed border-stone-300 pb-2 mb-2 uppercase px-6 pt-4">
          <span>{leftLabel}</span>
          <span className="text-stone-800 tracking-[0.25em] font-semibold">
            {centerLabel}
          </span>
          <span>{rightLabel}</span>
        </div>
      )}

      {/* Content */}
      <div className="px-6 pt-4 pb-7">{children}</div>

      {/* Bottom scallop */}
      <div className="absolute bottom-0 left-0 w-full h-2.5 bg-ticket-bottom-scallop" />

      {/* Center notch */}
      {notchPosition === "bottom" && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-11 h-5 rounded-t-full bg-page" />
      )}
    </div>
  );
}
```

### PASO 6 — Generar cada sección (TSX)

**6a. Para cada `data-purpose` clasificado como REUSE**:

- Ubicación: `src/features/front/invitations/sections/<Nombre>Section.tsx`
  (si es nueva) o `sections/<Nombre>Section.tsx` existente.
- El componente wrapper recibe los props del componente base
  (`<Nombre>SectionProps`) y los pasa.
- Si el HTML es **estructuralmente similar al componente existente**,
  el wrapper solo agrega los wrappers compartidos (ej.
  `BoardingPassTicket`) y los bindings de datos.
- Si el HTML tiene una **estructura diferente** que vale la pena
  mantener, sobrescribir el wrapper con la nueva estructura.

**6b. Para cada `data-purpose` clasificado como ⚠️ ADAPT**:

- **`qr-photo-album-dark`** → `QrSection.tsx`:
  - Importar el componente base `QrPhotos` de
    `src/features/front/components/sections/qr-photos.tsx`.
  - Envolverlo en un wrapper que aplique el estilo del HTML
    (ticket-paper, parchment background, stamp badge, etc.).
  - **Preservar**: la generación del QR, el link a Google Photos
    desde `family.id`, la lógica de abrir nueva pestaña.
  - NO re-implementar el QR. Solo aplicar el visual.

- **`rsvp-ticket-card`** → `AssistantsSection.tsx`:
  - Importar el componente base `Assistants` de
    `src/features/front/components/siena/Assistants.tsx` (o
    `sections/Assistants.tsx` según el tipo).
  - Envolverlo en un wrapper con el estilo del ticket (parchment,
    ticket-paper, etc.).
  - **Preservar**: Formik, validaciones, contexto de familia,
    integración con WhatsApp, persistencia en Firestore.
  - NO re-implementar el form. Solo aplicar el visual.

**6c. Bindings de placeholders a Firestore**:

| Placeholder del HTML | Origen en Firestore |
|---|---|
| `{{ nombreEvento }}` | `invitationData.nombre` |
| `{{ quinceanera }}` (XV) | `invitationData.quinceanera?.monograma` o derivado de `padresQuinceanera` |
| `{{ fraseInicial }}` | (campo nuevo propuesto) o derivado |
| `{{ fechaEvento }}` | `invitationData.fecha` (formateado con `toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })`) |
| `{{ countdownFecha }}` | `invitationData.fecha` (ISO) |
| `{{ lugarCeremonia }}` | `invitationData.ceremonia.nombreTemplo` |
| `{{ horaCeremonia }}` | `invitationData.ceremonia.hora` |
| `{{ direccionCeremonia }}` | `invitationData.ceremonia.direccion` |
| `{{ mapaCeremonia }}` | `invitationData.ceremonia.enlaceMaps` |
| `{{ nombreRecepcion }}` | `invitationData.recepcion.nombreSalon` |
| `{{ horaRecepcion }}` | `invitationData.recepcion.hora` |
| `{{ direccionRecepcion }}` | `invitationData.recepcion.direccion` |
| `{{ mapaRecepcion }}` | `invitationData.recepcion.enlaceMaps` |
| `{{ padresNovia }}` | `invitationData.padresNovia.mama` + `padresNovia.papa` |
| `{{ padresNovio }}` | `invitationData.padresNovio.mama` + `padresNovio.papa` |
| `{{ padrinos }}` (XV) | `invitationData.padrinos.nombre1` + `padrinos.nombre2` |
| `{{ urlInvitacion }}` | `https://jninvitaciones.com/i/${invitationId}?family=${familyId}` |
| `{{ linkAddToCalendar }}` | generado en runtime (helper de Google Calendar URL) |
| `{{ linkWhatsApp }}` | `https://wa.me/${family.telefono}?text=${encodeURIComponent(msg)}` |
| `{{ cancionUrl }}` / `{{ cancionTitulo }}` | (campos nuevos, ver PASO 7) |
| `{{ qrFotosUrl }}` | (campo nuevo, ver PASO 7) |
| `{{ dressCode }}` (XV) | (campo nuevo, ver PASO 7) |
| `{{ timeline }}` (XV) | (campo nuevo, ver PASO 7) |
| `{{ imagenPortada }}` | `invitationData.imagenPortada` (o `coverImage` del config) |

### PASO 7 — Extensiones de modelo (si aplica)

Si el HTML usa placeholders que NO existen en `types/types.d.ts`,
agregarlos a la interfaz `Invitation` y a `CreateInvitationModal.tsx`:

```ts
// types/types.d.ts
export interface Invitation {
  // ... existentes
  cancionUrl?: string;
  cancionTitulo?: string;
  qrFotosUrl?: string;
  dressCode?: string; // XV
  timeline?: Array<{ hora: string; descripcion: string }>; // XV
  fraseInicial?: string;
  // ...
}
```

Y en `CreateInvitationModal.tsx`:
- `initialState` (línea ~90): agregar los campos vacíos.
- `editState` desde `invitationToEdit` (línea ~160): hidratar desde Firestore.
- `payload` (línea ~200): enviar al guardar.
- Textareas/inputs (líneas ~1100-1200): exponer al admin.

**Patrones a respetar (de los commits del 6 de octubre)**:
- Usar `isDateInPast` para validar fechas.
- Usar `DatePicker` con `hasError` + `errorMessage`.
- Respetar retrocompat de 4 mensajes WhatsApp.

### PASO 8 — Generar la config por defecto

Crear `src/features/front/invitations/configs/<slug>.config.tsx`,
basado en el shape de `sofia-xv.config.tsx` y
`valentina-xv-sapphire.config.tsx`:

```tsx
import type { InvitationConfig } from "../shared/types";
import StarsBorder from "@/icons/seal/stars-border";
import XVAñosSealLogo from "@/icons/specificInvitation/XVAñosSealLogo";

const <slug>Config: InvitationConfig = {
  slug: "<slug>",

  metaDescription: "<basado en fraseInicial>",
  favicon: "/favicons/<slug>.ico",

  // Sello
  sealConfig: {
    customSvg: <XVAñosSealLogo className="h-full w-full p-2 -translate-y-1" />,
    borderSvg: <StarsBorder className="w-full h-full translate-y-0.5" />,
    sealColor: "<extraído del theme>",
    textColor: "<extraído del theme>",
  },

  // Sidebars (hojas decorativas del desktop)
  sidebars: {
    flowersClassName: "<color del theme>",
    textClassName: "<color del theme>",
  },

  // Contenido por sección
  sections: {
    cover: {
      monograma: "<extraído del cover>",
      coverImage: "<ruta>",
      preTitle: "<preTitle del cover>",
    },
    quote: {
      emblem: "❧ ✦ ❧",
      preTitle: "<preTitle del HTML>",
      heading: "<heading del HTML>",
      quote: "<quote del HTML>",
      closingLine: "<closingLine del HTML>",
    },
    parents: {
      preTitle: "<del HTML>",
      parentsHeading: "<del HTML>",
      padre: "<padre del HTML>",
      madre: "<madre del HTML>",
      godparentsHeading: "<del HTML>",
      godparentsSubtitle: "<del HTML>",
      padrino1: "<del HTML>",
      padrino2: "<del HTML>",
    },
    countDown: {
      targetDate: "<ISO de fecha>",
      heading: "<del HTML>",
      calendarUrl: "<generado automáticamente>",
    },
    dressCode: {
      // Ver CeremonyToast props
    },
    gallery: {
      // Ver Gallery props
    },
    gifts: {
      // Ver GiftsTable props
    },
    assistants: {
      // Ver Assistants props
    },
    qrPhotos: {
      // Ver QrPhotos props
    },
    footer: {
      // Ver Footer props
    },
    audio: {
      // Ver AudioController props
    },
  },

  // Sub-secciones opcionales
  accommodation: { ... },
  timeline: { ... },

  // Fuentes
  fonts: ["cormorant", "cinzel", "montserrat"],
};

export default <slug>Config;
```

**Extraer los valores del HTML**:
- `monograma`: el texto principal del `top-branding` (ej. "S" para Sofía)
- `coverImage`: ruta de la imagen del cover
- `padres`, `madres`, `padrinos`: del `honor-crew-section`
- `heading`, `quote`, `preTitle`: del `invitation-text-and-photo`
- `targetDate`: del calendario del `save-the-date-calendar`
- etc.

### PASO 9 — Generar la página Next.js

Crear `src/pages/i/<slug>/index.tsx`:

```tsx
import InvitationPage from "@/features/front/invitations/shared/InvitationPage";
import <slug>Config from "@/features/front/invitations/configs/<slug>.config";
import { getInvitationProps } from "@/features/front/invitations";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function <Slug>Page(props: PageProps) {
  return <InvitationPage {...props} config={<slug>Config} />;
}

export const getServerSideProps = getInvitationProps;
```

### PASO 10 — Validar

- `npx tsc --noEmit -p .` (0 errores)
- `npx eslint <archivos>` (0 errores)
- Verificar visualmente:
  - `data-<prefix>-theme="<nombre>"` está en el wrapper
  - Las variables CSS se resuelven
  - Las secciones REUSE se ven con el nuevo theme
  - Las secciones ⚠️ ADAPT (Qr, Assistants) funcionan con su
    lógica intacta (RSVP guardando, QR scaneable)
  - Los patrones DRY extraídos (ej. BoardingPassTicket) se ven
    consistentes en todas las secciones que los usan
  - El orden de las secciones es el correcto (cover, quote,
    parents, countdown, dressCode/ceremony, gallery, gifts,
    assistants, qr, footer)

## Salida esperada de Claude

Cuando el usuario pegue el HTML de Stitch y ejecute la skill
(vía `/agregar-diseño-invitación-stitch` o pegando el HTML
directamente), Claude debe entregar:

1. **Tabla de `data-purpose` encontrados** (data-purpose → sección
   del sistema → estrategia)
2. **Tabla de patrones DRY** detectados (patrón → repeticiones →
   componente compartido propuesto)
3. **Tabla de theme** extraído (color hex → variable CSS)
4. **Bloque CSS** listo para pegar en `globals.css`
5. **Componentes compartidos** generados (DRY primero)
6. **Componentes de sección** generados (TSX completos)
7. **Extensiones de modelo** (si aplica): nuevos campos en
   `types/types.d.ts` + `CreateInvitationModal.tsx`
8. **Config por defecto** generado en
   `src/features/front/invitations/configs/<slug>.config.tsx`
9. **Página Next.js** generada en `src/pages/i/<slug>/index.tsx`
10. **Resultado de tsc/eslint**
11. **Notas para QA visual**: cómo verificar el renderizado,
   especialmente las secciones ADAPT

## Notas de robustez

- Si Stitch omite `data-purpose` en alguna sección, **fallback al
  `id`** o **inferencia por orden** (1ra = cover, 2da = quote, etc.).
- Si Stitch no incluye el `<script data-purpose="tailwind-config">`,
  derivar los colores del HTML (grep de hex literales).
- Si el HTML tiene 1 sola variante de color (no 2+), el theme se
  llama igual (ej. "noche" por defecto) y no se genera bloque
  para otras variantes.
- Si el HTML tiene secciones con nombres no listados en la tabla
  de PASO 2, preguntar al usuario antes de mapear.
- Si el `data-purpose` está en un `<div>` en vez de un `<section>`,
  capturar el `<div>` (no requiere `<section>`).
- Si el HTML tiene 1 solo `data-purpose="cover"` o ninguno, las
  secciones se infieren por orden de aparición.

## Archivos de referencia

- `src/features/front/invitations/shared/InvitationPage.tsx` —
  orchestrator genérico (REUSE)
- `src/features/front/invitations/shared/types.ts` — `InvitationConfig`
- `src/features/front/invitations/configs/sofia-xv.config.tsx` —
  referencia de config (XV emerald)
- `src/features/front/invitations/configs/valentina-xv-sapphire.config.tsx` —
  referencia de config (XV sapphire con theme)
- `src/features/front/invitations/sections/` — 13 secciones base
- `src/features/front/components/sections/qr-photos.tsx` — base
  para `qrPhotos` (ADAPT)
- `src/features/front/components/siena/Assistants.tsx` — base para
  `assistants` (ADAPT)
- `src/pages/i/sofia-xv/index.tsx` — referencia de página
