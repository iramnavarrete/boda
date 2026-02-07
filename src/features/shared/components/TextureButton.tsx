import { cn } from "@heroui/theme";
import { ReactNode } from "react";

interface TextureButtonProps {
  children: ReactNode;
  primary?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
  className?: string;
  lighting?: boolean;
}

const TextureButton: React.FC<TextureButtonProps> = ({
  children,
  primary = true,
  onClick,
  icon,
  className = "",
  lighting = true,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-8 py-4 rounded-full font-medium tracking-widest uppercase text-xs transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 relative overflow-hidden group",
      primary
        ? "bg-primary text-paper shadow-[0_4px_20px_rgba(88,98,79,0.4)]"
        : "bg-paper border border-border-button text-primary hover:border-primary shadow-sm",
      className,
    )}
  >
    {lighting && (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
    )}
    {icon && <span className="w-4 h-4">{icon}</span>}
    <span className="relative z-10">{children}</span>
  </button>
);

export default TextureButton;
