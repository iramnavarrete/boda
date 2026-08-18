// useMusicStore.ts
import { create } from "zustand";

type MusicState = {
  isPlaying: boolean;
  audioRef: HTMLAudioElement | null;
  toggleAudio: () => void;
  setAudioRef: (ref: HTMLAudioElement) => void;
  setIsPlaying: (playing: boolean) => void;
};

const useMusicStore = create<MusicState>((set, get) => ({
  isPlaying: false,
  audioRef: null,
  setAudioRef: (ref) => set({ audioRef: ref }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleAudio: () => {
    const { isPlaying, audioRef } = get();

    if (isPlaying) {
      // Pause directo, sin fade: el AudioController escucha los eventos
      // del <audio> para mantener el estado sincronizado.
      audioRef?.pause();
    } else {
      // Play: el AudioController dispara el fade-in desde el evento 'play'
      // del <audio>, así el botón queda sincronizado venga de donde venga
      // (este botón, otro botón de la página, o los controles del dispositivo).
      audioRef?.play().catch(() => {
        // Autoplay bloqueado: el evento 'play' no se dispara y el estado
        // permanece en false.
      });
    }
  },
}));

export default useMusicStore;
