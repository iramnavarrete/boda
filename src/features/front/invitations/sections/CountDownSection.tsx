import CountDown from "@/features/front/components/siena/countdown";
import type { CountDownSectionProps } from "../shared/types";

/** Sección: Cuenta regresiva con imagen de fondo. */
export default function CountDownSection(props: CountDownSectionProps) {
  return <CountDown {...props} />;
}
