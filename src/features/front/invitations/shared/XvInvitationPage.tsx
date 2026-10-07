"use client";

import { useEffect, useState } from "react";
import useMusicStore from "@/stores/musicStore";
import { AudioController } from "@/features/front/components/sections/music";
import InvitationMeta from "@/features/front/invitations/shared/InvitationMeta";
import FrontLayout from "@/features/shared/layouts/front";
import { FamilyProvider } from "@/features/front/components/FamilyContext";
import EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { useInvitationViewTracking } from "@/features/front/hooks/useInvitationViewTracking";
import type { Invitation } from "@/types";
import type { FontInstance, FontKey } from "@/features/shared/fonts";
import { getFontsByKey } from "@/features/shared/fonts";
import type { LucideIconName } from "@/features/front/components/xv-anos/timeline-icons";

import {
  XvCover,
  FloatingMusicButton,
  WelcomeQuote,
  BlessingParents,
  CountDownBox,
  ParallaxTransition,
  VenueSection,
  VerticalTimeline,
  XvGallery,
  XvAssitants,
  DressCodeSection,
  SongSuggestionsSection,
  WhatsAppRSVP,
  CashGiftCard,
} from "@/features/front/components/xv-anos";
import Footer from "@/features/front/components/sections/footer";
import QrPhotos from "@/features/front/components/sections/qr-photos";

import type { EnvelopeSplashConfig, FooterSectionProps } from "./types";

export interface XvSectionConfig {
  monograma: string;
  /** Imagen hero del cover (UNA sola, con parallax). */
  coverImage: string;
  /**
   * Classes extra para la `<Image>` del cover (e.g. `object-[48%]`
   * para ajustar el recorte de `object-position` por invitación).
   * Si se omite, el default `object-cover object-center` aplica.
   */
  imageClassName?: string;
  /** Subtítulo sobre el nombre. Default: "MIS XV AÑOS". */
  preTitle?: string;

  welcome: {
    emblem?: string;
    preTitle?: string;
    heading: string;
    quote: string;
    closingLine?: string;
  };

  blessing: {
    preTitle?: string;
    parentsHeading: string;
    padre: string;
    madre: string;
    godparentsHeading: string;
    godparentsSubtitle?: string;
    padrino1: string;
    padrino2: string;
  };

  countdown: {
    targetDate: string;
    heading?: string;
    calendarUrl?: string;
  };

  parallax: {
    imageUrl: string;
    emblem?: string;
    quote: string;
    caption?: string;
  };

  venue: {
    preTitle?: string;
    heading?: string;
    /** Texto del badge de la card de recepción. Default: "Recepción y fiesta". */
    receptionBadgeText?: string;
    /** Datos de la recepción (siempre se renderiza). */
    venueImage: string;
    venueName: string;
    address: string;
    description?: string;
    eventTime?: string;
    googleMapsUrl: string;
    wazeUrl: string;
    /**
     * Ceremonia opcional — si está presente, se renderiza una
     * SEGUNDA card idéntica a la de recepción (mismo layout, icono
     * de iglesia, badge "Ceremonia religiosa"). Si se omite, sólo
     * aparece la card de recepción.
     */
    ceremony?: {
      venueImage: string;
      venueName: string;
      address: string;
      eventTime?: string;
      googleMapsUrl: string;
      /** Default: "Ceremonia religiosa". */
      badgeText?: string;
    };
  };

  timeline: {
    items: Array<{
      time: string;
      title: string;
      subtitle?: string;
      description?: string;
      /**
       * Ícono Lucide. El tipo acepta CUALQUIER nombre de ícono
       * (autocompletado con ~2000 opciones en el IDE). Sólo los
       * íconos del registro `TIMELINE_ICONS` entran al bundle;
       * los demás caen a `Sparkles` + warning en dev. Para agregar
       * uno nuevo: ver `xv-anos/timeline-icons.tsx`.
       */
      icon?: LucideIconName;
    }>;
    preTitle?: string;
    heading?: string;
  };

