"use client";

import { cn } from "@heroui/theme";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import type { FamilyActivity } from "@/types";

interface TimeAgoStampProps {
  /** Timestamp del activity (acepta cualquier formato que useTimeAgo soporte). */
  timestamp: FamilyActivity["timestamp"];
  /** Clases adicionales para el span. */
  className?: string;
}

export const TimeAgoStamp = ({ timestamp, className }: TimeAgoStampProps) => {
  const timeAgo = useTimeAgo(timestamp);
  return <p className={cn(className)}>{timeAgo}</p>;
};