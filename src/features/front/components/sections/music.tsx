import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import useMusicStore from "@/stores/musicStore";
import { FC, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@heroui/theme";

/**
 * Piso de silencio para las rampas exponenciales. `exponentialRampToValueAtTime`
 * no acepta 0 como destino (es indefinido matemáticamente: e^x nunca llega a 0),
 * así que usamos un valor imperceptiblemente bajo como "silencio" en su lugar.
 * Es el mismo truco que usa el demo de referencia (0.01).
 */
const SILENCE = 0.0001;

export function AudioController({
  musicPath = "/music.mp3",
  fadeMs = 0,
  volume = 1,
  mediaMetadata,
}: {
  musicPath?: string;
  /**
   * Duración del fade-in en milisegundos. Se aplica al iniciar/reanudar
   * la reproducción y cuando la canción reinicia (loop). `0` desactiva
   * el fade (la música entra a volumen directo).
   *
   * Nota: el pause es instantáneo, no tiene fade.
   */
  fadeMs?: number;
  /**
   * Volumen objetivo (0–1) al que se hace el fade-in. Por defecto `1`.
   */
  volume?: number;
  /**
   * Metadata opcional para la `MediaSession` del navegador (lockscreen,
   * barra de notificaciones del dispositivo, controles de auriculares).
   */
  mediaMetadata?: MediaMetadataInit;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const setAudioRef = useMusicStore((s) => s.setAudioRef);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);

  // AudioContext + GainNode: todo el control de volumen pasa por acá,
  // usando exponentialRampToValueAtTime (igual que el demo de referencia)
  // en vez de animar `audio.volume` con requestAnimationFrame.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Última posición reportada por `timeupdate` (para detectar loop).
  const lastTimeRef = useRef(0);
  // Duración del audio (para distinguir loop real de un seek manual).
  const durationRef = useRef(0);

  // Refs espejo: los handlers leen siempre los valores más recientes sin
  // necesidad de re-enganchar listeners.
  const fadeMsRef = useRef(fadeMs);
  const targetVolumeRef = useRef(
    Number.isFinite(volume) ? Math.max(SILENCE, Math.min(1, volume)) : 1,
  );

  useEffect(() => {
    fadeMsRef.current = fadeMs;
  }, [fadeMs]);
  useEffect(() => {
    targetVolumeRef.current = Number.isFinite(volume)
      ? Math.max(SILENCE, Math.min(1, volume))
      : 1;
  }, [volume]);

  // MediaSession: actualiza la metadata cuando cambie el prop.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;
    if (mediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata(mediaMetadata);
      } catch {
        // MediaMetadataInit inválido: lo ignoramos silenciosamente.
      }
    }
  }, [mediaMetadata]);

  // Efecto principal: monta el <audio>, arma el grafo de Web Audio,
  // engancha listeners y configura los handlers de MediaSession.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioRef(audio);
    audio.volume = 1; // fijo; el control real es el GainNode.

    const AudioCtxCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtxCtor();
    // `createMediaElementSource` solo puede llamarse UNA vez por
    // elemento <audio> en toda su vida útil.
    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    gainNode.gain.value = SILENCE; // arrancamos "en silencio".
    source.connect(gainNode).connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gainNode;

    /**
     * Fade-in exponencial
     */
    const beginFadeIn = () => {
      if (ctx.state === "closed") return;

      const runRamp = () => {
        if (ctx.state === "closed" || audio.paused) return;
        const now = ctx.currentTime;
        const target = Math.max(SILENCE, targetVolumeRef.current);
        const durSec = Math.max(fadeMsRef.current, 0) / 1000;

        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(SILENCE, now);

        if (durSec <= 0) {
          gainNode.gain.setValueAtTime(target, now);
          return;
        }
        gainNode.gain.exponentialRampToValueAtTime(target, now + durSec);
      };

      if (ctx.state === "running") {
        runRamp();
      } else {
        ctx
          .resume()
          .catch(() => {})
          .finally(runRamp);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      beginFadeIn();
    };

    const onPause = () => {
      setIsPlaying(false);
      if (ctx.state !== "closed") {
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setValueAtTime(SILENCE, ctx.currentTime);
      }
    };

    const onEnded = () => {
      // Con `loop` no se dispara, pero lo cubrimos por si alguien lo quita.
      setIsPlaying(false);
    };

    const onTimeUpdate = () => {
      // Detección de loop: currentTime retrocedió y veníamos del final del
      // audio. El umbral de 1.5s evita falsos positivos por seeks manuales
      // a puntos intermedios.
      if (
        audio.currentTime < lastTimeRef.current &&
        !audio.paused &&
        durationRef.current > 0 &&
        lastTimeRef.current > durationRef.current - 1.5
      ) {
        beginFadeIn();
      }
      lastTimeRef.current = audio.currentTime;
    };

    const onLoadedMetadata = () => {
      durationRef.current = audio.duration;
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        audio.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audio.pause();
      });
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
      gainNodeRef.current = null;
      audioCtxRef.current = null;
      ctx.close().catch(() => {});
    };
  }, [setAudioRef, setIsPlaying]);

  return <audio ref={audioRef} loop src={musicPath} />;
}

const Music: FC<{ iconClassName?: string; containerClassName?: string }> = ({
  iconClassName = "",
  containerClassName = "",
}) => {
  const { isPlaying, toggleAudio } = useMusicStore();

  return (
    <motion.div
      className={cn(
        "flex bg-accent p-4 rounded-full drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]",
        containerClassName,
      )}
      onClick={() => toggleAudio()}
      whileTap={{ scale: 0.8 }}
    >
      <div className="flex flex-row gap-4 w-full">
        <div>
          {isPlaying ? (
            <PauseIcon className={cn("w-7 h-7 text-primary", iconClassName)} />
          ) : (
            <PlayIcon className={cn("w-7 h-7 text-primary", iconClassName)} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Music;
