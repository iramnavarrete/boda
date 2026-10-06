import { Timestamp } from "firebase/firestore";
import type { Invitation } from "@/types";

/**
 * Invitaciones "fake" para desarrollo local.
 *
 * Sirven como mock cuando aún no existe el documento en Firestore.
 * Cualquier slug listado en `DEV_INVITATION_SLUGS` se resuelve desde
 * este módulo en lugar de pegarle a Firestore.
 *
 * ⚠️ Solo usar en desarrollo. Cuando se cree el documento real en
 * Firestore, elimina la entrada correspondiente de este archivo.
 *
 * Para agregar otra invitación fake:
 *   1. Agrega el slug al array `DEV_INVITATION_SLUGS`
 *   2. Agrega el objeto Invitation al map `DEV_INVITATIONS`
 */
export const DEV_INVITATION_SLUGS = [
  "sofia-xv",
  "valentina-xv-sapphire",
] as const;
export type DevInvitationSlug = (typeof DEV_INVITATION_SLUGS)[number];

/** Fecha del evento Sofía XV — 23 de enero de 2027, 17:00 hora local. */
const sofiaXvFecha = Timestamp.fromDate(new Date("2027-01-23T17:00:00"));

/** Objeto Invitation fake para /i/sofia-xv. */
const sofiaXvInvitation: Invitation & { id: string } = {
  id: "sofia-xv",
  nombre: "Sofía",
  fecha: sofiaXvFecha,
  ubicacion: "Quinta Real Aguascalientes",
  tipo: "xv_anos",
  imagenPortada: "/img/sofia-xv/cover-1.png",

  // Papás de los novios (vacíos — XV usa `padresQuinceanera`)
  padresNovia: { mama: "", papa: "" },
  padresNovio: { mama: "", papa: "" },

  // Ceremonia (Parroquia)
  ceremonia: {
    nombreTemplo: "Parroquia San Juan Bautista",
    hora: "17:00",
    direccion:
      "Av. Universidad 302, Jardines de la Asunción, 20270 Aguascalientes, Ags.",
    enlaceMaps:
      "https://maps.google.com/?q=Parroquia+San+Juan+Bautista+Aguascalientes",
  },

  // Recepción (Quinta Real)
  recepcion: {
    nombreSalon: "Quinta Real Aguascalientes",
    hora: "19:00",
    direccion:
      "Av. Aguascalientes Sur 801, Jardines de la Asunción, 20270 Aguascalientes, Ags.",
    enlaceMaps: "https://maps.google.com/?q=Quinta+Real+Aguascalientes",
  },

  // ─── Campos específicos XV ───────────────────────────────────────────
  padresQuinceanera: {
    mama: "Mariana González de Morales",
    papa: "Alejandro Morales Rivas",
  },
  padrinos: {
    nombre1: "Carlos Eduardo Morales",
    nombre2: "Valeria Ramos Estrada",
  },
  quinceanera: {
    monograma: "S",
  },
  rsvpPhone: "5214490000000",
  rsvpDeadline: "2027-01-10",
};

/** Fecha del evento Valentina XV — 17 de abril de 2027, 19:00 hora local. */
const valentinaXvFecha = Timestamp.fromDate(new Date("2027-04-17T19:00:00"));

/** Objeto Invitation fake para /i/valentina-xv-sapphire. */
const valentinaXvInvitation: Invitation & { id: string } = {
  id: "valentina-xv-sapphire",
  nombre: "Valentina",
  fecha: valentinaXvFecha,
  ubicacion: "Salón Cristal Aguascalientes",
  tipo: "xv_anos",
  imagenPortada: "/img/valentina-xv/cover.jpg",

  padresNovia: { mama: "", papa: "" },
  padresNovio: { mama: "", papa: "" },

  ceremonia: {
    nombreTemplo: "Catedral Basílica de Aguascalientes",
    hora: "19:00",
    direccion:
      "Av. Universidad esq. con Zaragoza, Centro, 20000 Aguascalientes, Ags.",
    enlaceMaps:
      "https://maps.google.com/?q=Catedral+Basilica+Aguascalientes",
  },

  recepcion: {
    nombreSalon: "Salón Cristal Aguascalientes",
    hora: "20:30",
    direccion:
      "Av. Universidad 1002, Trojes de Alonso, 20123 Aguascalientes, Ags.",
    enlaceMaps:
      "https://maps.google.com/?q=Salon+Cristal+Aguascalientes",
  },

  padresQuinceanera: {
    mama: "Mariana Castro de Hernández",
    papa: "Roberto Hernández Lugo",
  },
  padrinos: {
    nombre1: "Fernando Hernández Castro",
    nombre2: "Isabela Lugo de Hernández",
  },
  quinceanera: {
    monograma: "V",
  },
  rsvpPhone: "5214491234567",
  rsvpDeadline: "2027-04-05",
};

/** Map slug → Invitation fake. Type-safe con DevInvitationSlug. */
const DEV_INVITATIONS: Record<DevInvitationSlug, Invitation & { id: string }> =
  {
    "sofia-xv": sofiaXvInvitation,
    "valentina-xv-sapphire": valentinaXvInvitation,
  };

/**
 * Devuelve la Invitation fake si el slug está registrado como dev;
 * `null` en caso contrario (Firestore debe resolverlo).
 */
export function getDevInvitation(slug: string): Invitation | null {
  if ((DEV_INVITATION_SLUGS as readonly string[]).includes(slug)) {
    return DEV_INVITATIONS[slug as DevInvitationSlug];
  }
  return null;
}
