import React from "react";
import { LucideIcon } from "lucide-react";

interface StatRowProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  colorClass?: string;
  isWarning?: boolean;
  percentage?: number;
  showBorder?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({
  icon: Icon,
  label,
  value,
  colorClass = "text-[#5A5A5A]",
  isWarning = false,
  percentage,
  showBorder = true,
}) => (
  <div
    className={`flex items-center justify-between py-3 px-3 hover:bg-[#F9F7F2] transition-colors rounded-xl border border-transparent hover:border-[#EBE5DA] ${showBorder ? "border-b border-[#EBE5DA]/60" : ""}`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-1.5 rounded-lg ${isWarning ? "bg-red-50 border-red-100 text-red-500" : `bg-[#FDFBF7] border-[#EBE5DA] ${colorClass}`}`}
      >
        <Icon size={14} />
      </div>
      <span
        className={`text-[13px] font-medium ${isWarning ? "text-red-600" : "text-[#5A5A5A]"}`}
      >
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3">
      {percentage !== undefined && (
        <span className="hidden xl:block text-[10px] text-[#A8A29E] font-medium bg-white px-1.5 py-0.5 rounded border border-[#EBE5DA]">
          {percentage}%
        </span>
      )}
      <span
        className={`text-base font-bold font-serif min-w-[1.5rem] text-right ${isWarning ? "text-red-600" : "text-[#2C3627]"}`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default React.memo(StatRow);
