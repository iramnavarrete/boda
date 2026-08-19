import type { InvitationConfig } from "../shared/types";

/**
 * Configuración de la invitación: Andrea & Adrián.
 */
const andreaAdrianConfig: InvitationConfig = {
  slug: "andrea-adrian",

  sealConfig: {
    // Las iniciales se calculan automáticamente a partir del nombre
    // (en `InvitationFrame.resolveSealConfig`).
    sealColor: "#5b0012",
    textColor: "#FFF",
  },

  sidebars: {
    flowersClassName: "text-[#5b0012]",
    textClassName: "text-[#5b0012]",
  },

  sections: {
    cover: {
      isSealVisible: false, // controlado por el sobre
      textAlign: "left",
      eventTitleClassName: "text-[32px]",
      imagesConfig: [
        {
          src: "/img/andrea-adrian/gallery/g7.webp",
          style: { backgroundPosition: "55%" },
        },
        {
          src: "/img/andrea-adrian/gallery/g8.webp",
          style: { backgroundPosition: "center" },
        },
        {
          src: "/img/andrea-adrian/gallery/g9.webp",
          style: { backgroundPosition: "center" },
        },
      ],
      musicIconClassName: "text-[#5b0012]",
      musicContainerClassName: "bg-[#fff7f9]",
    },

    quote: {
      svgColor: "#5b0012",
      containerClassname: "bg-[#5b0012]",
      quote:
        "El destino me ha premiado, pues a mi lado te ha puesto. Y para serte honesto, mi corazón está de fiesta, porque desde que tú llegaste, mi historia está completa.",
    },

    parents: {
      containerClassName: "border-[#5b0012] bg-[#fff7f9]",
      textClassName: "text-[#5b0012]",
      svgsColor: "#5b0012",
      addToCalendarBtnClassName: "text-[#5b0012] border-[#5b0012]",
      bottomWavesColor: "#fff7f9",
      calendarOptions: {
        className: "bg-[#5b0012]",
        hearthClassName: "text-[#b73c58]",
        showOnlyWeek: false,
      },
    },

    countDown: {
      backgroundImage: "/img/andrea-adrian/gallery/g6.webp",
    },

    dressCode: {
      svgsColor: "#5b0012",
      textClassName: "text-[#5b0012]",
      containerClassName: "#f3ede1",
      textDressCode: "Formal / Vaquero",
      hasNoDinner: true,
      onlyText: true,
      textRestrictions: [
        "NO MEZCLILLA AZUL",
        "NO TONOS VINO / BORGOÑA",
        "¡NO BLANCO!",
      ],
    },

    gallery: {
      svgsColor: "#5b0012",
      containerClassName: "bg-[#3f3ede1]",
      textClassName: "text-[#5b0012]",
      slides: [
        {
          src: "/img/andrea-adrian/gallery/g6.webp",
          alt: "Imagen de la galería 6",
          thumb: "/img/andrea-adrian/gallery/thumbs/g6.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g6.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g1.webp",
          alt: "Imagen de la galería 1",
          thumb: "/img/andrea-adrian/gallery/thumbs/g1.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g1.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g4.webp",
          alt: "Imagen de la galería 4",
          thumb: "/img/andrea-adrian/gallery/thumbs/g4.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g4.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g3.webp",
          alt: "Imagen de la galería 3",
          thumb: "/img/andrea-adrian/gallery/thumbs/g3.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g3.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g5.webp",
          alt: "Imagen de la galería 5",
          thumb: "/img/andrea-adrian/gallery/thumbs/g5.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g5.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g7.webp",
          alt: "Imagen de la galería 7",
          thumb: "/img/andrea-adrian/gallery/thumbs/g7.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g7.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g8.webp",
          alt: "Imagen de la galería 8",
          thumb: "/img/andrea-adrian/gallery/thumbs/g8.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g8.webp",
        },
        {
          src: "/img/andrea-adrian/gallery/g9.webp",
          alt: "Imagen de la galería 9",
          thumb: "/img/andrea-adrian/gallery/thumbs/g9.webp",
          msrc: "/img/andrea-adrian/gallery/thumbs/g9.webp",
        },
      ],
    },

    gifts: {
      containerClassName: "bg-[#5b0012]",
      showCash: true,
      transfer: {
        bank: "bbva",
        cardNumber: "4815 1630 5099 1002",
        beneficiary: "Andrea Lara",
      },
    },

    assistants: {
      svgsColor: "#5b0012",
      textClassName: "text-[#5b0012]",
      btnClassName: "text-[#5b0012] border-[#5b0012] bg-gold/5",
      containerClassName: "#f3ede1",
      activeConfirmBtnClassName:
        "bg-transparent text-[#5b0012] border-[#5b0012]",
      inactiveConfirmBtnClassName:
        "bg-transparent text-stone-400 border-stone-300",
      activeDeclineBtnClassName:
        "bg-transparent text-[#5b0012] border-[#5b0012]",
      inactiveDeclineBtnClassName:
        "bg-transparent text-stone-400 border-stone-300",
      sendFormBtnClassName: "text-[#5b0012] border-[#5b0012]",
      sealImage: "/img/andrea-adrian/sello-guinda.png",
    },

    qrPhotos: {
      urlPhotos: "https://photos.app.goo.gl/CvX5tzkMZpkL1Hv36",
      btnClassName: "text-accent",
      containerClassName: "bg-[#5b0012]",
    },

    footer: {
      textClassName: "text-[#5b0012]",
      containerClassName: "bg-gold/5",
      svgsColor: "#5b0012",
    },

    audio: {
      musicPath: "/music/exist-for-love.mp3",
      mediaMetadata: {
        title: "Nuestra boda",
        artist: "Andrea & Adrian",
        album: "JN Invitaciones",
      },
    },
  },
};

export default andreaAdrianConfig;
