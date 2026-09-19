"use client";

import { cn } from "@heroui/theme";
import type { ActivityActionType } from "@/types";
import { ACTIVITY_VISUAL } from "../utils/activityLabels";

type StatusIconSize = "sm" | "md";

interface StatusIconCircleProps {
  action: ActivityActionType;
  /** `sm` = 32px (admin page card), `md` = 36px (dashboard). Default: `sm`. */
  size?: StatusIconSize;
  className?: string;
}

const SIZE_MAP: Record<StatusIconSize, { container: string; icon: number }> = {
  sm: { container: "w-8 h-8", icon: 14 },
  md: { container: "w-9 h-9", icon: 14 },
};

/**
 * Círculo de icono con colores consistentes por `action`.
 * Reutiliza `ACTIVITY_VISUAL` (mismos iconos y paleta que las cards).
 */
export const StatusIconCircle = ({
  action,
  size = "sm",
  className,
}: StatusIconCircleProps) => {
  const visual = ACTIVITY_VISUAL[action];
  const Icon = visual.icon;
  const dims = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 border border-black/5",
        dims.container,
        visual.iconBgClass,
        visual.iconColorClass,
        className,
      )}
    >
      <Icon size={dims.icon} />
    </div>
  );
};