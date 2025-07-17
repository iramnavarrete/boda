import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import React, { useEffect, useRef, useState } from "react";

function Music() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex bg-accent p-6 rounded-full absolute bottom-6 right-5 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
      <div className="flex flex-row gap-4 w-full">
        <div onClick={toggleAudio}>
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
