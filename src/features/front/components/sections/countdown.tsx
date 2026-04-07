import { cn } from "@heroui/theme";

export default function CountDown({backgroundImage, imageClassName = ''}: {backgroundImage?: string; imageClassName?: string;}) {
  return (
    <div className="relative bg_fixed bg-transparent">
      <div
        className={cn("overlay bg-countdown", imageClassName)}
        style={imageClassName ? { background: `url(${backgroundImage})` } : {}}
      />
      <div className="h-screen w-full bg-transparent">
        <div className="flex flex-row items-center justify-center" />
      </div>
    </div>
  );
}
