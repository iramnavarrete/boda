import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import useMusicStore from "@/stores/musicStore";
import React, { useEffect, useRef } from "react";

export function AudioController() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const setAudioRef = useMusicStore((s) => s.setAudioRef);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]); // Solo se llama una vez

  return <audio ref={audioRef} loop src="/music.mp3" />;
}


function Music() {
  const { isPlaying, toggleAudio } = useMusicStore();

  return (
    <div
      className="flex bg-accent p-4 rounded-full drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
      onClick={() => toggleAudio()}
    >
      <div className="flex flex-row gap-4 w-full">
        <div>
          {isPlaying ? (
            <PauseIcon className="w-7 h-7 text-primary" />
          ) : (
            <PlayIcon className="w-7 h-7 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Music;
