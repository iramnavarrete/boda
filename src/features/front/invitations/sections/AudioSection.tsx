import { AudioController } from "@/features/front/components/sections/music";
import type { AudioSectionProps } from "../shared/types";

/** Sección: Controlador de audio de fondo. */
export default function AudioSection(props: AudioSectionProps) {
  return <AudioController {...props} />;
}
