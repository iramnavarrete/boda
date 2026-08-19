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
          link:
            "https://www.amazon.com.mx/hz/wishlist/ls/3Z8K9QG2X7V1?ref_=wl_share",
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
