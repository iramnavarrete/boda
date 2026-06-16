import { cn } from "@heroui/theme";
const HandDrawnHeart = ({ className }: { className?: string }) => (
  <svg
    className={className || ""}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50.4,83.6 C28.3,66.5 12.9,49.8 14.6,30.2 C15.5,19.2 24.3,12.7 34.6,13.8 C42.1,14.6 47.9,23.5 50.4,28.8 C52.7,23.1 58.7,14.7 66.8,13.4 C77.5,13.0 85.1,21.6 84.8,32.7 C84.3,51.8 67.2,69.5 50.4,83.6 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DynamicCalendar = ({ targetDate }: { targetDate: Date }) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  const monthNames = [
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

  const currentMonthName = monthNames[month];

  // Calcular el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Ajuste para que la semana empiece en Lunes (0 = Domingo, 1 = Lunes, etc.)
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generar el arreglo de días para la cuadrícula
  const calendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null); // Espacios vacíos antes del primer día
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Días de la semana (Lunes a Domingo)
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  return (
    <div className="bg-[#5C6154] text-[#FDFBF7] px-8 py-6 md:px-10 md:py-12 rounded-[2rem] max-w-[410px] w-11/12 mx-auto shadow-2xl flex flex-col items-center border border-white/10 relative">
      {/* Cabecera del Mes y Año (Diseño Editorial) */}
      <div className="flex justify-around w-full mb-4">
        <h2 className="font-newIconScript text-3xl drop-shadow-sm text-center leading-none">
          {currentMonthName}
        </h2>
        <span className="font-nourdMedium tracking-[0.3em] uppercase opacity-70 mt-1 text-center">
          {year}
        </span>
      </div>

      {/* Contenedor de la cuadrícula del calendario */}
      <div className="w-full px-2">
        {/* Encabezado de los días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {weekDays.map((day, index) => (
            <div
              key={`weekday-${index}`}
              className="font-nourdMedium text-[9px] md:text-[10px] tracking-widest uppercase opacity-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cuadrícula de los números */}
        <div className="grid grid-cols-7 gap-y-5 gap-x-2 text-center text-sm md:text-base font-nourdLight">
          {calendarDays.map((day, index) => {
            const isTargetDay = day === targetDay;
            return (
              <div
                key={`day-${index}`}
                className="relative flex justify-center items-center h-8 md:h-9"
              >
                {day ? (
                  <>
                    <span
                      className={cn(
                        "z-10",
                        isTargetDay
                          ? "font-nourdMedium text-[#FDFBF7]"
                          : "opacity-90",
                      )}
                    >
                      {day}
                    </span>
                    {/* Dibujar el corazón si es el día del evento */}
                    {isTargetDay && (
                      <HandDrawnHeart className="absolute w-12 h-12 md:w-14 md:h-14 text-[#C5A669] opacity-80 z-0" />
                    )}
                  </>
                ) : (
                  <span></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DynamicCalendar;