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
