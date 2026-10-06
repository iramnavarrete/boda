import type { XvInvitationConfig } from "../shared/XvInvitationPage";
import StarsBorder from "@/icons/seal/stars-border";
import XVAñosSealLogo from "@/icons/specificInvitation/XVAñosSealLogo";

/**
 * Configuración de la invitación: Valentina · Mis XV Años.
 *
 * Variante **SAPHIRE** (azul navy + plata/sky).
 *
 * Misma estructura que `sofia-xv.config.tsx` (emerald + gold), pero
 * con `theme: "sapphire"` en el config — el wrapper raíz emite
 * `data-xv-theme="sapphire"` y las CSS variables cambian todos los
 * colores automáticamente. NO hay que duplicar componentes.
 *
 * Las fotos las provee el cliente (mismo naming convention):
 *   /img/valentina-xv/cover.png     — hero horizontal full-width
 *   /img/valentina-xv/bosque.jpg    — parallax del bosque encantado
 */

const valentinaXvConfig: XvInvitationConfig = {
  slug: "valentina-xv-sapphire",
  theme: "sapphire",

  // Sin meta description pública
  metaDescription: "",
  // Favicon por theme — sapphire.ico (Valentina usa sapphire)
  favicon: "/favicons/xv/sapphire.ico",

  // ─── Sello: SVG genérico de XV Años (corona + XV + AÑOS + decoraciones).
  //   Fondo plateado + decoraciones navy (inversión del emerald).
  sealConfig: {
    customSvg: <XVAñosSealLogo className="h-full w-full p-2 -translate-y-1" />,
    borderSvg: <StarsBorder className="w-full h-full translate-y-0.5" />,
    sealColor: "#1c2c3f", // gold-400 fallback (theme-aware si usas tokens)
    textColor: "#fff", // blanco/light para las decoraciones
  },

  // ─── Sobre: cuerpo azul navy + bordes plata ──────────────────────
  envelopeColors: {
    body: "#1c2c3f", // navy-850 — sobre y carta interior en azul
    border: "#030814", // silver-500 — solapas/bordes en plata
  },

  // Cormorant Garamond: títulos serif del cover/welcome/venue/dresscode
  // Cinzel: pretítulos uppercase con tracking ancho
  // Montserrat: párrafos y descripciones
  fonts: ["cormorant", "cinzel", "montserrat"],

  // ─── Contenido de las 12 secciones ──────────────────────────────
  sections: {
    // 1. Cover — UNA imagen hero con parallax.
    monograma: "V",
    coverImage: "/img/valentina-xv/cover.png",
    preTitle: "MIS XV AÑOS",

    // 2. WelcomeQuote
    welcome: {
      emblem: "❧ ✦ ❧",
      preTitle: "La noche estrellada brilla para Valentina",
      heading: "Un sueño entre\nconstelaciones",
      quote:
        "Hay momentos en la vida que son especiales por sí solos, pero compartirlos bajo el manto de las estrellas con las personas que más amo es lo que los vuelve verdaderamente eternos e inolvidables.",
      closingLine: "Acompañame a dar inicio a este nuevo capítulo de mi vida.",
    },

    // 3. BlessingParents
    blessing: {
      preTitle: "Con la bendición de Dios y el amor de",
      parentsHeading: "Mis Padres",
      padre: "Roberto Hernández Lugo",
      madre: "Mariana Castro de Hernández",
      godparentsHeading: "Mis padrinos",
      padrino1: "Fernando Hernández Castro",
      padrino2: "Isabela Lugo de Hernández",
    },

    // 4. CountDownBox
    countdown: {
      targetDate: "2027-04-17T19:00:00",
      heading: "La Noche Mágica se Acerca",
      calendarUrl:
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=XV+Años+de+Valentina" +
        "&dates=20270418T000000Z/20270418T090000Z" +
        "&details=Celebración+de+XV+Años+de+Valentina" +
        "&location=Salón+Cristal+Aguascalientes",
    },

    // 5. ParallaxTransition (cielo estrellado)
    parallax: {
      imageUrl: "/img/xv/sapphire/blue-scene.png",
      emblem: "✧ ✦ ✧",
      quote:
        "En algún lugar entre las estrellas, se escriben las historias que vale la pena recordar.",
      caption: "Y una nueva estrella comienza a brillar",
    },

    // 6. VenueSection
    venue: {
      preTitle: "El Escenario",
      heading: "Un Lugar de Encanto",
      receptionBadgeText: "Recepción y fiesta",
      venueImage: "/img/salon/quinta-la-isla.jpg",
      venueName: "Salón Cristal Aguascalientes",
      address:
        "Av. Universidad 1002, Trojes de Alonso, 20123 Aguascalientes, Ags.",
      description:
        "La recepción se llevará a cabo en el salón principal bajo luces colgantes azuladas. Te recomendamos traer abrigo para la velada.",
      eventTime: "20:30 HRS",
      googleMapsUrl: "https://maps.google.com/?q=Salon+Cristal+Aguascalientes",
      wazeUrl: "https://waze.com/ul?q=Salon+Cristal+Aguascalientes",
      // Card opcional de ceremonia (misma imagen de placeholder por ahora).
      // Quitar este bloque si la invitación no tiene ceremonia separada.
      ceremony: {
        venueImage: "/img/salon/quinta-la-isla.jpg",
        venueName: "Catedral Basílica de Aguascalientes",
        address: "Plaza de la Patria, Centro, 20000 Aguascalientes, Ags.",
        eventTime: "19:00 HRS",
        googleMapsUrl:
          "https://maps.google.com/?q=Catedral+Basilica+de+Aguascalientes",
      },
    },

    // 7. VerticalTimeline (itinerario)
    timeline: {
      preTitle: "Paso a Paso",
      heading: "La Celebración",
      items: [
        {
          time: "19:00 HRS",
          title: "Ceremonia Religiosa",
          subtitle: "Catedral Basílica",
          icon: "Church",
          description:
            "Misa de acción de gracias para bendecir mis 15 años de vida y sueños.",
        },
        {
          time: "20:30 HRS",
          title: "Recepción & Cocktail",
          subtitle: "Salón Principal",
          icon: "Martini",
          description:
            "Bienvenida con bebidas de autor, bocadillos finos y música ambiental.",
        },
        {
          time: "22:00 HRS",
          title: "Vals Mágico & Brindis",
          subtitle: "El Momento Más Soñado",
          icon: "Music",
          description:
            "Acompaña a Valentina en su primer vals familiar y el brindis de honor.",
        },
        {
          time: "22:30 HRS",
          title: "Cena & Gran Fiesta",
          subtitle: "Pista de Baile Iluminada",
          icon: "UtensilsCrossed",
          description:
            "Música, sorpresas y celebración hasta el amanecer bajo las estrellas.",
        },
      ],
    },

    // 8. DressCodeSection — colores reservados para la quinceañera
    dressCode: {
      preTitle: "Código de Vestimenta",
      heading: "Formal / Elegante",
      description: "Damas · Vestido largo \nCaballeros · Traje oscuro",
      reservedColorsPreTitle: "Colores Reservados",
      respectfulNote:
        "Agradecemos a nuestros invitados EVITAR vestir prendas en esta gama de tonalidades y respetar el código de vestimenta.",
      colorPaletteColumns: 5,
      colorPalette: [
        { hex: "#5389af", name: "Azul Cielo" },
        { hex: "#416f90", name: "Azul Acero" },
        { hex: "#2b5470", name: "Azul Media" },
        { hex: "#1c3a54", name: "Azul Profundo" },
        { hex: "#091f34", name: "Azul Noche" },
        { hex: "#aabed7", name: "Azul Polvo" },
        { hex: "#8a9cb2", name: "Azul Gris" },
        { hex: "#6b7b92", name: "Azul Slate" },
        { hex: "#4c5c73", name: "Azul Medianoche" },
        { hex: "#2d384a", name: "Azul Profundo 2" },
      ],
    },

    // 8.5 Gallery — carrusel con PhotoSwipe full-screen (componente XV propio).
    //     Convención de paths: /img/valentina-xv/gallery/gN.jpg + thumbs/gN-thumb.jpg
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
          src: "/img/xv/sapphire/cover.png",
          thumb: "/img/xv/sapphire/cover.png",
          alt: "Valentina · portada principal",
          caption: "Un sueño hecho realidad",
          subcaption: "Gala de Quinceañera",
        },
        {
          src: "/img/xv/sapphire/blue-scene.png",
          thumb: "/img/xv/sapphire/blue-scene.png",
          alt: "Valentina · escena estrellada",
          caption: "El brillo de una nueva estrella",
          subcaption: "Noche Estrellada",
        },
        {
          src: "/img/salon/quinta-la-isla.jpg",
          thumb: "/img/salon/quinta-la-isla.jpg",
          alt: "Salón Cristal · salón principal",
          caption: "El escenario perfecto",
          subcaption: "Salón Cristal Aguascalientes",
        },
      ],
    },

    // 9. (SongPlayerSection se renderiza desde el store de audio —
    //     no requiere bloque en el config porque el metadata vive en
    //     `audio.mediaMetadata`).

    // 10. WhatsAppRSVP
    rsvp: {
      phone: "5214491234567",
      message:
        "¡Hola Valentina! Con mucho gusto confirmo mi asistencia a tus XV Años",
      deadline: "2027-04-05",
      preTitle: "R. S. V. P.",
      heading: "Confirma tu Asistencia",
      outerDescription:
        "Cada lugar en el salón cuenta una historia. Tu presencia es el mejor regalo para celebrar mis quince años.",
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
        bank: "Santander",
        beneficiary: "Valentina Hernández Castro",
        cardNumber: "5477 1200 9988 1122",
      },
    },

    // 12. EnchantedFooter
    footer: {
      svgsColor: "#06112a",
    },
    qrPhotos: {
      urlPhotos: "https://www.google.com.mx",
    },
  },

  // ─── Audio (placeholder: track existente hasta que llegue vals-estrellas.mp3) ───
  audio: {
    musicPath: "/music/creo-en-ti.mp3",
    fadeMs: 1000,
    mediaMetadata: {
      title: "Mis XV Años · Valentina",
      artist: "Valentina Hernández",
      album: "JN Invitaciones",
    },
  },
};

export default valentinaXvConfig;
