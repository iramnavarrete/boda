import type { ComponentProps, ReactNode } from "react";
import type EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import type Cover from "@/features/front/components/siena/cover";
import type Quote from "@/features/front/components/sections/quote";
import type ParentsGodFathers from "@/features/front/components/siena/parents";
import type CountDown from "@/features/front/components/siena/countdown";
import type CeremonyToast from "@/features/front/components/siena/ceremony-toast";
import type Gallery from "@/features/front/components/siena/gallery";
import type GiftsTable from "@/features/front/components/siena/gifts-table";
import type Assistants from "@/features/front/components/siena/Assistants";
import type QrPhotos from "@/features/front/components/sections/qr-photos";
import type Footer from "@/features/front/components/sections/footer";
import type { AudioController } from "@/features/front/components/sections/music";
import type DesktopSidebars from "@/features/shared/components/DesktopSidebars";
import type {
  AccommodationConfig,
  AccommodationStyleConfig,
} from "@/features/front/components/siena/AccomodationSection";
import type {
  GraphicTimelineItem,
  TimelineStyleConfig,
} from "@/features/front/components/siena/EditorialTimeline";

/**
 * Configuración del sello de apertura (EnvelopeSplash).
 * Reutiliza los props originales del componente.
 */
export type EnvelopeSplashConfig = ComponentProps<typeof EnvelopeSplash>;

/**
 * Personalización de las hojas laterales del desktop.
 */
export type DesktopSidebarsConfig = Pick<
  ComponentProps<typeof DesktopSidebars>,
  "flowersClassName" | "textClassName"
>;

/**
 * Props de cada sección. Cada uno reusa los tipos del componente original
 * para evitar acoplar la config a un shape propio.
 */
export type CoverSectionProps = ComponentProps<typeof Cover>;
export type QuoteSectionProps = ComponentProps<typeof Quote>;
export type ParentsSectionProps = ComponentProps<typeof ParentsGodFathers>;
export type CountDownSectionProps = ComponentProps<typeof CountDown>;
export type DressCodeSectionProps = ComponentProps<typeof CeremonyToast>;
export type GallerySectionProps = ComponentProps<typeof Gallery>;
export type GiftsSectionProps = ComponentProps<typeof GiftsTable>;
export type AssistantsSectionProps = ComponentProps<typeof Assistants>;
export type QrSectionProps = ComponentProps<typeof QrPhotos>;
export type FooterSectionProps = ComponentProps<typeof Footer>;
export type AudioSectionProps = ComponentProps<typeof AudioController>;

/**
 * Sub-sección: Hospedaje. Vive como slot top-level, fuera de `dressCode`.
 * Si está presente, se inyecta dentro de `CeremonyToast` preservando el
 * layout actual; si no, no se renderiza nada.
 */
export interface AccommodationSectionConfig {
  config: AccommodationConfig;
  styles?: AccommodationStyleConfig;
}

/**
 * Sub-sección: Timeline / Itinerario. Vive como slot top-level, fuera
 * de `dressCode`.
 */
export interface TimelineSectionConfig {
  items: GraphicTimelineItem[];
  title?: string;
  subtitle?: string;
  styles?: TimelineStyleConfig;
  accentColor?: string;
}

/**
 * Forma final de la config de una invitación. Cada invitación exporta un
 * objeto con esta forma y la página solo la pasa al `InvitationPage`.
 *
 * Cualquier sección puede ser `null`/omitida para no renderizarla.
 */
export interface InvitationConfig {
  /** Slug usado como fallback en SSR (debe coincidir con la carpeta en /i). */
  slug: string;

  /** Sello del sobre de apertura (logo, color, iniciales...). */
  sealConfig: EnvelopeSplashConfig["sealConfig"];

  /** Estilos de las hojas laterales del desktop (color flores, color texto). */
  sidebars: DesktopSidebarsConfig;

  /** Clases opcionales del contenedor principal (envoltura del contenido). */
  contentWrapperClassName?: string;

  /** Contenido central de la invitación, en orden. */
  sections: {
    cover: CoverSectionProps;
    quote: QuoteSectionProps;
    parents: ParentsSectionProps;
    countDown: CountDownSectionProps;
    dressCode: DressCodeSectionProps;
    gallery: GallerySectionProps;
    gifts: GiftsSectionProps | null;
    assistants: AssistantsSectionProps | null;
    qrPhotos: QrSectionProps | null;
    footer: FooterSectionProps;
    audio: AudioSectionProps;
  };

  /**
   * Sub-secciones independientes que se renderizan dentro de
   * `DressCodeSection` (CeremonyToast) preservando el layout actual.
   * Cada una tiene su propia config tipada.
   */
  accommodation?: AccommodationSectionConfig;
  timeline?: TimelineSectionConfig;

  /** Permite inyectar nodos extra (raro, pero útil para overrides). */
  extraHead?: ReactNode;
}
