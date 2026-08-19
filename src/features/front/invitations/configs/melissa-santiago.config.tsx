import MelissaSantiagoLogo from "@/icons/specificInvitation/MelissaSantiagoLogo";
import MelissaSantiagoSealLogo from "@/icons/specificInvitation/MelissaSantiagoSealLogo";
import type { InvitationConfig } from "../shared/types";

/**
 * Configuración de la invitación: Melissa & Santiago.
 */
const melissaSantiagoConfig: InvitationConfig = {
  slug: "melissa-santiago",

  sealConfig: {
    customSvg: (
      <MelissaSantiagoSealLogo className="text-white h-10 w-10 -translate-x-[2px]" />
    ),
    textColor: "#fff",
    sealColor: "#252a33",
  },

  sidebars: {
    flowersClassName: "text-[#252a33]",
    textClassName: "text-[#252a33]",
  },

  accommodation: {
    config: {
      amenities: [
        { icon: "location", title: "Ubicación", desc: "Periférico de la Juventud" },
        { icon: "coffee", title: "Desayuno Buffet", desc: "Incluido" },
        { icon: "parking", title: "Estacionamiento", desc: "Gratuito" },
        {
          icon: "clock",
          title: "Horarios",
          desc: "Check-in 3 PM \n Check-out 1 PM",
        },
      ],
      hotelName: "Highland",
      location: "Perif. de la Juventud 3115, Puerta de Hierro",
      phones: ["614 142 1764", "614 587 1500"],
      reservationCode: "Boda Melissa Alvídrez & Santiago Mora",
      rooms: [
        {
          image: "/img/melissa-santiago/hotel/estandar.jpg",
          title: "Habitación estándar",
          price: "$1,600 MXN",
        },
        {
          image: "/img/melissa-santiago/hotel/doble.webp",
          title: "Habitación doble",
          price: "$1,720 MXN",
        },
        {
          image: "/img/melissa-santiago/hotel/estandar.jpg",
          title: "Habitación junior suite",
          price: "$1,840 MXN",
        },
      ],
      mapsLink: "https://maps.app.goo.gl/Z1kRyxDJEdMPdRWAA?g_st=ic",
    },
    styles: {
      mainContainer: "border-[#252a33] border-opacity-20",
      amenitiesGridContainer: "bg-[#252a33]",
      headerContainer: "bg-[#252a33]",
      roomsSectionContainer: "bg-[#252a33]",
      roomCard: "bg-paper text-[#252a33] border-[#252a33] border-0",
      contactSectionContainer: "bg-paper text-[#252a33]",
      contactButton: "hover:bg-[#252a33] hover:text-paper border-[#252a33]",
      mapsButton:
        "bg-[#252a33] hover:bg-paper hover:text-[#252a33] text-paper border-[#252a33]",
    },
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
    accentColor: "#252a33",
    styles: {
      eventTitleClassName: "text-[#252a33]",
      timeClassName: "text-[#252a33]/70",
      sectionSubtitle: "text-[#252a33]/80",
      sectionTitle: "text-[#252a33]",
    },
  },

  sections: {
    cover: {
      isSealVisible: false, // controlado por el sobre
      textAlign: "center",
      musicContainerClassName: "bg-white",
      musicIconClassName: "text-[#252a33]",
      musicButtonDelay: 4200,
      scrollIndicatorDelay: 4600,
      customTitleComponent: (
        <MelissaSantiagoLogo className="w-52 h-auto text-white overflow-visible" />
      ),
      eventTitleClassName: "flex justify-center",
      imagesConfig: [
        {
          src: "/img/melissa-santiago/gallery/g1.jpg",
          panStart: "55%",
          panEnd: "65%",
          titlePosition: "center",
        },
        {
          src: "/img/melissa-santiago/gallery/g4.jpg",
          panStart: "45%",
          panEnd: "35%",
          titlePosition: "bottom",
        },
        {
          src: "/img/melissa-santiago/gallery/g2.jpg",
          panStart: "68%",
          panEnd: "80%",
          titlePosition: "bottom",
        },
        {
          src: "/img/melissa-santiago/gallery/g3.jpg",
          panStart: "40%",
          panEnd: "50%",
          titlePosition: "bottom",
        },
        {
          src: "/img/melissa-santiago/gallery/g6.jpg",
          panStart: "62%",
          panEnd: "48%",
          titlePosition: "bottom",
        },
        {
          src: "/img/melissa-santiago/gallery/g5.jpg",
          panStart: "45%",
          panEnd: "55%",
          titlePosition: "top",
        },
      ],
    },

    quote: {
      svgColor: "#252a33",
      containerClassname: "bg-[#252a33]",
      quote:
        "Así que ya no son dos, sino uno solo. Por tanto, lo que Dios ha unido, que no lo separe nadie.",
      author: "Mateo 19:6",
    },

    parents: {
      bottomWavesColor: "#f9f7f2",
      containerClassName: "bg-paper",
      textClassName: "text-[#252a33]",
      svgsColor: "rgb(37 42 51 / 0.8)",
      addToCalendarBtnClassName: "text-[#252a33]",
      calendarOptions: {
        className: "bg-[#252a33]",
        heartActiveClassName: "text-paper",
        hearthClassName: "text-gold-800",
      },
      customLastPhrase:
        "Queremos compartir contigo el momento en que dos corazones, unidos por el amor de Dios, comienzan una vida para siempre.",
    },

    countDown: {
      backgroundImage: "/img/melissa-santiago/gallery/g7.jpg",
      panStart: "20%",
      panEnd: "65%",
    },

    dressCode: {
      containerClassName: "bg-paper",
      innerContainerClassName: "px-0 py-8",
      gapBetweenElements: 24,
      wavesColor: "#f9f7f2",
      svgsColor: "#252a33",
      forbiddenColors: "none",
      ceremonyImage: "/img/templo/sagrado-corazon.png",
      receptionImage: "/img/salon/monjes.jpg",
      showFlowersBg: false,
      womenConfig: {
        title: "Damas",
        subtitle: "Vestido largo de noche",
        restrictions:
          "Con el fin de preservar el protagonismo de la novia, agradecemos a nuestras invitadas evitar vestidos en tonos blancos o colores muy claros.",
        description:
          "Vestido largo de etiqueta acompañado de calzado y accesorios acordes a una celebración formal. Favor de evitar vestidos cortos o casuales.",
      },
      menConfig: {
        title: "Caballeros",
        subtitle: "Traje formal completo",
        description:
          "Traje formal con camisa de vestir, corbata o moño y zapatos de vestir. Se sugiere evitar prendas de estilo casual o vaquero.",
      },
      bothRestrictions:
        "Agradecemos su comprensión y apoyo respetando el código de vestimenta requerido por el salón.",
      sectionsContainerClassName: "gap-12 mb-0 mt-10",
    },

    gallery: {
      containerClassName: "bg-paper",
      slides: [
        {
          src: "/img/melissa-santiago/gallery/g8.jpg",
          alt: "Imagen de la galería 8",
          thumb: "/img/melissa-santiago/gallery/thumbs/g8.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g8.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g13.jpg",
          alt: "Imagen de la galería 13",
          thumb: "/img/melissa-santiago/gallery/thumbs/g13.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g13.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g14.jpg",
          alt: "Imagen de la galería 14",
          thumb: "/img/melissa-santiago/gallery/thumbs/g14.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g14.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g15.jpg",
          alt: "Imagen de la galería 15",
          thumb: "/img/melissa-santiago/gallery/thumbs/g15.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g15.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g17.jpg",
          alt: "Imagen de la galería 17",
          thumb: "/img/melissa-santiago/gallery/thumbs/g17.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g17.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g9.jpg",
          alt: "Imagen de la galería 9",
          thumb: "/img/melissa-santiago/gallery/thumbs/g9.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g9.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g10.jpg",
          alt: "Imagen de la galería 10",
          thumb: "/img/melissa-santiago/gallery/thumbs/g10.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g10.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g11.jpg",
          alt: "Imagen de la galería 11",
          thumb: "/img/melissa-santiago/gallery/thumbs/g11.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g11.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g19.jpg",
          alt: "Imagen de la galería 19",
          thumb: "/img/melissa-santiago/gallery/thumbs/g19.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g19.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g12.jpg",
          alt: "Imagen de la galería 12",
          thumb: "/img/melissa-santiago/gallery/thumbs/g12.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g12.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g21.jpg",
          alt: "Imagen de la galería 21",
          thumb: "/img/melissa-santiago/gallery/thumbs/g21.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g21.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g22.jpg",
          alt: "Imagen de la galería 22",
          thumb: "/img/melissa-santiago/gallery/thumbs/g22.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g22.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g23.jpg",
          alt: "Imagen de la galería 23",
          thumb: "/img/melissa-santiago/gallery/thumbs/g23.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g23.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g24.jpg",
          alt: "Imagen de la galería 24",
          thumb: "/img/melissa-santiago/gallery/thumbs/g24.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g24.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g27.jpg",
          alt: "Imagen de la galería 27",
          thumb: "/img/melissa-santiago/gallery/thumbs/g27.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g27.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g20.jpg",
          alt: "Imagen de la galería 20",
          thumb: "/img/melissa-santiago/gallery/thumbs/g20.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g20.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g16.jpg",
          alt: "Imagen de la galería 16",
          thumb: "/img/melissa-santiago/gallery/thumbs/g16.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g16.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g18.jpg",
          alt: "Imagen de la galería 18",
          thumb: "/img/melissa-santiago/gallery/thumbs/g18.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g18.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g25.jpg",
          alt: "Imagen de la galería 25",
          thumb: "/img/melissa-santiago/gallery/thumbs/g25.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g25.jpg",
        },
        {
          src: "/img/melissa-santiago/gallery/g26.jpg",
          alt: "Imagen de la galería 26",
          thumb: "/img/melissa-santiago/gallery/thumbs/g26.jpg",
          msrc: "/img/melissa-santiago/gallery/thumbs/g26.jpg",
        },
      ],
      carouselHeight: "dynamic",
      customText:
        "Hay momentos que el tiempo no podrá borrar, porque el amor los hace eternos.",
    },

    gifts: {
      showCash: true,
      transfer: {
        bank: "citibanamex",
        beneficiary: "Melissa Alvídrez & Santiago Mora",
        cardNumber: "5204 1663 1331 1799",
      },
      containerClassName: "bg-[#252a33]",
      customTitle: "Detalles para los novios",
      customPreTitle: "Obsequios",
      titleClassName: "text-3xl",
      customQuote:
        "Lo más importante para nosotros es contar con tu presencia. Si deseas expresar tu cariño con un detalle, a continuación encontrarás algunas opciones.",
    },

    assistants: {
      containerClassName: "bg-paper text-[#252a33]",
    },

    qrPhotos: {
      containerClassName: "bg-[#252a33]",
      urlPhotos: "https://photos.app.goo.gl/6g12DGN71docTMSv9",
    },

    footer: {
      containerClassName: "bg-paper",
      textClassName: "text-[#252a33]",
      svgsColor: "#676a70",
    },

    audio: {
      musicPath: "/music/baby-im-yours-2.mp3",
      fadeMs: 1000,
      mediaMetadata: {
        title: "Nuestra boda",
        artist: "Melissa & Santiago",
        album: "JN Invitaciones",
      },
    },
  },
};

export default melissaSantiagoConfig;
