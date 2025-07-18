import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  isSealVisible: boolean;
};

function Music({ isSealVisible }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = useCallback((isPlaying: boolean) => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (!isSealVisible) {
      setTimeout(() => {
        toggleAudio(isPlaying);
      }, 5);
    }
  }, [isSealVisible, toggleAudio]);

  return (
    <div className="flex bg-accent p-6 rounded-full drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
      <div className="flex flex-row gap-4 w-full">
        <div onClick={() => toggleAudio(isPlaying)}>
          {isPlaying ? (
            <PauseIcon className="w-7 h-7 text-primary" />
          ) : (
            <PlayIcon className="w-7 h-7 text-primary" />
          )}
        </div>
      </div>
      <audio ref={audioRef} loop src="/music.mp3" />
    </div>
  );
}

export default Music;