  dressCode: {
    preTitle?: string;
    heading?: string;
    description?: string;
    reservedColorsPreTitle?: string;
    reservedColorsDescription?: string;
    respectfulNote?: string;
    colorPalette?: Array<{ hex: string; name: string }>;
    colorPaletteColumns?: 3 | 4 | 5 | 6;
  };

  /**
   * Comportamiento de la sección "Sugerencias de canciones".
   *
   * - Si `useDefaultRepertoire === true` (default, retro-compat): los
   *   visitantes anónimos ven un repertorio de muestra mientras no
   *   haya canciones en Firestore. Útil para invitaciones en preview
   *   que aún no tienen canciones reales.
   * - Si `useDefaultRepertoire === false`: la lista SIEMPRE arranca
   *   vacía y se llena únicamente desde Firestore (invitados con
   *   `?family=`) o desde lo que el usuario agregue localmente
   *   (anónimos). Recomendado para invitaciones reales: no muestra
   *   canciones fantasma.
   */
  songs?: {
    useDefaultRepertoire?: boolean;
  };

  gallery?: {
    preTitle?: string;
    heading?: string;
    emblem?: string;
    customText?: string;
    slides: Array<{
      src: string;
      thumb?: string;
      alt: string;
      width?: number;
      height?: number;
      objectPosition?: string;
      /** Badge top-right (ej. "01 / 04"). Si se omite, se autocalcula. */
      badge?: string;
      /** Caption italic inferior (ej. "Un sueño hecho realidad"). */
      caption?: string;
      /** Subcaption tracking-widest debajo del caption. */
      subcaption?: string;
    }>;
  };

  rsvp: {
    phone: string;
    message: string;
    deadline?: string;
    preTitle?: string;
    heading?: string;
    outerDescription?: string;
    innerTitle?: string;
    innerDescription?: string;
    ctaLabel?: string;
  };

  /**
   * Modo de confirmación de asistencia:
   *  - `"form"` (default): formulario con gestión de invitados
   *    (`<XvAssitants />`). Los datos del invitado se hidratan desde
   *    Firestore vía el param `?family=` de la URL.
   *  - `"whatsapp"`: confirmación por WhatsApp (`<WhatsAppRSVP />`).
   *    Usar este modo en invitaciones SIN gestión de invitados por
   *    familia (ej. invitaciones públicas sin link personalizado).
   *
   * En modo `"form"`, el bloque `rsvp` se ignora — el formulario
   * toma título, deadline y datos del store. En modo `"whatsapp"`,
   * el bloque `rsvp` provee el `phone`/`message`/etc.
   */
  rsvpMode?: "form" | "whatsapp";

  gifts: {
    description: string;
    transfer?: {
      bank: string;
      beneficiary: string;
      /** Número de tarjeta (16 dígitos). Antes `clabe` (CLABE interbancaria). */
      cardNumber: string;
    };
  };

  footer: FooterSectionProps;

  /**
   * Sección QR de fotos del evento (compartida con bodas).
   * Si está presente, se renderiza DESPUÉS del RSVP. Si se omite,
   * la sección no aparece (backward-compat con configs existentes).
   */
  qrPhotos?: {
    urlPhotos?: string;
  };
}

