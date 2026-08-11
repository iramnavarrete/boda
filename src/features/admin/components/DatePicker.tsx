import { cn } from "@heroui/theme";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
}

// 🔥 Helper para detectar montaje en el cliente sin causar renders en cascada
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Valor en el cliente
    () => false, // Valor en el servidor (SSR)
  );
}

export default function DatePicker({ value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detector de cliente a prueba de advertencias de ESLint / Next.js
  const isMounted = useIsMounted();

  // Parseamos la fecha evitando problemas de zona horaria
  const getInitialDate = () => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const [viewDate, setViewDate] = useState<Date>(getInitialDate);

  // Click outside para cerrar el calendario
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtenemos "hoy" a las 00:00:00 para comparar únicamente fechas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cálculos del mes actual
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Generamos la cuadrícula de días
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) daysGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysGrid.push(i);

  const handlePrevMonth = () =>
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const handleSelectDay = (day: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  // Formato visual DD / MM / YYYY
  const formattedVisualDate = value
    ? value.split("-").reverse().join(" / ")
    : "DD / MM / AAAA";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => {
          setViewDate(getInitialDate());
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full pl-4 pr-3 py-2.5 bg-[#FDFBF7] border rounded-xl transition-all shadow-sm flex items-center justify-between cursor-pointer select-none",
          isOpen
            ? "border-[#C5A669] ring-2 ring-[#C5A669]/20"
            : "border-[#EBE5DA] hover:border-[#C5A669]/50",
        )}
      >
        <span
          className={value ? "text-[#2C2C29] font-medium" : "text-[#A8A29E]"}
        >
          {formattedVisualDate}
        </span>

        {/* Contenedor lateral derecho */}
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#A8A29E] hover:text-red-500 hover:bg-red-50 uppercase tracking-widest transition-colors px-2 py-1 rounded-md"
            >
              <X size={12} strokeWidth={3} />
              Limpiar
            </button>
          )}
          <CalendarIcon
            size={18}
            className={value || isOpen ? "text-[#C5A669]" : "text-[#A8A29E]"}
          />
        </div>
      </div>

      {/* Popover del Calendario */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-[#EBE5DA] rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header del Calendario */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#FDFBF7] text-[#5A5A5A] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-[#2C2C29] text-sm capitalize">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#FDFBF7] text-[#5A5A5A] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-[#A8A29E]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((day, i) => {
              if (!day) {
                return <div key={i} className="h-8 w-full invisible" />;
              }

              const cellDate = new Date(currentYear, currentMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              // Comprobación de días pasados segura para SSR
              const isPast = isMounted ? cellDate < today : false;

              const isSelected =
                value ===
                `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-full rounded-full flex items-center justify-center text-sm transition-colors",
                    isPast &&
                      "opacity-30 text-[#A8A29E] cursor-not-allowed line-through",
                    !isPast &&
                      !isSelected &&
                      "text-[#5A5A5A] hover:bg-[#FDFBF7] hover:text-[#C5A669]",
                    isSelected &&
                      "bg-[#C5A669] text-white font-bold shadow-md shadow-[#C5A669]/20 opacity-100",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
