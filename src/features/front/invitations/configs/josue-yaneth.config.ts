import type { InvitationConfig } from "../shared/types";

/**
 * Configuración de la invitación: Josué & Yaneth.
 */
const josueYanethConfig: InvitationConfig = {
  slug: "josue-yaneth",

  sealConfig: undefined,

  sidebars: {
    // Defaults del tema.
  },

  timeline: {
    items: [
      { time: "4:00 PM", title: "Ceremonia religiosa", iconKey: "ceremonia" },
      { time: "7:45 PM", title: "Recepción", iconKey: "recepcion" },
      { time: "8:00 PM", title: "Rompehielos", iconKey: "cocktails" },
      { time: "9:15 PM", title: "Banquete", iconKey: "banquete" },
      { time: "9:45 PM", title: "Vals", iconKey: "vals" },
      { time: "10:00 PM", title: "Desarrollo de la fiesta", iconKey: "baile" },
      { time: "2:00 AM", title: "Fin del evento", iconKey: "despedida" },
    ],
    title: "Itinerario",
    subtitle: "Nuestro gran día",
    accentColor: "#58624f",
    styles: {
      eventTitleClassName: "text-[#58624f]",
      timeClassName: "text-[#58624f]/70",
      sectionSubtitle: "text-[#58624f]/80",
      sectionTitle: "text-[#58624f]",
    },
  },

  sections: {
    cover: {
      isSealVisible: false, // se sobreescribe en runtime según el sobre
    },

    quote: {},

    parents: {},

    countDown: {},

    dressCode: {
      forbiddenColors: [
        { hex: "#FFFFFF", name: "Blanco / Marfil" },
        { hex: "#78866B", name: "Verde Salvia" },
        { hex: "#556B2F", name: "Verde Olivo" },
        { hex: "#1E4D2B", name: "Verde Esmeralda" },
      ],
      textDressCode: "Formal / Vaquero",
      hasNoDinner: true,
    },

    gallery: {
      slides: [
        {
          src: "/img/gallery/g1.jpg",
          alt: "Imagen de la galería 1",
          thumb: "/img/gallery/thumbs/g1.jpg",
          msrc: "/img/gallery/thumbs/g1.jpg",
        },
        {
          src: "/img/gallery/g2.jpg",
          alt: "Imagen de la galería 2",
          thumb: "/img/gallery/thumbs/g2.jpg",
          msrc: "/img/gallery/thumbs/g2.jpg",
        },
        {
          src: "/img/gallery/g3.jpg",
          alt: "Imagen de la galería 3",
          thumb: "/img/gallery/thumbs/g3.jpg",
          msrc: "/img/gallery/thumbs/g3.jpg",
        },
        {
          src: "/img/gallery/g4.jpg",
          alt: "Imagen de la galería 4",
          thumb: "/img/gallery/thumbs/g4.jpg",
          msrc: "/img/gallery/thumbs/g4.jpg",
        },
        {
          src: "/img/gallery/g5.jpg",
          alt: "Imagen de la galería 5",
          thumb: "/img/gallery/thumbs/g5.jpg",
          msrc: "/img/gallery/thumbs/g5.jpg",
        },
        {
          src: "/img/gallery/g6.jpg",
          alt: "Imagen de la galería 6",
          thumb: "/img/gallery/thumbs/g6.jpg",
          msrc: "/img/gallery/thumbs/g6.jpg",
        },
        {
          src: "/img/gallery/g7.jpg",
          alt: "Imagen de la galería 7",
          thumb: "/img/gallery/thumbs/g7.jpg",
          msrc: "/img/gallery/thumbs/g7.jpg",
        },
        {
          src: "/img/gallery/g8.jpg",
          alt: "Imagen de la galería 8",
          thumb: "/img/gallery/thumbs/g8.jpg",
          msrc: "/img/gallery/thumbs/g8.jpg",
        },
        {
          src: "/img/gallery/g9.jpg",
          alt: "Imagen de la galería 9",
          thumb: "/img/gallery/thumbs/g9.jpg",
          msrc: "/img/gallery/thumbs/g9.jpg",
        },
        {
          src: "/img/gallery/g10.jpg",
          alt: "Imagen de la galería 10",
          thumb: "/img/gallery/thumbs/g10.jpg",
          msrc: "/img/gallery/thumbs/g10.jpg",
        },
      ],
    },

    gifts: {
      showCash: true,
      stores: [
        {
          type: "amazon",
          link: "https://www.amazon.com.mx/hz/wishlist/ls/3Z8K9QG2X7V1?ref_=wl_share",
          label: "Ver lista",
        },
      ],
      transfer: {
        bank: "bbva",
        beneficiary: "Beneficiario",
        cardNumber: "0000 0000 0000 0000",
      },
    },

    assistants: {},

    qrPhotos: {},

    footer: {},

    audio: {},
  },
};

export default josueYanethConfig;
