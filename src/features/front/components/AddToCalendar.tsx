import { cn } from "@heroui/theme";
import { useInvitationStore } from "../stores/invitationStore";
import { getEventTypeName } from "@/utils/formatters";


export default function AddToCalendar({addToCalendarBtnClassName = ''}: {addToCalendarBtnClassName?: string;}) {
  // Extraemos la información directamente desde Zustand
  const invitationData = useInvitationStore((state) => state.invitationData);

  // Si por alguna razón la información aún no carga, no renderizamos el botón o evitamos fallos
  if (!invitationData || !invitationData.fechaISO) return null;

  const abrirCalendario = () => {
    // 0. Detectar plataforma dinámicamente al hacer clic (Evita errores de SSR y re-renders)
    const ua = navigator.userAgent.toLowerCase();
    let platform = "google"; // fallback general

    if (/iphone|ipad|macintosh/.test(ua)) {
      platform = "apple";
    } else if (/outlook/.test(ua)) {
      platform = "outlook";
    }

    // 1. Construir Título Dinámico
    const eventType = getEventTypeName(invitationData.tipo);
    const titulo = `${eventType} de ${invitationData.nombre}`;
    
    // 2. Construir Descripción Dinámica
    let descripcion = `¡Te esperamos para celebrar este día tan especial!\n\n`;
    
    if (invitationData.ceremonia?.nombreTemplo) {
      descripcion += `Ceremonia: ${invitationData.ceremonia.nombreTemplo}\n${invitationData.ceremonia.enlaceMaps || ''}\n\n`;
    }
    
    if (invitationData.recepcion?.nombreSalon) {
      descripcion += `Recepción: ${invitationData.recepcion.nombreSalon}\n${invitationData.recepcion.enlaceMaps || ''}\n`;
    }

    // 3. Ubicación
    const ubicacion = invitationData.recepcion?.nombreSalon 
      ? `${invitationData.recepcion.nombreSalon}, ${invitationData.recepcion.direccion || ''}`
      : "Ubicación por confirmar";

    // 4. Fechas Dinámicas
    // Usamos el fechaISO que ya configuramos en el servidor (que incluye el día + hora de recepción)
    const startDate = new Date(invitationData.fechaISO!);
    // Calculamos 5 horas de duración por defecto para el evento
    const endDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000); 

    // Formateador para obtener "YYYYMMDDTHHMMSSZ" (Requerido por Google y Apple)
    const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    
    const fechaInicioUTC = formatICSDate(startDate);
    const fechaFinUTC = formatICSDate(endDate);

    // 5. Lógica por plataforma
    if (platform === "google") {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        titulo
      )}&details=${encodeURIComponent(
        descripcion
      )}&location=${encodeURIComponent(
        ubicacion
      )}&dates=${fechaInicioUTC}/${fechaFinUTC}`;
      
      window.open(url, "_blank");
      
    } else if (platform === "outlook") {
      // Outlook Live soporta el formato ISO estándar con la 'Z' al final
      const startDt = startDate.toISOString().split('.')[0] + 'Z';
      const endDt = endDate.toISOString().split('.')[0] + 'Z';
      
      const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
        titulo
      )}&body=${encodeURIComponent(descripcion)}&location=${encodeURIComponent(
        ubicacion
      )}&startdt=${startDt}&enddt=${endDt}`;
      
      window.open(url, "_blank");
      
    } else if (platform === "apple") {
      const uid = `evento-${invitationData.id}-${Date.now()}@jninvitaciones.com`;

      // Se usa un regex para cambiar saltos de línea normales por los "\n" literales requeridos en formato .ics
      const contenidoICS = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//boda//jninvitaciones.com//ES
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${fechaInicioUTC}
DTSTART:${fechaInicioUTC}
DTEND:${fechaFinUTC}
SUMMARY:${titulo}
DESCRIPTION:${descripcion.replace(/\n/g, '\\n')}
LOCATION:${ubicacion}
END:VEVENT
END:VCALENDAR`.trim();

      const blob = new Blob([contenidoICS], {
        type: "text/calendar;charset=utf-8",
      });
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(blob);
      enlace.download = `${invitationData.id}.ics`;
      enlace.click();
    }
  };

  return (
    <button
      className={cn("border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary", addToCalendarBtnClassName)}
      onClick={abrirCalendario}
    >
      Agregar al Calendario
    </button>
  );
}