export interface XvInvitationConfig {
  slug: string;
  /** Theme de la invitación. Default: "emerald".
   *  Cambia el `data-xv-theme` del wrapper, lo que swapea toda la
   *  paleta via CSS variables — sin tocar componentes. */
  theme?: "emerald" | "sapphire";
  sealConfig: EnvelopeSplashConfig["sealConfig"];
  /** Sin sidebars en XV — se conserva el campo en el tipo por compatibilidad,
   *  pero el frame ya no lo renderiza. */
  sidebars?: never;
  contentWrapperClassName?: string;
  metaDescription?: string;
  /**
   * URL del favicon para esta invitación XV.
   * Si se omite, el frame usa el default por theme:
   *   `/favicons/xv/gold.ico` (emerald) o `/favicons/xv/sapphire.ico`.
   * Los .ico ya están commiteados en `public/favicons/xv/`.
   */
  favicon?: string;
  /** Fonts declarativas (mismo contrato que bodas) — se resuelven a
   *  `FontInstance[]` en el `XvInvitationPage` antes de pasar al
   *  frame, así el frame nunca toca `getFontsByKey`. */
  fonts?: FontKey[];
  /** Colores opcionales para recolorear el Lottie del sobre. */
  envelopeColors?: EnvelopeSplashConfig["envelopeColors"];
  sections: XvSectionConfig;
  audio: {
    musicPath: string;
    fadeMs?: number;
    mediaMetadata?: MediaMetadataInit;
  };
}

interface XvInvitationPageProps {
  invitationData: Invitation & { eventUrl: string };
  config: XvInvitationConfig;
}

/**
 * Page orquestadora de la invitación XV Años.
 */
export default function XvInvitationPage({
  invitationData,
  config,
}: XvInvitationPageProps) {
  // Resolver las `FontKey[]` declarativas a `FontInstance[]` aquí —
  // mismo patrón que `InvitationPage.tsx:73` de las bodas. El frame
  // sólo recibe instancias ya materializadas.
  const additionalFonts = config.fonts
    ? getFontsByKey(config.fonts)
    : undefined;

  return (
    <XvInvitationFrame
      invitationData={invitationData}
      theme={config.theme}
      sealConfig={config.sealConfig}
      contentWrapperClassName={config.contentWrapperClassName}
      additionalFonts={additionalFonts}
      config={config}
    />
  );
}

interface XvInvitationFrameProps {
  invitationData: Invitation & { eventUrl: string };
  theme?: "emerald" | "sapphire";
  sealConfig: EnvelopeSplashConfig["sealConfig"];
  contentWrapperClassName?: string;
  additionalFonts?: FontInstance[];
  config: XvInvitationConfig;
}

function XvInvitationFrame({
  invitationData,
  theme = "emerald",
  sealConfig,
  contentWrapperClassName,
  additionalFonts,
  config,
}: XvInvitationFrameProps) {
  // Audio: lo dispara `EnvelopeSplash.onOpen` directamente (sin setTimeout
  // — el setTimeout de 5ms que tenía rompía la animación del Lottie).
  const { toggleAudio } = useMusicStore();

  // Estado: aparece 2.6s DESPUÉS del click en el sello (cuando el sobre
  // ya desapareció + 200ms de margen). Lo activamos desde `onOpen` con
  // un setTimeout de 2600ms. NO usamos CSS animationDelay desde el
  // mount — eso hace que el botón aparezca desde la carga de la página,
  // no desde el click.
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  useEffect(() => {
    if (!invitationData) return;
    useInvitationStore.setState({ invitationData });
  }, [invitationData]);


  const finalSealConfig = (() => {
    if (!sealConfig) return undefined;
    if (sealConfig.customSvg) return sealConfig;
    if (sealConfig.initials) return sealConfig;
    const eventName = invitationData?.nombre ?? "";
    const initials = eventName
      .split(" ")
      .map((s: string) => s.substring(0, 1))
      .join(" ")
      .slice(0, 2)
      .toUpperCase();
    return { ...sealConfig, initials };
  })();

  // Favicon: la config puede setear uno explícito, o usamos el default
  // por theme (`/favicons/xv/gold.ico` o `/favicons/xv/sapphire.ico`).
  const defaultFavicon = `/favicons/xv/${theme === "sapphire" ? "sapphire" : "gold"}.ico`;
  const faviconUrl = config.favicon ?? defaultFavicon;

  return (
    <>
      <InvitationMeta
        invitationData={invitationData}
        description={config.metaDescription}
        faviconUrl={faviconUrl}
      />
      <FrontLayout additionalFonts={additionalFonts}>
        <FamilyProvider>
        <EnvelopeSplash
          onOpen={() => {
            // Audio: directo (sin setTimeout — eso rompía el Lottie).
            toggleAudio();
            // Botón de música: aparece 2.6s después del click
            // (2400ms del sobre + 200ms de margen).
            setTimeout(() => setIsEnvelopeOpened(true), 2600);
          }}
          sealConfig={finalSealConfig}
          envelopeColors={config.envelopeColors}
        />

        {/* Botón flotante de música — solo visible 2.6s después del
            click en el sello. Conditional render (no CSS animationDelay)
            para que NO se muestre desde la carga de la página. */}
        {isEnvelopeOpened && (
          <aside
            className="fixed bottom-4 left-4 z-[60]"
            data-purpose="xv-floating-audio"
          >
            <FloatingMusicButton />
          </aside>
        )}

        <div style={{ overflow: "hidden" }}>
          <div
            data-xv-theme={theme}
            className={
              "w-full flex flex-col items-center overflow-hidden " +
              (contentWrapperClassName ?? "bg-xv-bg-deepest")
            }
          >
            {/* XV: SIN DesktopSidebars. Contenedor centrado y responsivo
                para preservar el feel "phone-frame" en mobile y aprovechar
                mejor la pantalla en tablet/desktop sin perder la esencia. */}
            <div className="w-full max-w-[500px] md:max-w-[640px] 2xl:max-w-[760px] mx-auto relative">
              <XvBody
                config={config}
                invitationData={invitationData}
                isEnvelopeOpened={isEnvelopeOpened}
              />
            </div>
          </div>
        </div>
      </FamilyProvider>
    </FrontLayout>
    </>
  );
}

