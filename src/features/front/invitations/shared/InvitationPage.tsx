import type { Invitation } from "@/types";

import InvitationMeta from "./InvitationMeta";
import InvitationFrame from "./InvitationFrame";

import CoverSection from "../sections/CoverSection";
import QuoteSection from "../sections/QuoteSection";
import ParentsSection from "../sections/ParentsSection";
import CountDownSection from "../sections/CountDownSection";
import DressCodeSection from "../sections/DressCodeSection";
import GallerySection from "../sections/GallerySection";
import GiftsSection from "../sections/GiftsSection";
import AssistantsSection from "../sections/AssistantsSection";
import QrSection from "../sections/QrSection";
import FooterSection from "../sections/FooterSection";
import AudioSection from "../sections/AudioSection";
import AccommodationSection from "../sections/AccommodationSection";
import TimelineSection from "../sections/TimelineSection";

import type { InvitationConfig } from "./types";

interface InvitationPageProps {
  invitationData: Invitation & { eventUrl: string };
  config: InvitationConfig;
}

/**
 * Página genérica de invitación.
 *
 * Composición:
 *  1. `InvitationMeta`        → Head/SEO
 *  2. `InvitationFrame`       → Layout + estado de apertura del sello
 *     ├── CoverSection        (isSealVisible sincronizado con el sobre)
 *     ├── QuoteSection
 *     ├── ParentsSection
 *     ├── CountDownSection
 *     ├── DressCodeSection    (con slots de accommodation + timeline)
 *     ├── GallerySection
 *     ├── GiftsSection        (opcional)
 *     ├── AssistantsSection   (opcional)
 *     ├── QrSection           (opcional)
 *     ├── FooterSection
 *     └── AudioSection
 *
 * Hospedaje y timeline se construyen aquí desde sus slots top-level y
 * se inyectan en `DressCodeSection` (que los pasa al `CeremonyToast`).
 * Así, la config de cada invitación mantiene accommodation y timeline
 * como bloques independientes, no anidados en dressCode.
 *
 * Las páginas individuales (`/i/<slug>/index.tsx`) solo pasan
 * `invitationData` (del SSR) y el `config` correspondiente.
 */
export default function InvitationPage({
  invitationData,
  config,
}: InvitationPageProps) {
  const {
    sections,
    sealConfig,
    sidebars,
    contentWrapperClassName,
    extraHead,
    accommodation,
    timeline,
    metaDescription
  } = config;

  return (
    <>
      <InvitationMeta
        invitationData={invitationData}
        description={metaDescription}
      >
        {extraHead}
      </InvitationMeta>

      <InvitationFrame
        invitationData={invitationData}
        sealConfig={sealConfig}
        sidebars={sidebars}
        contentWrapperClassName={contentWrapperClassName}
      >
        {({ isEnvelopeOpened }) => (
          <>
            <CoverSection {...sections.cover} isSealVisible={!isEnvelopeOpened} />
            <QuoteSection {...sections.quote} />
            <ParentsSection {...sections.parents} />
            <CountDownSection {...sections.countDown} />
            <DressCodeSection
              {...sections.dressCode}
              accommodationSlot={
                accommodation ? (
                  <AccommodationSection
                    config={accommodation.config}
                    styles={accommodation.styles}
                  />
                ) : undefined
              }
              timelineSlot={
                timeline ? <TimelineSection {...timeline} /> : undefined
              }
            />
            <GallerySection {...sections.gallery} />
            {sections.gifts && <GiftsSection {...sections.gifts} />}
            {sections.assistants && (
              <AssistantsSection {...sections.assistants} />
            )}
            {sections.qrPhotos && <QrSection {...sections.qrPhotos} />}
            <FooterSection {...sections.footer} />
            <AudioSection {...sections.audio} />
          </>
        )}
      </InvitationFrame>
    </>
  );
}
