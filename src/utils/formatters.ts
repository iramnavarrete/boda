import { EventType } from "@/types";
import { Timestamp } from "firebase/firestore";

const monthsArray = [
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
  return `${date.getDate()} / ${monthsArray[date.getMonth()]} / ${date.getFullYear()}`;
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
