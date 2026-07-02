import { useCountdown } from "@/features/front/hooks/useCountDown";
import React from "react";

interface TimeUnitProps {
  value: string | number;
  label: string;
}

const TimeUnit: React.FC<TimeUnitProps> = React.memo(({ value, label }) => (
  <div className="flex flex-col items-center justify-center">
    <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white drop-shadow-lg mb-2 lg:mb-3">
      {value}
    </span>
    <span className="text-[9px] md:text-[10px] text-white/80 font-medium uppercase tracking-[0.25em]">
      {label}
    </span>
  </div>
));

TimeUnit.displayName = "TimeUnit";

type Props = {
  targetDate?: Date;
  srcCover?: string;
}

const CountdownCard: React.FC<Props> = ({ targetDate, srcCover }) => {
  const [days, hours, minutes, seconds] = useCountdown(
    targetDate,
  );

  return (
    <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-sm group min-h-[250px]">
      {/* Fondo Fotográfico Elegante */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage:
            `url('${srcCover}')` ||
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop')",
        }}
      />
      {/* Overlay Oscuro / Monocromático para dar contraste */}
      <div className="absolute inset-0 bg-[#2C3627]/80 backdrop-blur-[1px]" />

      {/* Contenido Central */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 lg:p-8">
        <span className="text-[10px] text-[#C5A669] uppercase tracking-[0.3em] font-bold mb-6 lg:mb-8 drop-shadow-sm text-center">
          Cuenta Regresiva
        </span>

        <div className="flex items-center justify-center gap-4 lg:gap-6 w-full">
          <TimeUnit value={days} label="Días" />
          <TimeUnit value={hours} label="Horas" />
          <TimeUnit value={minutes} label="Minutos" />
          <TimeUnit value={seconds} label="Segundos" />
        </div>
      </div>
    </div>
  );
};

export default CountdownCard;