/**
 * Convierte "HH:mm" → "HH:mm HRS". Idempotente: si ya tiene "HRS",
 * lo devuelve tal cual. Los configs XV usan el formato "20:30 HRS";
 * Firestore guarda la hora cruda ("20:30"); este helper las
 * normaliza para que `VenueSection.eventTime` siempre vea el mismo
 * shape.
 */
function formatHoraWithHRS(hora: string | undefined): string | undefined {
  if (!hora) return undefined;
  return hora.includes("HRS") ? hora : `${hora} HRS`;
}

/**
 * Mergea los datos dinámicos de `invitationData` (Firestore) sobre
 * `sections` (config) — los componentes XV siguen siendo 100%
 * props-based, sólo el orquestador conoce el store.
 *
 * Estrategia: Firestore es fuente de verdad en defaults; config aporta
 * defaults visuales. Si un campo está en ambos, Firestore gana. Si un
 * campo dinámico está sólo en el config, se usa el config (resiliencia
 * mientras el admin no haya guardado cambios).
 *
 * Campos que se MERGEAN (Firestore con fallback a config):
 *   - `cover.monograma` ← `quinceanera.monograma`
 *   - `blessing.padre` / `madre` ← `padresQuinceanera.papa` / `mama`
 *   - `blessing.padrino1` / `padrino2` ← `padrinos.nombre1` / `nombre2`
 *   - `countdown.targetDate` ← `fechaISO`
 *   - `venue.*` (recepción) ← `recepcion.{nombreSalon,direccion,hora,enlaceMaps}`
 *   - `venue.ceremony.*` ← `ceremonia.{nombreTemplo,direccion,hora,enlaceMaps}`
 *
 * Campos que quedan 100% del config (no dinámicos):
 *   - `cover.coverImage`, `cover.preTitle`
 *   - `welcome.*` (copy editorial)
 *   - `parallax.*` (imagen + copy)
 *   - `timeline.*` (itinerario curado)
 *   - `dressCode.*` (paleta de colores reservados)
 *   - `gallery.*` (assets visuales)
 *   - `gifts.*`, `rsvp.*`, `footer.*`, `qrPhotos.*`
 *
 * Reglas especiales para `venue.ceremony`:
 *   - Si Firestore tiene ceremonia → se muestra con datos de Firestore,
 *     tomando `venueImage` y `badgeText` del config si existen.
 *   - Si Firestore NO tiene ceremonia pero el config tiene bloque
 *     ceremony → se muestra el bloque del config (fallback).
 *   - Si ninguno tiene ceremonia → no se renderiza la card (la sección
 *     ceremonia es opcional, según lo decidido en el form admin).
 */
