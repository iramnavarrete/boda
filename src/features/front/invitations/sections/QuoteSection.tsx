import Quote from "@/features/front/components/sections/quote";
import type { QuoteSectionProps } from "../shared/types";

/** Sección: Cita/frase bíblica o literaria. */
export default function QuoteSection(props: QuoteSectionProps) {
  return <Quote {...props} />;
}
