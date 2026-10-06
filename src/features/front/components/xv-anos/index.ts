/**
 * Barrel público del módulo XV Años (Emerald & Gold Luxury).
 *
 * Diseño paralelo al módulo `siena`: componentes autocontenidos,
 * animaciones de entrada vía Framer Motion, sincronizados con
 * `useMusicStore` global (botón flotante + SongPlayerSection) y
 * `useInvitationStore` (cover/footer).
 *
 * Composición (secciones):
 *  1.  XvCover            — hero con monograma + carrusel + CTA scroll
 *  2.  WelcomeQuote       — frase inicial
 *  3.  BlessingParents    — papás + padrinos (card emerald)
 *  4.  CountDownBox       — 4 cuadros dorados + botón agendar
 *  5.  ParallaxTransition — bosque encantado con parallax vertical
 *  6.  VenueSection       — lugar + Maps + Waze
 *  7.  VerticalTimeline   — itinerario vertical con línea dorada
 *  8.  DressCodeSection   — Formal/Elegante + colores reservados
 *  9.  SongSuggestionsSection — playlist colaborativa
 *  10. WhatsAppRSVP       — card dark + CTA WhatsApp + deadline
 *  11. CashGiftCard       — Lluvia de Sobres + datos bancarios
 *
 * + FloatingMusicButton (widget fijo, sincronizado con el store).
 * + Card base reutilizable (EmeraldCard / GoldCornerFrame).
 */
export { default as XvCover } from "./Cover";
export { default as FloatingMusicButton } from "./FloatingMusicButton";
export { default as WelcomeQuote } from "./WelcomeQuote";
export { default as BlessingParents } from "./BlessingParents";
export { default as CountDownBox } from "./CountDownBox";
export { default as ParallaxTransition } from "./ParallaxTransition";
export { default as VenueSection } from "./VenueSection";
export { default as VerticalTimeline } from "./VerticalTimeline";
export { default as XvAssitants } from "./XvAssitants";
export { default as XvGallery } from "./XvGallery";
export { default as SongSuggestionsSection } from "./SongSuggestionsSection";
export {
  defaultFamily,
  isDefaultId,
  useFamilyRSVP,
} from "@/features/front/hooks/useFamilyRSVP";
export type { TimelineItem } from "./VerticalTimeline";
export { default as DressCodeSection } from "./DressCodeSection";
export { default as SongPlayerSection } from "./SongPlayerSection";
export { default as WhatsAppRSVP } from "./WhatsAppRSVP";
export { default as CashGiftCard } from "./CashGiftCard";
export { default as TransferAccordion } from "./TransferAccordion";

// Shared utilities
export { EmeraldCard, GoldCornerFrame } from "./Card";