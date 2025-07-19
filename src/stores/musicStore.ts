// useMusicStore.ts
import { create } from "zustand";

type MusicState = {
  isPlaying: boolean;
  audioRef: HTMLAudioElement | null;
  toggleAudio: () => void;
  setAudioRef: (ref: HTMLAudioElement) => void;
};

const useMusicStore = create<MusicState>((set, get) => ({
  isPlaying: false,
  audioRef: null,
  setAudioRef: (ref) => set({ audioRef: ref }),
  toggleAudio: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }

    set({ isPlaying: !isPlaying });
  },
}));

export default useMusicStore;
