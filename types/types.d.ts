import { Timestamp, FieldValue } from "firebase/firestore";

export type GuestFormData = {
  id?: string; // Opcional al registrar
  nombre: string;
  invitados: number;
  asistencia: boolean | null;
  confirmados: number | null;
  mensaje: string | null;
  telefono: string | null;
  comentarios: string | null;
  cambiosPermitidos: boolean;
};

export type Guest = {
  id: string;
  nombre: string;
  invitados: number;
  asistencia: boolean | null;
  confirmados: number | null;
  mensaje: string | null;
  telefono: string | null;
  comentarios: string | null;
  cambiosPermitidos: boolean;
  fechaCreacion: Timestamp | FieldValue | null;
  ultimaModificacion: Timestamp | FieldValue | null;
};

export type GuestFormDataKeys = keyof GuestFormData;

export interface GalleryImage {
  src: string; // Ruta de la imagen de alta resolución para PhotoSwipe
  msrc?: string; // Opcional: miniatura de baja resolución para preloader
  alt: string; // Texto alternativo para la imagen
  width: number; // Ancho de la imagen de alta resolución
  height: number; // Alto de la imagen de alta resolución
  thumb: string; // Ruta de la miniatura/imagen para React-Slick
}

export interface DashboardStats {
  total: number;
  confirmed: number;
  count: number;
}
