import { EventType } from "@/types";
import { Timestamp } from "firebase/firestore";

const meses = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

export const formatTimeStamp = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  return `${date.getDate()} / ${meses[date.getMonth()]} / ${date.getFullYear()}`;
};

export const EVENT_TYPE_DICTIONARY: Record<string, string> = {
  boda: "Boda",
  xv_anos: "XV Años",
  bautizo: "Bautizo",
  cumpleanos: "Cumpleaños",
};

export const getEventTypeName = (type: EventType): string => {
  return EVENT_TYPE_DICTIONARY[type] || type;
};

export const formatToEventDate = (
  dateInput?: string | Date,
  onlyNumbers: boolean = false,
): string => {
  if (!dateInput) return "";

  try {
    // Convertimos la entrada a un objeto Date si es un string (ISO)
    const dateObj =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    // Verificamos que la fecha sea válida para evitar errores "Invalid Date"
    if (isNaN(dateObj.getTime())) return "";

    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = onlyNumbers
      ? String(dateObj.getMonth() + 1).padStart(2, "0")
      : meses[dateObj.getMonth()].toUpperCase();
    const anio = dateObj.getFullYear();

    return `${dia} / ${mes} / ${anio}`;
  } catch (error) {
    console.error("Error formateando la fecha:", error);
    return "";
  }
};

export const formatTo12Hour = (timeString: string) => {
  if (!timeString) return ""; // Por si viene vacío

  // Dividimos "21:00" en ["21", "00"]
  const [hourStr, minuteStr] = timeString.split(":");
  let hour = parseInt(hourStr, 10);

  // Determinamos si es AM o PM
  const ampm = hour >= 12 ? "PM" : "AM";

  // Convertimos a formato 12 horas
  hour = hour % 12;
  hour = hour ? hour : 12; // Si la hora es 0 (medianoche), la cambiamos a 12

  return `${hour}:${minuteStr} ${ampm}`;
};
