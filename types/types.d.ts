import { Timestamp, FieldValue } from "firebase/firestore";

declare module "react" {
  interface TextareaHTMLAttributes {
    style?: React.CSSProperties & { fieldSizing?: "content" | "fixed" };
  }
}

export type FamilyFormData = {
  id?: string; // Opcional al registrar
  nombre: string;
  invitados: number;
  asistencia: boolean | null;
  confirmados: number | null;
  notaInvitado: string | null;
  telefono?: string | null;
  notaAnfitrion: string | null;
  cambiosPermitidos: boolean;
  etiqueta?: string | null;
  fechaLimiteConfirmacion?: string | null;
  ninosPermitidos?: boolean | null;
};

export type Family = {
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
  asistio?: boolean;
  pasesUsados?: number;
  horaLlegada?: Timestamp | FieldValue | null;
  asientos?: GuestSeat[] | null;
  invitacionVista?: boolean | null;
  ninosPermitidos?: boolean | null;
};

export type FamilyContactInfo = {
  telefono: string | null;
};

export type FamilyFormDataKeys = keyof FamilyFormData;

export type GuestStatus = "confirmed" | "pending" | "declined";

export interface GuestSeat {
  id: string;
  nombre: string;
  estatus: GuestStatus;
}

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
  unopened: number;
}

export type FilterType = keyof FilterCounts;

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger: boolean;
  isLoading: boolean;
  showConfirmToast?: boolean;
  action: (() => Promise<void>) | null;
}

interface Padres {
  mama: string;
  papa: string;
}

/**
 * Padrinos de la quinceañera. Solo se usa cuando `tipo === "xv_anos"`.
 * En el admin modal se renderiza con dos campos de texto independientes.
 */
export interface Padrinos {
  nombre1: string;
  nombre2: string;
}

/**
 * Datos específicos de la quinceañera. Hoy solo `mometama` (la
 * inicial que va en el sello y los monogramas del cover/footer).
 * El nombre completo sigue siendo `invitation.nombre` para
 * mantener un solo "título" visible.
 */
export interface Quinceanera {
  monograma: string;
}

/**
 * Sugerencia de canción para la playlist de la XV Años.
 *
 * - Para familias invitadas (con `?family=` en la URL): se persiste
 *   en Firestore bajo `invitations/{id}/songs/{songId}`.
 * - Para invitados anónimos (sin family id): se mantiene sólo en
 *   memoria (useState) durante la sesión del visitante, sembrado
 *   con un repertorio de canciones por defecto.
 */
export interface SongSuggestion {
  id: string;
  /** Título de la canción. */
  title: string;
  /** Artista o grupo. */
  artist: string;
  /** Nombre de quien sugiere. Para familias invitadas, se autollenará
   *  con el nombre del grupo familiar. Para anónimos, viene del input. */
  suggestedBy: string;
  /** Timestamp de creación (Date.now() en memoria, serverTimestamp en Firestore). */
  createdAt: number;
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
  /**
   * Datos del evento de recepción. **Opcional** — se omite del payload
   * cuando todos sus sub-campos (`nombreSalon`, `hora`, `direccion`,
   * `enlaceMaps`) están vacíos. Esto permite crear invitaciones sin
   * recepción (ej. bodas sólo con misa, XV sólo con misa, etc.).
   */
  recepcion?: EventLocation;
  /**
   * Datos del evento de ceremonia. **Opcional** — mismo trato que
   * `recepcion`: se omite del payload si todos sus sub-campos están
   * vacíos.
   */
  ceremonia?: EventLocation;
  fechaISO?: string;
  configuracionVisual?: ConfiguracionVisual;
  /**
   * Mensajes custom de WhatsApp para esta invitación. Si se definen,
   * reemplazan al mensaje por defecto. Aceptan variables que se
   * sustituyen al enviar (ver `replaceWhatsappVariables`).
   */
  mensajeInicial?: string;
  mensajeRecordatorio?: string;

  // ─── XV AÑOS ────────────────────────────────────────────────────────────
  /** Papás de la quinceañera (XV). `padresNovio` se ignora en XV. */
  padresQuinceanera?: Padres;
  /** Padrinos que acompañan a la quinceañera en misa/recepción. */
  padrinos?: Padrinos;
  /** Datos específicos de la quinceañera (monograma para sello/monograma). */
  quinceanera?: Quinceanera;
  /** Teléfono WhatsApp del quinceañera/familia (incluye lada, sin '+'). */
  rsvpPhone?: string;
  /** Fecha límite para confirmar asistencia (ISO `YYYY-MM-DD`). */
  rsvpDeadline?: string;
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

interface FamilyQuote {
  id: string;
  autor: string;
  parentesco: string;
  mensaje: string;
  fechaCreacion: number;
  fechaModificacion: number;
  leido: boolean;
  asistencia?: boolean | null | "deleted";
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

export interface FamilyActivity {
  id?: string;
  familyId: string;
  familyName: string; // TODO ELIMINAR ESTE CAMPO
  guestName?: string;
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

export type TagFilterType =
  | "all"
  | "Novia"
  | "Novio"
  | "Ambos"
  | "Familia Paterna"
  | "Familia Materna"
  | "Amigos"
  | "Otros";

export interface TagCounts {
  all: number;
  Novia: number;
  Novio: number;
  Ambos: number;
}
export interface ImportedFamily {
  nombre: string;
  invitados: number;
  telefono?: string;
  notaAnfitrion?: string;
  ninosPermitidos?: boolean;
  /**
   * Etiqueta canónica. El set concreto aceptado depende del
   * `invitation.tipo` y se valida en el importador — ver
   * `etiquetaPorTipo.ts`. Mantener `string` libre para no romper
   * bodas existentes con "Novia"/"Novio"/"Ambos".
   */
  etiqueta?: string | null;
}

export interface ConfiguracionVisual {
  temaGlobal?: string;
  secciones?: {
    quote?: {
      mostrar: boolean;
    };
    padresYPadrinos?: {
      mostrar: boolean;
    };
    galeria?: {
      mostrar: boolean;
      variante: string;
    };
    mesaRegalos?: {
      mostrar: boolean;
      showCash: boolean;
    };
  };
  estilosComponentes?: {
    contador?: { textClassName?: string; btnClassName?: string };
    calendario?: {
      bgClassName?: string;
      textClassName?: string;
      heartClassName?: string;
    };
  };
  fondos?: {
    app?: string;
    contenedorCentral?: string;
  };
}

export type RoleType = "admin" | "host" | "guardia";

export interface UserDoc {
  uid: string;
  email: string;
  isRootAdmin: boolean;
  invitationsMap: Record<string, RoleType>;
  createdAt?: string;
}
