import { Timestamp, FieldValue } from "firebase/firestore";

declare module "react" {
  interface TextareaHTMLAttributes {
    style?: React.CSSProperties & { fieldSizing?: "content" | "fixed" };
  }
}

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
  etiqueta?: string | null;
  fechaLimiteConfirmacion?: string | null;
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
  whatsappEnviado?: boolean;
  fechaWhatsappEnviado?: Timestamp | FieldValue | null;
  etiqueta?: string | null;
  fechaLimiteConfirmacion?: string | null;
  recordatorioEnviado?: boolean;
  fechaRecordatorioEnviado?: Timestamp | FieldValue | null;
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

export interface FilterCounts {
  all: number;
  confirmed: number;
  partial: number;
  rejected: number;
  pending: number;
}

export type FilterType = keyof FilterCounts;

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger: boolean;
  isLoading: boolean;
  action: (() => Promise<void>) | null;
}

interface Padres {
  mama: string;
  papa: string;
}

export interface Invitation {
  id: string;
  nombre: string;
  fecha: Timestamp;
  ubicacion?: string;
  padresNovia: Padres;
  padresNovio: Padres;
  tipo: string;
  imagenPortada?: string;
  recepcion: EventLocation;
  ceremonia: EventLocation;
  usuariosPermitidos: string[];
  fechaISO?: string;
}

// Tipo auxiliar para las escalas de color completas (50-950)
type ColorScale = {
  DEFAULT: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type ThemeColors = {
  // Colores base del proyecto
  primary: ColorScale;
  accent: string;
  "cool-gray": string;
  "button-dark": string;
  "button-light": string;
  "border-button": string;
  paper: string;
  gold: ColorScale;
  danger: ColorScale;
  sand: ColorScale & { light: string }; // Incluye 'light' por compatibilidad con tu código actual
  charcoal: ColorScale;
  status: {
    confirmed: string;
    pending: string;
    rejected: string;
  };
};

interface GuestQuote {
  id: string;
  autor: string;
  parentesco: string;
  mensaje: string;
  fechaCreacion: number;
  fechaModificacion: number;
  leido: boolean;
  asistencia: boolean;
}

export type EventType = "boda" | "xv_anos" | "bautizo" | "cumpleanos" | string;

export interface EventLocation {
  nombreTemplo?: string;
  nombreSalon?: string;
  hora: string;
  direccion: string;
  enlaceMaps: string;
}

export type Modify<T, R> = Omit<T, keyof R> & R;

export type FirestoreResult<T> = Promise<{
  result: T | null;
  error: FirestoreErrorCode | null;
}>;

export type ActivityActionType = "view" | "confirm" | "decline";

export interface GuestActivity {
  id?: string;
  guestId: string;
  guestName: string;
  action: ActivityActionType;
  confirmedGuests?: number | null;
  timestamp: Timestamp;
}

// --- NUEVOS TIPOS PARA EL FILTRO DE WHATSAPP ---
export type WhatsappFilterType = "all" | "sent" | "not_sent" | "empty";

export interface WhatsappCounts {
  all: number;
  sent: number;
  not_sent: number;
  empty: number;
}

export type TagFilterType = "all" | "Novia" | "Novio" | "Ambos";

export interface TagCounts {
  all: number;
  Novia: number;
  Novio: number;
  Ambos: number;
}
export interface ImportedGuest {
  nombre: string;
  invitados: number;
  telefono: string;
  notaAnfitrion: string;
}
