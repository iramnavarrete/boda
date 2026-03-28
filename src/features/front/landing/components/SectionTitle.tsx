import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  subtitle: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
  <div className="text-center mb-16 px-4 relative z-10">
    <span className="inline-block py-1 px-5 rounded-full border border-primary/30 text-primary text-[10px] font-bold tracking-[0.25em] uppercase mb-4 bg-accent/80 backdrop-blur-sm">
      {subtitle}
    </span>
    <h2 className="text-3xl md:text-5xl font-serif text-primary mb-6 drop-shadow-sm">
      {children}
    </h2>
    <div className="flex items-center justify-center gap-2 opacity-60">
      <div className="w-8 h-[1px] bg-gold"></div>
      <div className="w-1.5 h-1.5 rotate-45 border border-gold"></div>
      <div className="w-8 h-[1px] bg-gold"></div>
    </div>
  </div>
);
export default SectionTitle;
