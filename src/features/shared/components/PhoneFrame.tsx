import { ReactNode } from "react";

interface PhoneFrameProps {
  /** Contenido de la pantalla (video, imagen, etc.). */
  children: ReactNode;
  /** Clases extra para el marco exterior. */
  className?: string;
  /** Clases extra para la pantalla. */
  screenClassName?: string;
}

/**
 * Marco de teléfono con el diseño del sitio (carcasa oscura, botones
 * laterales y notch). Se usa en la sección de video y en "Nuestro trabajo"
 * para que las invitaciones se presenten siempre igual.
 */
const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  className = "",
  screenClassName = "",
}) => (
  <div className={`relative z-20 ${className}`}>
    <div className="relative mx-auto w-[280px] h-[580px] bg-charcoal-900 rounded-[45px] shadow-[0_30px_60px_-15px_rgba(88,98,79,0.3)] border-[8px] border-charcoal-900 ring-1 ring-black/10">
      {/* Botones laterales */}
      <div className="absolute top-24 -left-[10px] w-[3px] h-[32px] bg-charcoal-900 rounded-l-md" />
      <div className="absolute top-36 -left-[10px] w-[3px] h-[50px] bg-charcoal-900 rounded-l-md" />
      <div className="absolute top-36 -right-[10px] w-[3px] h-[80px] bg-charcoal-900 rounded-r-md" />

      <div
        className={`relative w-full h-full rounded-[42px] overflow-hidden bg-black ${screenClassName}`}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-charcoal-900 rounded-b-[16px] z-30 flex justify-center pt-1">
          <div className="w-12 h-1 rounded-full bg-stone-950" />
        </div>

        <div className="relative w-full h-full">{children}</div>
      </div>
    </div>
  </div>
);

export default PhoneFrame;
