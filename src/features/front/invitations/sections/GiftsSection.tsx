import GiftsTable from "@/features/front/components/siena/gifts-table";
import type { GiftsSectionProps } from "../shared/types";

/** Sección: Mesa de regalos (enlaces a tiendas + transferencia). */
export default function GiftsSection(props: GiftsSectionProps) {
  return <GiftsTable {...props} />;
}
