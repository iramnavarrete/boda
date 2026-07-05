import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  headerRight,
  children,
  className = "",
}) => (
  <div
    className={`bg-white/80 backdrop-blur-md p-6 lg:p-8 rounded-[24px] border border-[#EBE5DA] shadow-sm flex flex-col hover:shadow-[0_8px_30px_rgba(197,166,105,0.06)] transition-all duration-300 relative overflow-hidden group min-h-0 ${className}`}
  >
    <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FDFBF7] rounded-lg text-[#C5A669] border border-[#EBE5DA] shadow-sm">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#2C3627] leading-none">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-[#A8A29E] mt-1 uppercase tracking-widest font-bold">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {headerRight && <div>{headerRight}</div>}
    </div>
    <div className="flex-1 flex flex-col relative z-10 min-h-0">{children}</div>
  </div>
);

export default React.memo(DashboardCard);
