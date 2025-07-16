export type FormObject = {
  id: string;
  asistencia: boolean | string;
  confirmados: string;
  mensaje: string;
};

export type SheetData = {
  id: string;
  nombre: string;
  pases: string;
  confirmados: string;
  asistencia: string;
  mensaje: string;
};

export type FormObjectKeys = keyof FormObject;
