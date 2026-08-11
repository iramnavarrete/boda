import { useState } from "react";
import { TagFilterType } from "@/types";

export function useGuestTagFilter() {
  const [tagFilter, setTagFilter] = useState<TagFilterType>("all");

  return {
    tagFilter,
    setTagFilter,
  };
}
