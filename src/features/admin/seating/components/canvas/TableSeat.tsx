import Tooltip from "@/features/shared/components/Tooltip";

interface TableSeatProps {
  x: number;
  y: number;
  isDragging: boolean;
  isAssigned: boolean;
  seatNumber: number;
  guestName?: string;
  colorBg?: string;
  colorBorder?: string;
}

export function TableSeat({
  x,
  y,
  isDragging,
  isAssigned,
  seatNumber,
  guestName,
  colorBg = "#EBECEF",
  colorBorder = "#A8AEBA",
}: TableSeatProps) {
  
  // 🔥 Le damos las medidas exactas (w-7 h-7) y shrink-0 directo al círculo
  const innerContent = (
    <div
      className="w-7 h-7 rounded-full border-2 shadow-sm relative flex items-center justify-center transition-colors duration-200 shrink-0"
      style={{
        backgroundColor: isAssigned ? colorBg : "#EBECEF",
        borderColor: isAssigned ? colorBorder : "#A8AEBA",
      }}
    >
      <span
        className="text-[10px] font-bold"
        style={{ color: isAssigned ? "#2C2C29" : "#A8A29E" }}
      >
        {seatNumber}
      </span>
    </div>
  );

  // El contenedor posicionador solo se encarga de ubicar el elemento en las coordenadas X y Y
  const wrapperClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center";
  const wrapperStyle = { left: x, top: y, opacity: isDragging ? 0.3 : 1 };

  if (isAssigned && guestName) {
    return (
      <div className={wrapperClasses} style={wrapperStyle}>
        <Tooltip text={guestName}>{innerContent}</Tooltip>
      </div>
    );
  }

  return (
    <div className={wrapperClasses} style={wrapperStyle}>
      {innerContent}
    </div>
  );
}