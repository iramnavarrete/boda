"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Church, MapPin } from "lucide-react";

/* ============================================================================
 * Datos de UNA card de venue. Compartido por la card de recepción (siempre
 * presente) y la card de ceremonia (opcional, misma imagen si no se
 * proporciona `venueImage`).
 * ========================================================================== */
export interface VenueCardData {
  /** URL de la imagen del venue. */
  venueImage: string;
  /** Nombre del venue (ej. "Quinta Real Aguascalientes"). */
  venueName: string;
  /** Dirección completa. */
  address: string;
  /** Hora del evento (ej. "17:00 HRS"). */
  eventTime?: string;
  /** URL absoluta Google Maps. */
  googleMapsUrl: string;
  /** Texto del badge flotante. Default depende de `type`. */
  badgeText?: string;
}

interface Props {
  /** Pretítulo de la SECCIÓN (compartido por ceremony + reception). */
  preTitle?: string;
  /** Heading de la SECCIÓN (compartido). */
  heading?: string;
  /** Datos de la recepción (siempre se renderiza). */
  venueImage: string;
  venueName: string;
  address: string;
  eventTime?: string;
  googleMapsUrl: string;
  /** Texto del badge de la card de recepción. Default: "Recepción y fiesta". */
  receptionBadgeText?: string;
  /**
   * Datos opcionales de la ceremonia — cuando se pasa, se renderiza
   * una SEGUNDA card idéntica a la de recepción pero con icono de
   * iglesia + badge "Ceremonia religiosa" (configurable).
   */
  ceremony?: VenueCardData & {
    /** Default: "Ceremonia religiosa". */
    badgeText?: string;
  };
}

/**
 * VenueSection — SECCIÓN con UNA o DOS cards idénticas:
 *   1. (opcional) Ceremonia — si se pasa `ceremony`
 *   2. Recepción — siempre
 *
 * Layout por card (basado en la referencia):
 *   1. Imagen del venue + GRADIENT OVERLAY (sibling, encima)
 *   2. Badge flotante ("Ceremonia religiosa" / "Recepción y fiesta")
 *   3. Icono circular + heading blanco
 *   4. Dirección blanca
 *   5. Botón "HORA" centrado
 *   6. Botón "VER UBICACIÓN" filled
 *
 * DRY: la card única vive en `<VenueCard />` y se reusa para
 * ceremonia + recepción. Theme-aware via tokens semánticos.
 */
export default function VenueSection({
  preTitle = "El Escenario",
  heading = "Un Lugar de Encanto",
  venueImage,
  venueName,
  address,
  eventTime,
  googleMapsUrl,
  receptionBadgeText = "Recepción y fiesta",
  ceremony,
}: Props) {
  return (
    <section className="px-6 py-8" aria-labelledby="venue-heading">
      {/* Header compartido por las dos cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold block mb-1">
          {preTitle}
        </span>
        <h2
          id="venue-heading"
          className="font-cormorant text-3xl sm:text-4xl text-white"
        >
          {heading}
        </h2>
      </motion.div>

      {/* Ceremonia (opcional) — se renderiza ANTES de la recepción */}
      {ceremony && (
        <div className="mb-6">
          <VenueCard
            type="ceremony"
            venueImage={ceremony.venueImage}
            venueName={ceremony.venueName}
            address={ceremony.address}
            eventTime={ceremony.eventTime}
            googleMapsUrl={ceremony.googleMapsUrl}
            badgeText={ceremony.badgeText ?? "Ceremonia religiosa"}
          />
        </div>
      )}

      {/* Recepción — siempre presente */}
      <VenueCard
        type="reception"
        venueImage={venueImage}
        venueName={venueName}
        address={address}
        eventTime={eventTime}
        googleMapsUrl={googleMapsUrl}
        badgeText={receptionBadgeText}
      />
    </section>
  );
}

/* ============================================================================
 * <VenueCard /> — UNA card individual. Usada por Ceremony (church icon)
 * y Reception (location pin icon). DRY: cero duplicación de layout.
 * ========================================================================== */
function VenueCard({
  type,
  venueImage,
  venueName,
  address,
  eventTime,
  googleMapsUrl,
  badgeText,
}: {
  type: "ceremony" | "reception";
} & Required<Pick<VenueCardData, "venueImage" | "venueName" | "address" | "googleMapsUrl">> &
  Pick<VenueCardData, "eventTime" | "badgeText">) {
  const isCeremony = type === "ceremony";
  const Icon = isCeremony ? Church : MapPin;

  return (
    <div className="relative max-w-md mx-auto">
      <div
        className="rounded-3xl shadow-xl overflow-hidden backdrop-blur-md bg-xv-bg-card-from"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--xv-bg-card-from) 0%, var(--xv-bg-card-to) 100%)",
        }}
      >
        {/* Header: imagen + gradient + badge (siblings, no anidados) */}
        <div className="relative w-full h-56 sm:h-64">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <Image
              src={venueImage}
              alt={venueName}
              fill
              quality={90}
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
              priority
            />
          </motion.div>

          <div
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-xv-bg-deepest to-transparent pointer-events-none z-[1]"
            aria-hidden="true"
          />

          <div className="absolute top-4 left-4 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-xv-bg-deepest/45 backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inset-0 rounded-full bg-xv-accent-soft/70 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-xv-accent-soft/80" />
              </span>
              <span className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-white/90 font-medium">
                {badgeText}
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-0 overflow-visible">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 16,
              delay: 0.1,
            }}
            className="absolute top-0 w-12 h-12 mx-auto rounded-full bg-xv-bg-deepest/45 backdrop-blur-md border border-xv-bg-mid-soft/90 flex items-center justify-center mb-4 text-white/85"
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="relative text-center bg-gradient-to-b from-xv-bg-deepest to-xv-bg-mid">
          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="font-cormorant text-2xl sm:text-3xl text-white mb-3"
          >
            {venueName}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.28 }}
            className="font-montserrat text-xs text-white leading-relaxed mb-5 max-w-md mx-auto"
          >
            {address}
          </motion.p>
          <div className="px-6 pb-6 sm:pb-8 sm:px-8">
            {eventTime && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.36 }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mb-4 rounded-xl border border-xv-accent-soft/30 w-full text-white"
              >
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-montserrat text-xs font-semibold tracking-[0.2em] uppercase text-white">
                  {eventTime}
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.42 }}
            >
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark font-montserrat text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.5)] hover:shadow-[0_12px_40px_-10px_rgba(56,189,248,0.7)] w-full"
              >
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Ver ubicación</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}