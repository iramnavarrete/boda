import QrPhotos from "@/features/front/components/sections/qr-photos";
import type { QrSectionProps } from "../shared/types";

/** Sección: QR con enlace a Google Photos del evento. */
export default function QrSection(props: QrSectionProps) {
  return <QrPhotos {...props} />;
}