function mergeInvitationData(
  sections: XvSectionConfig,
  data: Invitation | null | undefined,
): XvSectionConfig {
  if (!data) return sections;

  // ─── Monograma (cover) ─────────────────────────────────────────────
  const monograma = data.quinceanera?.monograma || sections.monograma;

  // ─── Blessing (padres + padrinos) ──────────────────────────────────
  const blessing = {
    ...sections.blessing,
    padre: data.padresQuinceanera?.papa || sections.blessing.padre,
    madre: data.padresQuinceanera?.mama || sections.blessing.madre,
    padrino1: data.padrinos?.nombre1 || sections.blessing.padrino1,
    padrino2: data.padrinos?.nombre2 || sections.blessing.padrino2,
  };

  // ─── Countdown (fecha) ─────────────────────────────────────────────
  const countdown = {
    ...sections.countdown,
    targetDate: data.fechaISO || sections.countdown.targetDate,
  };

  // ─── Venue (recepción) ─────────────────────────────────────────────
  const venue = {
    ...sections.venue,
    venueName: data.recepcion?.nombreSalon || sections.venue.venueName,
    address: data.recepcion?.direccion || sections.venue.address,
    eventTime:
      formatHoraWithHRS(data.recepcion?.hora) || sections.venue.eventTime,
    googleMapsUrl:
      data.recepcion?.enlaceMaps || sections.venue.googleMapsUrl,
  };

  // ─── Venue (ceremonia opcional) ────────────────────────────────────
  // Lógica (más estricta que la versión anterior — Firestore es la
  // ÚNICA fuente de verdad):
  //   1. Si Firestore tiene ceremonia → armar card con datos de
  //      Firestore + `venueImage` del config (sólo visual).
  //   2. Si Firestore NO tiene ceremonia → NO se renderiza card,
  //      aunque el config tenga bloque `ceremony`. Esto evita que un
  //      config clonado de otra invitación muestre misa fantasma.
  let ceremony: XvSectionConfig["venue"]["ceremony"];

  if (data.ceremonia && (data.ceremonia.nombreTemplo || data.ceremonia.direccion || data.ceremonia.hora)) {
    // Caso 1: Firestore tiene ceremonia → mergear con config sólo
    // para el visual `venueImage` (defaults razonables si el admin no
    // subió una imagen específica para la iglesia).
    ceremony = {
      venueImage:
        sections.venue.ceremony?.venueImage ||
        sections.venue.venueImage ||
        "/img/salon/quinta-la-isla.jpg",
      venueName: data.ceremonia.nombreTemplo || "",
      address: data.ceremonia.direccion || "",
      eventTime: formatHoraWithHRS(data.ceremonia.hora),
      googleMapsUrl: data.ceremonia.enlaceMaps || "",
      badgeText: sections.venue.ceremony?.badgeText,
    };
  } else {
    // Caso 2: Firestore vacío → NO card. Aunque venga por config,
    // ignoramos el bloque `ceremony` del config — Firestore manda.
    ceremony = undefined;
  }

  return {
    ...sections,
    monograma,
    blessing,
    countdown,
    venue: {
      ...venue,
      ceremony,
    },
  };
}

