"use client";

import { motion } from "framer-motion";
import { formatToEventDate } from "@/utils/formatters";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

interface Props {
  /** Número de WhatsApp (con lada, sin '+'). */
  phone: string;
  /** Mensaje predefinido (acepta variable {nombreFamilia} opcional). */
  message: string;
  /** Fecha límite ISO (YYYY-MM-DD). */
  deadline?: string;
  /** Etiqueta superior (HTML: "R. S. V. P."). */
  preTitle?: string;
  /** Heading principal. */
  heading?: string;
  /** Párrafo descriptivo del card exterior. */
  outerDescription?: string;
  /** Texto del badge de deadline. */
  deadlineLabel?: string;
  /** Etiqueta del card interior. */
  innerTitle?: string;
  /** Párrafo del card interior. */
  innerDescription?: string;
  /** Texto del botón CTA. */
  ctaLabel?: string;
}

/**
 * WhatsAppRSVP — sección "Confirma tu Asistencia".
 * Theme-aware via tokens semánticos.
 */
export default function WhatsAppRSVP({
  phone,
  message,
  deadline,
  preTitle = "R. S. V. P.",
  heading = "Confirma tu Asistencia",
  outerDescription = "Cada lugar en el jardín cuenta una historia. Tu presencia es el mejor regalo para celebrar mis quince años.",
  deadlineLabel,
  innerTitle = "Confirmar Vía WhatsApp",
  innerDescription = "Envíanos tu nombre y el número de pases confirmados directamente.",
  ctaLabel = "Confirmar Asistencia",
}: Props) {
  const invitationData = useInvitationStore((s) => s.invitationData);

  const finalMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${finalMessage}`;

  // Deadline dinámico
  let resolvedDeadline = deadlineLabel;
  if (!resolvedDeadline) {
    if (deadline) {
      try {
        const date = new Date(`${deadline}T23:59:59`);
        resolvedDeadline = `Favor de confirmar antes del ${formatToEventDate(date)}`;
      } catch {
        resolvedDeadline = undefined;
      }
    } else if (invitationData?.rsvpDeadline) {
      try {
        const date = new Date(`${invitationData.rsvpDeadline}T23:59:59`);
        resolvedDeadline = `Favor de confirmar antes del ${formatToEventDate(date)}`;
      } catch {
        resolvedDeadline = undefined;
      }
    }
  }

  return (
    <section
      className="bg-xv-accent-primary text-xv-accent-dark px-6 py-12 text-center rounded-3xl mx-3 my-6 shadow-2xl"
      aria-labelledby="rsvp-heading"
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-xv-accent-dark/10 mx-auto flex items-center justify-center mb-3"
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <span className="font-cormorant text-2xl text-xv-accent-dark" aria-hidden="true">
          ✉
        </span>
      </motion.div>

      <motion.span
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-dark font-bold block mb-1"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {preTitle}
      </motion.span>

      <motion.h2
        id="rsvp-heading"
        className="font-cormorant text-3xl font-medium text-xv-accent-dark mb-3"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        {heading}
      </motion.h2>

      <motion.p
        className="font-cormorant italic text-sm text-xv-accent-dark/90 max-w-xs mx-auto mb-5 leading-relaxed"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
      >
        {outerDescription}
      </motion.p>

      {resolvedDeadline && (
        <motion.div
          className="inline-block border border-xv-accent-dark/30 rounded-xl px-4 py-2 bg-xv-accent-soft/30 mb-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
        >
          <span className="font-montserrat text-[11px] tracking-wider uppercase font-semibold text-xv-accent-dark">
            {resolvedDeadline}
          </span>
        </motion.div>
      )}

      <motion.div
        className="bg-xv-bg-deepest text-xv-accent-text rounded-2xl p-6 shadow-xl border border-xv-bg-mid"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.32 }}
      >
        <div className="w-10 h-10 rounded-full bg-xv-bg-deep border border-xv-accent-soft/40 mx-auto flex items-center justify-center text-xv-accent-soft mb-3">
          <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2 2.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
          </svg>
        </div>

        <h3 className="font-cormorant text-xl text-xv-accent-light mb-1">{innerTitle}</h3>
        <p className="font-montserrat text-xs text-xv-accent-light/80 mb-5">
          {innerDescription}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-5 rounded-full bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark font-montserrat text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <span>{ctaLabel}</span>
          <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </a>
      </motion.div>
    </section>
  );
}