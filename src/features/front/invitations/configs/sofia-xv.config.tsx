import type { XvInvitationConfig } from "../shared/XvInvitationPage";
import StarsBorder from "@/icons/seal/stars-border";
import XVAñosSealLogo from "@/icons/specificInvitation/XVAñosSealLogo";

/**
 * Configuración de la invitación: Sofía · Mis XV Años.
 *
 * Emerald & Gold Luxury — basada en el mockup HTML propuesto,
 * mejorada con la arquitectura modular del proyecto Siena.
 *
 * Notas:
 *  - Las imágenes referencian rutas locales: súbelas a
 *    `/public/img/sofia-xv/` cuando estén listas. Si no existen,
 *    Next.js devolverá 404 pero la invitación seguirá renderizando.
 *  - La música usa `baby-im-yours-2.mp3` como placeholder
 *    (decisión confirmada en el plan). Cuando llegue `vals-mariposas.mp3`,
 *    cambialo aquí.
 *  - `fonts` carga Cormorant Garamond, Cinzel y Montserrat locales.
 */
const sofiaXvConfig: XvInvitationConfig = {
  slug: "sofia-xv",

  // Sin meta description pública
  metaDescription: "",
  // Favicon por theme — gold.ico para emerald (Sofia)
  favicon: "/favicons/xv/gold.ico",

  // ─── Sello: SVG genérico de XV Años (corona + XV + AÑOS + decoraciones).
  //   Fondo dorado (sealColor) + decoraciones verdes (textColor).
  sealConfig: {
    customSvg: <XVAñosSealLogo className="h-full w-full p-2 -translate-y-1" />,
    borderSvg: <StarsBorder className="w-full h-full translate-y-0.5" />,
    sealColor: "#cdb657", // gold-400 — fondo dorado del sello
    textColor: "#1a382d", // forest-700 — decoraciones del sello en verde
  },

  // ─── Sobre: cuerpo verde (body) + bordes dorados (border) ──────────
  envelopeColors: {
    body: "#0a1c15", // forest-700 — sobre y carta interior en verde
    border: "#293625", // gold-400 — solapas/bordes en dorado
  },

  // Fuentes XV — Cormorant (serif), Cinzel (display), Montserrat (sans).
  // Se cargan localmente vía next/font/local en el módulo `fonts/`.
  // Cormorant Garamond: títulos serif del cover/welcome/venue/dresscode
  // Cinzel: pretítulos uppercase con tracking ancho
  // Montserrat: párrafos y descripciones
  // (Mismas fonts que el theme de las bodas — el orchestrator las resuelve)
  fonts: ["cormorant", "cinzel", "montserrat"],

  // ─── Contenido de las 12 secciones ──────────────────────────────────
  sections: {
    // 1. Cover — UNA imagen hero con parallax (sin carrusel).
    //    El nombre/fecha se leen del store `invitationData`.
    monograma: "S",
    coverImage: "/img/sofia-xv/cover.jpg",
    preTitle: "MIS XV AÑOS",

    // 2. WelcomeQuote
    welcome: {
      emblem: "❧ ✦ ❧",
      preTitle: "La noche estrellada brilla para\nSofía",
      heading: "Un Sueño entre\nConstelaciones",
      quote:
        "Hay momentos en la vida que son especiales por sí solos, pero compartirlos bajo el manto de las estrellas con las personas que más amo es lo que los vuelve verdaderamente eternos e inolvidables.",
      closingLine: "Acompañame a dar inicio a este nuevo capítulo celestial.",
    },

    // 3. BlessingParents
    blessing: {
      preTitle: "Con la bendición de Dios y el amor de",
      parentsHeading: "Mis Padres",
      padre: "Alejandro Morales Rivas",
      madre: "Mariana González de Morales",
      godparentsHeading: "Guías y Compañía",
      godparentsSubtitle: "Mis Padrinos",
      padrino1: "Carlos Eduardo Morales",
      padrino2: "Valeria Ramos Estrada",
    },

    // 4. CountDownBox
    countdown: {
      // El orquestador resuelve esto desde invitationData.fechaISO;
      // aquí dejamos un fallback por si el admin no setea fechaISO aún.
      targetDate: "2027-01-23T17:00:00",
      heading: "La Noche Mágica se Acerca",
      calendarUrl:
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=XV+Años+de+Sofía" +
        "&dates=20270123T230000Z/20270124T080000Z" +
        "&details=Celebración+de+XV+Años+de+Sofía+en+Quinta+Real+Aguascalientes" +
        "&location=Quinta+Real+Aguascalientes",
    },

    // 5. ParallaxTransition (bosque encantado)
    parallax: {
      imageUrl: "/img/xv/esmerald/bosque.png",
      emblem: "✧ ✦ ✧",
      quote:
        "Detrás de cada instante congelado en el tiempo, vibra la dulce magia de un sueño que florece.",
      caption: "Un Cuento Hecho Realidad",
    },

    // 6. VenueSection
    venue: {
      preTitle: "El Escenario",
      heading: "Un Lugar de Encanto",
      receptionBadgeText: "Recepción y fiesta",
      venueImage: "/img/salon/quinta-la-isla.jpg",
      venueName: "Quinta Real Aguascalientes",
      address:
        "Av. Aguascalientes Sur 801, Jardines de la Asunción, 20270 Aguascalientes, Ags.",
      description:
        "La recepción se llevará a cabo en el jardín principal bajo cálidas luces colgantes. Te recomendamos traer abrigo para la velada.",
      eventTime: "17:00 HRS",
      googleMapsUrl: "https://maps.google.com/?q=Quinta+Real+Aguascalientes",
      wazeUrl: "https://waze.com/ul?q=Quinta+Real+Aguascalientes",
      // Card opcional de ceremonia (misma imagen de placeholder por ahora).
      // Quitar este bloque si la invitación no tiene ceremonia separada.
      ceremony: {
        venueImage: "/img/salon/quinta-la-isla.jpg",
        venueName: "Parroquia San Juan Bautista",
        address: "Av. Luis Donaldo Colosio 203, Trojes de Alonso, Ags.",
        eventTime: "16:00 HRS",
        googleMapsUrl:
          "https://maps.google.com/?q=Parroquia+San+Juan+Bautista+Aguascalientes",
      },
    },

    // 7. VerticalTimeline (itinerario)
    timeline: {
      preTitle: "Paso a Paso",
      heading: "La Celebración",
      items: [
        {
          time: "17:00 HRS",
          title: "Ceremonia Religiosa",
          subtitle: "Parroquia San Juan Bautista",
          icon: "Church",
          description:
            "Misa de acción de gracias para bendecir mis 15 años de vida y sueños.",
        },
        {
          time: "19:00 HRS",
          title: "Recepción & Cocktail",
          subtitle: "Jardín Principal · Quinta Real",
          icon: "Martini",
          description:
            "Bienvenida con bebidas de autor, bocadillos finos y música acústica.",
        },
        {
          time: "21:00 HRS",
          title: "Vals Mágico & Brindis",
          subtitle: "El Momento Más Soñado",
          icon: "Music",
          description:
            "Acompaña a Sofía en su primer vals familiar y el brindis de honor.",
        },
        {
          time: "22:00 HRS",
          title: "Cena & Gran Fiesta",
          subtitle: "Pista de Baile Iluminada",
          icon: "UtensilsCrossed",
          description:
            "Música, sorpresas y celebración hasta el amanecer bajo las estrellas.",
        },
      ],
    },

    // 8. DressCodeSection
    dressCode: {
      preTitle: "Código de Vestimenta",
      heading: "Formal / Elegante",
      description:
        "Vestido largo o midi para damas · Traje oscuro para caballeros",
      reservedColorsPreTitle: "Colores Reservados Exclusivamente",
      reservedColorsDescription:
        "Gama de Verdes Reservada para la Quinceañera y Corte de Honor",
      respectfulNote:
        "Agradecemos a nuestros distinguidos invitados evitar vestir prendas en esta gama de tonalidades verdes.",
      colorPalette: [
        { hex: "#1b4332", name: "Verde Esmeralda" },
        { hex: "#2d6a4f", name: "Verde Bosque" },
        { hex: "#40916c", name: "Verde Salvia" },
        { hex: "#52b788", name: "Verde Menta" },
        { hex: "#95d5b2", name: "Verde Pastel" },
        { hex: "#74c69d", name: "Verde Jade" },
        { hex: "#1b4332", name: "Verde Oscuro" },
        { hex: "#0d2818", name: "Verde Profundo" },
      ],
    },

    // 8.5 Gallery — carrusel con PhotoSwipe full-screen (componente XV propio).
    //     Convención de paths: /img/sofia-xv/gallery/gN.jpg + thumbs/gN-thumb.jpg
    //     Mientras el cliente sube las fotos, reusamos las imágenes existentes
    //     para que el preview muestre contenido.
    gallery: {
      preTitle: "Momentos Especiales",
      heading: "Galería de Recuerdos",
      emblem: "✦ ✧ ✦",
      customText:
        "Detrás de cada instante congelado en el tiempo, vibra la dulce magia de un momento que perdura para siempre.",
      slides: [
        {
          src: "/img/sofia-xv/cover.jpg",
          thumb: "/img/sofia-xv/cover.jpg",
          alt: "Sofía · retrato principal",
          caption: "El rostro del sueño",
          subcaption: "Retrato Editorial",
        },
        {
          src: "/img/sofia-xv/cover-1.png",
          thumb: "/img/sofia-xv/cover-1.png",
          alt: "Sofía · segundo retrato",
          caption: "Detalles que brillan con luz propia",
          subcaption: "Joyas de Gala",
        },
        {
          src: "/img/xv/esmerald/bosque.png",
          thumb: "/img/xv/esmerald/bosque.png",
          alt: "Sofía · bosque encantado",
          caption: "Un cuento hecho realidad",
          subcaption: "Bosque Encantado",
        },
        {
          src: "/img/salon/quinta-la-isla.jpg",
          thumb: "/img/salon/quinta-la-isla.jpg",
          alt: "Quinta Real · jardín principal",
          caption: "El escenario perfecto",
          subcaption: "Quinta Real Aguascalientes",
        },
      ],
    },

    // 9. (SongPlayerSection se renderiza desde el store de audio —
    //     no requiere bloque en el config porque el metadata vive en
    //     `audio.mediaMetadata`).

    // 10. WhatsAppRSVP
    rsvp: {
      // El orquestador prefiere invitationData.rsvpPhone si existe.
      phone: "5214490000000",
      message:
        "¡Hola Sofía! Con mucho gusto confirmo mi asistencia a tus XV Años",
      // El orquestador prefiere invitationData.rsvpDeadline.
      deadline: "2027-01-10",
      preTitle: "R. S. V. P.",
      heading: "Confirma tu Asistencia",
      outerDescription:
        "Cada lugar en el jardín cuenta una historia. Tu presencia es el mejor regalo para celebrar mis quince años.",
      innerTitle: "Confirmar Vía WhatsApp",
      innerDescription:
        "Envíanos tu nombre y el número de pases confirmados directamente.",
      ctaLabel: "Confirmar Asistencia",
    },

    // 11. Gifts (CashGiftCard + TransferAccordion)
    gifts: {
      description:
        "Tu presencia es mi mayor obsequio. Si deseas hacerme un detalle, dispondremos de un buzón para sobres el día del evento o vía transferencia.",
      transfer: {
        bank: "BBVA Bancomer",
        beneficiary: "Sofía Morales González",
        cardNumber: "4152 3138 7654 3210",
      },
    },

    // 12. Footer — usa el componente compartido de bodas con
    // variant="xv" (data del bloque previa de EnchantedFooter queda
    // en el config para referencia, pero ya no se renderiza).
    footer: {},
    qrPhotos: {
      urlPhotos: "https://www.google.com.mx"
    }
  },

  // ─── Audio (placeholder: track existente hasta que llegue vals-mariposas.mp3)
  audio: {
    musicPath: "/music/baby-im-yours-2.mp3",
    fadeMs: 1000,
    mediaMetadata: {
      title: "Mis XV Años · Sofía",
      artist: "Sofía Morales",
      album: "JN Invitaciones",
    },
  },
};

export default sofiaXvConfig;