function XvBody({
  config,
  invitationData,
  isEnvelopeOpened,
}: {
  config: XvInvitationConfig;
  invitationData: Invitation & { eventUrl: string };
  isEnvelopeOpened: boolean;
}) {
  const { audio } = config;

  // Registro de vista al abrir el sobre (mismo hook que bodas).
  // El hook debe estar dentro de <FamilyProvider> para que
  // useFamilyContext retorne la familia real (no el default no-op).
  // Loguea en activity + marca invitacionVista en el doc de la
  // familia, salvo si es preview (query param ?preview=...).
  useInvitationViewTracking({
    enabled: isEnvelopeOpened,
    invitationId: invitationData?.id ?? null,
  });
  /**
   * Mergea `invitationData` (Firestore) sobre `config.sections`.
   *
   * Regla: Firestore es la fuente de verdad para los datos dinámicos
   * (padres, padrinos, fecha, direcciones, horas); el config aporta
   * defaults visuales (imágenes, copy editorial, theme). Si un campo
   * está en ambos, Firestore gana. Si sólo está en el config, se usa
   * el config (resiliencia si el admin aún no ha guardado cambios).
   *
   * Esto le da al admin el poder de editar padres/padrinos/fecha/
   * ceremonia/recepción desde el panel sin redeployar.
   */
  const s = mergeInvitationData(config.sections, invitationData);

  return (
    <>
      {/* Cover: SIEMPRE montado (no se desmonta). La imagen tiene
          parallax continuo y el texto/decoraciones animan SOLO cuando
          `isEnvelopeOpened === true` (atado al evento del sobre). */}
      <XvCover
        coverImage={s.coverImage}
        imageClassName={s.imageClassName}
        monograma={s.monograma}
        preTitle={s.preTitle}
        animateOn={isEnvelopeOpened}
      />
      <WelcomeQuote {...s.welcome} />

      <BlessingParents {...s.blessing} />

      <CountDownBox
        targetDate={s.countdown.targetDate}
        heading={s.countdown.heading}
        calendarUrl={s.countdown.calendarUrl}
      />

      <ParallaxTransition {...s.parallax} />

      <VenueSection
        preTitle={s.venue.preTitle}
        heading={s.venue.heading}
        receptionBadgeText={s.venue.receptionBadgeText}
        venueImage={s.venue.venueImage}
        venueName={s.venue.venueName}
        address={s.venue.address}
        eventTime={s.venue.eventTime}
        googleMapsUrl={s.venue.googleMapsUrl}
        ceremony={s.venue.ceremony}
      />

      <VerticalTimeline {...s.timeline} />

      <DressCodeSection {...s.dressCode} />

      {s.gallery && s.gallery.slides.length > 0 && <XvGallery {...s.gallery} />}

      <SongSuggestionsSection useDefaultRepertoire={s.songs?.useDefaultRepertoire} />

      <CashGiftCard
        description={s.gifts.description}
        transfer={s.gifts.transfer}
      />

      {/*
          RSVP: dos modos soportados.
          - Default ("form") → <XvAssitants />: formulario con gestión
            de invitados por familia (lee `?family=` de la URL).
          - "whatsapp" → <WhatsAppRSVP />: para invitaciones SIN gestión
            de invitados (públicas). Usa el bloque `rsvp` del config
            (phone, message, deadline, etc.).
        */}
      {s.rsvpMode === "whatsapp" ? (
        <WhatsAppRSVP {...s.rsvp} />
      ) : (
        <XvAssitants />
      )}

      {/* QR de fotos del evento — mismo componente de bodas pero con
          variant="xv" (fondo + tipografía del tema). Aparece DESPUÉS
          del RSVP, justo antes del footer. Si `qrPhotos` no está en
          el config, no se renderiza (backward-compat). */}
      {s.qrPhotos && <QrPhotos variant="xv" urlPhotos={s.qrPhotos.urlPhotos} />}

      <Footer variant="xv" />

      <AudioController
        musicPath={audio.musicPath}
        fadeMs={audio.fadeMs ?? 1000}
        mediaMetadata={audio.mediaMetadata}
      />
    </>
  );
}
