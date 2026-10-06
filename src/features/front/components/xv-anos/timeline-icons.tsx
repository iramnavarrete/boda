import type * as LucideIconsType from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  // Ceremonia / misa
  Church,
  Cross,
  // Comida / bebida
  Utensils,
  UtensilsCrossed,
  Cake,
  Coffee,
  Wine,
  GlassWater,
  Beer,
  // NOTA: `Champagne` y `Cocktail` NO existen en lucide-react — se
  // omiten intencionalmente. Usa `Wine` para bebidas alcohólicas o
  // `GlassWater` para tragos sin alcohol.
  Pizza,
  Cookie,
  IceCream,
  // Música / audio
  Music,
  Music2,
  Music3,
  Music4,
  Disc3,
  Mic,
  Mic2,
  Headphones,
  Speaker,
  Radio,
  // Celebración
  Sparkles,
  PartyPopper,
  Crown,
  Gift,
  Heart,
  Star,
  Award,
  Trophy,
  Gem,
  Diamond,
  // Personas
  User,
  Users,
  UserPlus,
  Hand,
  HandHeart,
  Handshake,
  // Foto / video
  Camera,
  Image as ImageIcon,
  Video,
  Film as FilmIcon,
  // Tiempo
  Calendar,
  Clock,
  Timer,
  Bell,
  // Naturaleza
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Flower,
  Flower2,
  Cherry,
  Apple,
  Trees,
  Mountain,
  Cloud,
  // Ubicación
  MapPin,
  Map as MapIcon,
  Compass,
  // Otros útiles
  Briefcase,
  Plane,
  Car,
  Ship,
  Rocket,
  Globe,
  Flag,
  Bookmark,
  Martini,
  Sandwich,
  // Default fallback (no remover — es el ícono por defecto)
  Sparkles as DefaultSparkles,
} from "lucide-react";

/**
 * Tipo que acepta CUALQUIER ícono de Lucide.
 *
 * Se deriva con `import type * as LucideIcons` — un import TYPE-only,
 * que TypeScript borra completamente en compilación. Costo runtime:
 * **cero bytes**. El bundle NO incluye lucide-react sólo por importar
 * este tipo.
 *
 * Resultado: el dev puede escribir `icon: "Cake"`, `icon: "Crown"`,
 * `icon: "Drums"` o cualquier otro nombre de ícono de Lucide en su
 * config y el IDE le da autocomplete con los ~2000 íconos disponibles.
 *
 * Tree-shaking: el LITERAL sí entra al bundle SOLO si está en
 * `TIMELINE_ICONS` (abajo). Los íconos fuera del registro hacen
 * fallback a Sparkles + warning en dev (ver `resolveTimelineIcon`).
 */
export type LucideIconName = keyof typeof LucideIconsType;

/**
 * Registro curado de íconos pre-importados para el timeline.
 *
 * Cada ícono se importa con un named import arriba y se agrega al
 * mapa abajo (1 línea). Esto le dice al bundler qué íconos se usan
 * y permite tree-shaking perfecto: el bundle final incluye SOLO los
 * íconos de este registro que efectivamente use alguna invitación.
 *
 * Para agregar un ícono nuevo (ej. "Drums"):
 *   1. Agregar `Drums` al bloque de imports arriba (1 línea)
 *   2. Agregar `Drums` al objeto `TIMELINE_ICONS` abajo (1 línea)
 *   3. Listo — `icon: "Drums"` ya funciona en cualquier config
 */
export const TIMELINE_ICONS = {
  // Ceremonia
  Church,
  Cross,
  // Comida / bebida
  Utensils,
  UtensilsCrossed,
  Cake,
  Coffee,
  Wine,
  GlassWater,
  Beer,
  // NOTA: `Champagne` y `Cocktail` NO existen en lucide-react — se
  // omiten intencionalmente. Usa `Wine` para bebidas alcohólicas o
  // `GlassWater` para tragos sin alcohol.
  Pizza,
  Cookie,
  IceCream,
  // Música / audio
  Music,
  Music2,
  Music3,
  Music4,
  Disc3,
  Mic,
  Mic2,
  Headphones,
  Speaker,
  Radio,
  // Celebración
  Sparkles,
  PartyPopper,
  Crown,
  Gift,
  Heart,
  Star,
  Award,
  Trophy,
  Gem,
  Diamond,
  // Personas
  User,
  Users,
  UserPlus,
  Hand,
  HandHeart,
  Handshake,
  // Foto / video
  Camera,
  ImageIcon,
  Video,
  FilmIcon,
  // Tiempo
  Calendar,
  Clock,
  Timer,
  Bell,
  // Naturaleza
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Flower,
  Flower2,
  Cherry,
  Apple,
  Trees,
  Mountain,
  Cloud,
  // Ubicación
  MapPin,
  MapIcon,
  Compass,
  // Otros
  Briefcase,
  Plane,
  Car,
  Ship,
  Rocket,
  Globe,
  Flag,
  Bookmark,
  Martini,
  Sandwich
} as const satisfies Partial<Record<LucideIconName, LucideIcon>>;

/**
 * Resuelve un nombre de ícono Lucide a su componente.
 *
 * Comportamiento:
 *   - `undefined` → fallback a `Sparkles` (default)
 *   - Nombre en el registro → devuelve el componente
 *   - Nombre NO en el registro (raro, ej. typo) → devuelve `Sparkles`
 *     como fallback visual y emite un `console.warn` en desarrollo
 *     indicando cómo agregar el ícono al registro.
 *
 * En producción el warning se omite (DCE via `process.env.NODE_ENV`).
 */
export function resolveTimelineIcon(
  name: LucideIconName | undefined,
): LucideIcon {
  if (!name) return DefaultSparkles;

  const Icon = TIMELINE_ICONS[name as keyof typeof TIMELINE_ICONS];
  if (Icon) return Icon;

  // Fallback: ícono no registrado. En dev, avisamos al dev con un
  // mensaje accionable para que lo agregue al registro.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[timeline-icons] El ícono "${name}" no está en el registro ` +
        `TIMELINE_ICONS. Agrega "${name}" al import + al objeto en ` +
        `src/features/front/components/xv-anos/timeline-icons.tsx. ` +
        `Mientras tanto se muestra Sparkles como fallback.`,
    );
  }
  return DefaultSparkles;
}