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

export interface GalleryImage {
  src: string; // Ruta de la imagen de alta resolución para PhotoSwipe
  msrc?: string; // Opcional: miniatura de baja resolución para preloader
  alt: string; // Texto alternativo para la imagen
  width: number; // Ancho de la imagen de alta resolución
  height: number; // Alto de la imagen de alta resolución
  thumb: string; // Ruta de la miniatura/imagen para React-Slick
}
