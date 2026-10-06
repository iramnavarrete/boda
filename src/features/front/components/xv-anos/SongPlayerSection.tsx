"use client";

import { motion } from "framer-motion";
import useMusicStore from "@/stores/musicStore";

interface Props {
  preTitle?: string;
  heading?: string;
  /** Párrafo descriptivo. */
  description?: string;
  /**
   * Metadata del track de audio (`MediaMetadata` de la Web Media API).
   * El título y artista del vals se leen de `mediaMetadata.title` y
   * `mediaMetadata.artist`. Mismo contrato que el audio del módulo
   * wedding (`audio.mediaMetadata`).
   */
  mediaMetadata?: MediaMetadataInit;
}

/**
 * SongPlayerSection — disco de vinilo + botón play/pause.
 * Theme-aware via tokens semánticos.
 */
export default function SongPlayerSection({
  preTitle = "Nuestra Canción",
  heading = "Tonight's Song",
  description = "Esta canción musicalizará mi entrada al vals. Dale play para entrar a la atmósfera del bosque mágico.",
  mediaMetadata,
}: Props) {
  const songTitle = mediaMetadata?.title ?? "";
  const songArtist = mediaMetadata?.artist ?? "";
  const playLabel = "Reproducir Vals";
  const pauseLabel = "Pausar Vals";
  const { isPlaying, toggleAudio } = useMusicStore();

  return (
    <section
      className="px-6 py-8 text-center"
      aria-labelledby="song-heading"
    >
      <motion.span
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-primary font-semibold block mb-1"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {preTitle}
      </motion.span>
      <motion.h2
        id="song-heading"
        className="font-cormorant text-3xl text-xv-accent-text mb-2"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        {heading}
      </motion.h2>
      <motion.p
        className="font-cormorant italic text-xs text-xv-accent-light/80 mb-6 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        {description}
      </motion.p>

      {/* Disco de vinilo */}
      <motion.div
        className="relative w-36 h-36 mx-auto mb-5"
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.25 }}
      >
        <div
          id="xv-vinyl-disc"
          className={
            "w-full h-full rounded-full bg-gradient-to-tr from-zinc-900 via-neutral-800 to-zinc-900 border-4 border-xv-bg-deepest shadow-2xl flex items-center justify-center relative transition-transform" +
            (isPlaying ? " animate-spin-slow" : "")
          }
          aria-hidden="true"
        >
          {/* Surcos concéntricos */}
          <div className="w-28 h-28 rounded-full border border-neutral-700/50 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-neutral-700/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-xv-accent-primary border-2 border-xv-bg-deepest flex items-center justify-center shadow-inner">
                <span className="font-cormorant font-bold text-xv-accent-dark text-xs">
                  XV
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-1 mb-4"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
      >
        <p className="font-cormorant text-lg text-xv-accent-text font-medium">
          {songTitle}
        </p>
        <p className="font-montserrat text-[11px] tracking-wider uppercase text-xv-accent-soft/80">
          {songArtist}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => toggleAudio()}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? pauseLabel : playLabel}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark font-montserrat text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
      >
        {isPlaying ? (
          <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span>{isPlaying ? pauseLabel : playLabel}</span>
      </motion.button>
    </section>
  );
}