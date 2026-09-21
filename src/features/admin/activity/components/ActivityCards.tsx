"use client";

import { motion } from "framer-motion";
import MasonryView from "@/features/shared/components/MasonryView";
import ActivityCard from "./ActivityCard";
import type { ActivityGroup } from "../types";

/** Estimación inicial de altura para evitar saltos en el primer render. */
const ITEM_HEIGHT_ESTIMATE = 200;

interface ActivityCardsProps {
  groups: ActivityGroup[];
}

const ActivityCards = ({ groups }: ActivityCardsProps) => {
  return (
    <MasonryView<ActivityGroup>
      items={groups}
      itemKey={(g) => g.familyId}
      // `activities.length` incluido porque afecta la altura del card.
      getLayoutHash={(g) =>
        `${g.familyId}|${g.familyName.length}|${g.activities.length}`
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
          <ActivityCard group={item} />
        </motion.div>
      )}
      renderExitItem={({ item }) => (
        <ActivityCard group={item} />
      )}
    />
  );
};

export default ActivityCards;
