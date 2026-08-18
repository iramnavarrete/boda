import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import useMusicStore from "@/stores/musicStore";
import { FC, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@heroui/theme";

/**
 * Curva de easing exponencial (concave up, "ease-in") para el fade-in.
 *
 *   f(t) = (e^(k·t) - 1) / (e^k - 1)
 *
 * Arranca con pendiente muy baja (el volumen sube apenas al inicio, así
 * la música no entra "de golpe") y va acelerando hasta alcanzar el
 * volumen objetivo al final del fade. Es la curva que mejor se percibe
 * al oído: compensa la respuesta logarítmica del oído humano.
 *
 * `k` controla qué tan pronunciado es el ease-in. `k = 3` da un arranque
 * suave y un "swell" musical al final sin sentirse exagerado.
 */
const FADE_EXPONENT = 3;
const FADE_DENOM = Math.exp(FADE_EXPONENT) - 1;

function easeInExp(t: number): number {
  return (Math.exp(FADE_EXPONENT * t) - 1) / FADE_DENOM;
}

/**
 * Rampa el volumen del audio desde su valor actual hasta `target` (0–1)
 * con la curva exponencial. Cada llamada cancela la rampa anterior
 * mediante `tokenRef`, así que es seguro disparar ramps nuevas sin que
 * se encimen. Si `duration <= 0`, aplica el cambio de forma instantánea.
 *
 * `onDone` se invoca cuando la rampa termina, o de inmediato si no hay fade.
 */
function rampVolume(
  audio: HTMLAudioElement,
  target: number,
  duration: number,
  tokenRef: { current: number },
  onDone?: () => void,
) {
  const myToken = ++tokenRef.current;
  // Defensivo: el setter de `audio.volume` lanza IndexSizeError si el
  // valor se sale de [0, 1] o no es finito (NaN/Infinity). Blindamos
  // `clamped`, `from` y el valor interpolado antes de cada asignación.
  const clamped = Number.isFinite(target)
    ? Math.max(0, Math.min(1, target))
    : 0;

  if (duration <= 0) {
    audio.volume = clamped;
    onDone?.();
    return;
  }

  const start = performance.now();
  const from = Number.isFinite(audio.volume)
    ? Math.max(0, Math.min(1, audio.volume))
    : 0;

  const step = (now: number) => {
    // Si una rampa más reciente tomó el control, salimos sin tocar nada.
    if (myToken !== tokenRef.current) return;

    const t = Math.min(1, (now - start) / duration);
    const eased = easeInExp(t);
    const raw = from + (clamped - from) * eased;
    // Última línea de defensa: si por cualquier motivo (coma flotante,
    // NaN colado, etc.) el valor quedó fuera de [0, 1] o no es finito,
    // caemos a `clamped` (que ya está saneado) en vez de tirar el DOM.
    const safe = Number.isFinite(raw)
      ? Math.max(0, Math.min(1, raw))
      : clamped;
    audio.volume = safe;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      audio.volume = clamped;
      onDone?.();
    }
  };

  requestAnimationFrame(step);
}

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

  // Token para cancelar ramps en curso (cada ramp nueva lo incrementa).
  const fadeTokenRef = useRef(0);
  // Última posición reportada por `timeupdate` (para detectar loop).
  const lastTimeRef = useRef(0);
  // Duración del audio (para distinguir loop real de un seek manual).
  const durationRef = useRef(0);

  // Refs espejo: los handlers leen siempre los valores más recientes sin
  // necesidad de re-enganchar listeners.
  const fadeMsRef = useRef(fadeMs);
  const targetVolumeRef = useRef(
    Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1,
  );

  useEffect(() => {
    fadeMsRef.current = fadeMs;
  }, [fadeMs]);
  useEffect(() => {
    targetVolumeRef.current = Number.isFinite(volume)
      ? Math.max(0, Math.min(1, volume))
      : 1;
  }, [volume]);

  // MediaSession: actualiza la metadata cuando cambie el prop.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (mediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata(mediaMetadata);
      } catch {
        // MediaMetadataInit inválido: lo ignoramos silenciosamente.
      }
    }
  }, [mediaMetadata]);

  // Efecto principal: monta el <audio>, engancha listeners y configura
  // los handlers de MediaSession.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioRef(audio);
    audio.volume = 0; // arrancamos en silencio; el fade-in se encarga.

    const onPlay = () => {
      setIsPlaying(true);
      // Reseteamos a 0 y hacemos fade-in, así cada play arranca desde
      // silencio sin importar el volumen que tenía antes (p.ej. tras un
      // pause, donde ya no hacemos fade-out).
      audio.volume = 0;
      rampVolume(
        audio,
        targetVolumeRef.current,
        fadeMsRef.current,
        fadeTokenRef,
      );
    };

    const onPause = () => {
      // Pause instantáneo: solo sincronizamos el estado. El volumen se
      // queda donde esté (al objetivo) y el próximo play hará fade-in
      // desde 0.
      setIsPlaying(false);
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
        // Trato el loop como un play nuevo: silencio y fade-in exponencial.
        audio.volume = 0;
        rampVolume(
          audio,
          targetVolumeRef.current,
          fadeMsRef.current,
          fadeTokenRef,
        );
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

    // MediaSession: handlers para los controles del dispositivo
    // (lockscreen, auriculares, barra de notificaciones). Al llamar
    // play/pause sobre el <audio> se disparan los eventos correspondientes,
    // que mantienen el botón de música siempre sincronizado.
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        audio.play().catch(() => {
          // Autoplay bloqueado: el evento 'play' no se dispara y el estado
          // permanece en false. No hacemos nada.
        });
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        // Pause directo desde el dispositivo, sin fade.
        audio.pause();
      });
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      // Cancela cualquier fade-in en curso al desmontar.
      fadeTokenRef.current++;
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
    // setAudioRef y setIsPlaying son selectores de Zustand con referencias
    // estables, así que este efecto corre una vez al montar.
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
