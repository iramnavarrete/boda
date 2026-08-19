/**
 * Barrel público del módulo de invitaciones dinámicas.
 *
 * Importar todo desde aquí mantiene estables los paths de las páginas
 * aunque movamos archivos internos.
 */
export { default as InvitationPage } from "./shared/InvitationPage";
export { default as InvitationMeta } from "./shared/InvitationMeta";
export { default as InvitationFrame } from "./shared/InvitationFrame";
export { getInvitationProps } from "./shared/getInvitationProps";

export type {
  InvitationConfig,
  CoverSectionProps,
  QuoteSectionProps,
  ParentsSectionProps,
  CountDownSectionProps,
  DressCodeSectionProps,
  GallerySectionProps,
  GiftsSectionProps,
  AssistantsSectionProps,
  QrSectionProps,
  FooterSectionProps,
  AudioSectionProps,
  DesktopSidebarsConfig,
  EnvelopeSplashConfig,
} from "./shared/types";
