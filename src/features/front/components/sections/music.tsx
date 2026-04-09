import PauseIcon from "@/icons/pause-icon";
import PlayIcon from "@/icons/play-icon";
import useMusicStore from "@/stores/musicStore";
import { FC, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@heroui/theme";

export function AudioController({ musicPath = "/music.mp3" }: { musicPath?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const setAudioRef = useMusicStore((s) => s.setAudioRef);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]);

  return <audio ref={audioRef} loop src={musicPath} />;
}

const Music: FC<{iconClassName?: string}> = ({iconClassName = ''}) => {
  const { isPlaying, toggleAudio } = useMusicStore();


  return (
    <motion.div
      className="flex bg-accent p-4 rounded-full drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
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
}

export default Music;
