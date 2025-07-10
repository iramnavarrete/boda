import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import React, { useEffect, useRef, useState } from "react";

function Music() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progressWidth, setProgressWidth] = useState("0%");

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const duration = audioRef.current?.duration;
      const elapsed = audioRef.current?.currentTime;
      if (duration && elapsed) {
        const progress = (elapsed / duration) * 100;
        setProgressWidth(`${progress}%`);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex bg-primary w-full p-6">
      <div className="flex flex-row gap-4 w-full">
        <div onClick={toggleAudio}>
          {isPlaying ? (
            <PauseIcon className="w-7 h-7 text-white" />
          ) : (
            <PlayIcon className="w-7 h-7 text-white" />
          )}
        </div>
        <div className="flex w-full items-center relative">
          <hr className="w-full border-[#b2b2b2] border-2" />
          <hr
            className="absolute border-white border-2 left-0 z-10"
            style={{ width: progressWidth }}
          />
        </div>
      </div>
      <audio ref={audioRef} loop src="/music.mp3" />
    </div>
  );
}

export default Music;
