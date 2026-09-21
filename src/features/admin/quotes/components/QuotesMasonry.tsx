"use client";

import { motion } from "framer-motion";
import MasonryView from "@/features/shared/components/MasonryView";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import FamilyQuoteCard from "./FamilyQuoteCard";

/** Estimación inicial de altura para evitar saltos en el primer render. */
const ITEM_HEIGHT_ESTIMATE = 240;

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  return (
    <MasonryView<FamilyQuoteMap>
      className="pr-1"
      items={messages}
      itemKey={(msg) => msg.id}
      // `leido` excluido a propósito: solo incluimos campos que afectan la
      // altura visible del card, así toggling de leído no invalida el
      // positioner (no hay reflow espurio).
      getLayoutHash={(msg) =>
        `${msg.id}|${msg.mensaje.length}|${msg.autor.length}|${msg.parentesco ?? ""}`
      }
      itemHeightEstimate={ITEM_HEIGHT_ESTIMATE}
      renderItem={({ item, captureRef }) => (
        <motion.div
          layout
          ref={captureRef}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
            default: { type: "spring", stiffness: 300, damping: 30 },
          }}
        >
          <FamilyQuoteCard msg={item} onManualToggle={onManualToggle} />
        </motion.div>
      )}
      renderExitItem={({ item }) => (
        <FamilyQuoteCard msg={item} onManualToggle={onManualToggle} />
      )}
    />
  );
};

export default QuotesMasonry;
