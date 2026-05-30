
const HandDrawnHeart = ({ className }: {className?: string}) => (
  <svg
    className={className || ""}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50.4,83.6 C28.3,66.5 12.9,49.8 14.6,30.2 C15.5,19.2 24.3,12.7 34.6,13.8 C42.1,14.6 47.9,23.5 50.4,28.8 C52.7,23.1 58.7,14.7 66.8,13.4 C77.5,13.0 85.1,21.6 84.8,32.7 C84.3,51.8 67.2,69.5 50.4,83.6 Z"
      stroke="currentColor"
      strokeWidth="3.5"
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
    <div className="bg-[#606954] text-[#e8e6d9] p-8 md:p-12 rounded-xl max-w-sm w-full mx-auto shadow-lg flex flex-col items-center">
      {/* Cabecera del Mes y Año */}
      <h2 className="font-cursive text-5xl md:text-6xl mb-8 tracking-wider text-center">
        {currentMonthName} {year}
      </h2>

      {/* Contenedor de la cuadrícula del calendario */}
      <div className="w-full">
        {/* Encabezado de los días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-4 text-center">
          {weekDays.map((day, index) => (
            <div
              key={`weekday-${index}`}
              className="font-medium text-sm md:text-base opacity-90"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cuadrícula de los números */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm md:text-base font-light">
          {calendarDays.map((day, index) => {
            const isTargetDay = day === targetDay;
            return (
              <div
                key={`day-${index}`}
                className="relative flex justify-center items-center h-8"
              >
                {day ? (
                  <>
                    <span className="z-10">{day}</span>
                    {/* Dibujar el corazón si es el día del evento */}
                    {isTargetDay && (
                      <HandDrawnHeart className="absolute w-14 h-14 md:w-16 md:h-16 text-[#e8e6d9] opacity-80 z-0 transform -translate-y-0.5 -rotate-6" />
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