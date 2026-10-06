"use client";

import { motion } from "framer-motion";
import useMusicStore from "@/stores/musicStore";

/**
 * Botón flotante de música para XV Años.
 *
 * - Solo ícono musical (sin texto): nota musical que **gira** mientras
 *   reproduce (`animate-spin-slow` cuando `isPlaying === true`).
 * - Mismo controlador que siena: `useMusicStore` global (`AudioController`
 *   lo monta `XvBody`). Llamamos a `toggleAudio()` para play/pause.
 * - Color del ícono: `#bfdbfe` literal (azul claro — el usuario pidió
 *   reemplazar el dorado por este azul para el control de música).
 * - Posición: lo posiciona `XvInvitationFrame` (bottom-left).
 */
export default function FloatingMusicButton() {
  const { isPlaying, toggleAudio } = useMusicStore();

  return (
    <motion.button
      type="button"
      aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
      aria-pressed={isPlaying}
      onClick={() => toggleAudio()}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.4,
        duration: 0.5,
        type: "spring",
        stiffness: 220,
        damping: 18,
      }}
      whileTap={{ scale: 0.9 }}
      className="relative group flex items-center justify-center w-12 h-12 rounded-full bg-xv-bg-deepest/70 border border-xv-accent-soft/30 backdrop-blur-md hover:border-[#bfdbfe]/60 hover:bg-xv-bg-deepest/85 transition-colors"
      style={{ color: "#bfdbfe" }}
    >
      {/* Halo ambient cuando reproduce (más sutil) */}
      {isPlaying && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-md animate-pulse-slow pointer-events-none"
          style={{ backgroundColor: "rgba(191, 219, 254, 0.18)" }}
        />
      )}

      {/* Nota musical — gira mientras reproduce */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          duration: 4,
          repeat: isPlaying ? Infinity : 0,
          ease: "linear",
        }}
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </motion.svg>

      {/* Borde animado al hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ring-1"
        style={{ "--tw-ring-color": "#bfdbfe" } as React.CSSProperties}
      />
    </motion.button>
  );
}