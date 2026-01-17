import { Timestamp, FieldValue } from "firebase/firestore";

export type GuestFormData = {
  id?: string; // Opcional al registrar
  nombre: string;
  invitados: number;
  asistencia: boolean | null;
  confirmados: number | null;
  notaInvitado: string | null;
  telefono: string | null;
  notaAnfitrion: string | null;
  cambiosPermitidos: boolean;
};

export type Guest = {
  id: string;
  nombre: string;
  invitados: number;
  asistencia: boolean | null;
  confirmados: number | null;
  notaAnfitrion: string | null;
  tieneTelefono: boolean;
  notaInvitado: string | null;
  cambiosPermitidos: boolean;
  fechaCreacion: Timestamp | FieldValue | null;
  ultimaModificacion: Timestamp | FieldValue | null;
};

export type GuestContactInfo = {
  telefono: string | null;
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
  rejected: number;
  pending: number;
  count: number;
}

export type FilterType = "all" | "confirmed" | "pending" | "rejected";

export interface FilterCounts {
  all: number;
  confirmed: number;
  rejected: number;
  pending: number;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger: boolean;
  isLoading: boolean;
  action: (() => Promise<void>) | null;
}
