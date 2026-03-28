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
export const brideName = "Yaneth";
export const groomName = "Josué";
export const weddingDate = new Date("2026-05-25T21:00:00");
export const weddingDateFormatted = `${weddingDate.getDate()} / ${
  monthsArray[weddingDate.getMonth()]
} / ${weddingDate.getFullYear()}`;
