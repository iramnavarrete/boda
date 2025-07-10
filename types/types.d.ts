export type FormObject = {
  nombres: string;
  personas: number | string;
  felicitacion: string;
  asistencia: boolean | string;
};

export type FormObjectKeys = keyof FormObject;
