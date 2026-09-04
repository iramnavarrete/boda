import VianeyOmarLogo from "@/icons/specificInvitation/VianeyOmarLogo";
import type { InvitationConfig } from "../shared/types";
import VianeyOmarSealLogo from "@/icons/specificInvitation/VianeyOmarSealLogo";

/**
 * Configuración de la invitación: Melissa & Santiago.
 */
const vianeyOmarConfig: InvitationConfig = {
  slug: "vianey-omar",

  // Sin meta description (oculta description/og:description/twitter:description)
  metaDescription: "",

  sealConfig: {
    customSvg: <VianeyOmarSealLogo className="text-paper h-10 w-10" />,
    sealColor: "#3d4739",
    textColor: "#f9f7f2",
  },

  sidebars: {},

  timeline: {
    items: [
      { time: "5:30 PM", title: "Ceremonia religiosa", iconKey: "ceremonia" },
      { time: "9:00 PM", title: "Bienvenida", iconKey: "recepcion" },
      { time: "9:15 PM", title: "Vals y primer baile", iconKey: "vals" },
      { time: "09:30 PM", title: "Desarrollo de la fiesta", iconKey: "baile" },
      { time: "11:00 PM", title: "Trasnochados", iconKey: "banquete" },
      { time: "12:00 PM", title: "Banquete", iconKey: "cocktails" },
      {
        time: "12:30 PM",
        title: "Lanzamiento de ramo y liga",
        iconKey: "ramo",
      },
      { time: "2:00 AM", title: "Fin del evento", iconKey: "despedida" },
    ],
    title: "Itinerario",
    subtitle: "Nuestro gran día",
    accentColor: "#58624F",
    styles: {
      eventTitleClassName: "text-[#1e241b] text-xs",
      timeClassName: "text-[#1e241b]/70 text-xs",
      sectionSubtitle: "text-[#1e241b]/80",
      sectionTitle: "text-[#1e241b]",
      container: "mt-12",
    },
  },

  sections: {
    cover: {
      isSealVisible: false, // controlado por el sobre
      textAlign: "center",
      musicContainerClassName: "bg-white",
      musicIconClassName: "text-[#58624F]",
      musicButtonDelay: 4200,
      scrollIndicatorDelay: 4600,
      customTitleComponent: (
        <VianeyOmarLogo className="text-white overflow-visible" />
      ),
      eventTitleClassName: "flex justify-center",
      imagesConfig: [
        {
          src: "/img/vianey-omar/cover/c2.webp",
          panStart: "55%",
          panEnd: "65%",
          titlePosition: "top",
        },
        {
          src: "/img/vianey-omar/cover/c1.webp",
          panStart: "55%",
          panEnd: "45%",
          titlePosition: "top",
        },
        {
          src: "/img/vianey-omar/cover/c3.webp",
          panStart: "45%",
          panEnd: "70%",
          titlePosition: "bottom",
        },
        {
          src: "/img/vianey-omar/cover/c5.webp",
          panStart: "55%",
          panEnd: "45%",
          titlePosition: "bottom",
        },
        {
          src: "/img/vianey-omar/cover/c6.webp",
          panStart: "45%",
          panEnd: "55%",
          titlePosition: "top",
        },
        {
          src: "/img/vianey-omar/cover/c7.webp",
          panStart: "55%",
          panEnd: "45%",
          titlePosition: "top",
        },
      ],
    },

    quote: {
      svgColor: "#58624F",
      containerClassname: "bg-[#58624F]",
      quote:
        "Así que ya no son dos, sino uno solo. Por tanto, lo que Dios ha unido, que no lo separe nadie.",
      author: "Mateo 19:6",
    },

    parents: {
      bottomWavesColor: "#f9f7f2",
      containerClassName: "bg-paper",
      textClassName: "text-[#58624F]",
      svgsColor: "rgb(37 42 51 / 0.8)",
      addToCalendarBtnClassName: "text-[#1e241b]",
      calendarOptions: {
        className: "bg-[#58624F]",
        heartActiveClassName: "text-[#58624F]",
        hearthClassName: "text-paper",
      },
      customLastPhrase:
        "Queremos compartir contigo el momento en que dos corazones, unidos por el amor de Dios, comienzan una vida para siempre.",
    },

    countDown: {
      backgroundImage: "/img/vianey-omar/cover/c1.webp",
      panStart: "40% ",
      panEnd: "80% ",
    },

    dressCode: {
      containerClassName: "bg-paper",
      innerContainerClassName: "px-0 py-8",
      gapBetweenElements: 24,
      wavesColor: "#f9f7f2",
      svgsColor: "#58624F",
      forbiddenColors: [
        { hex: "#FFFFFF", name: "Blanco / Marfil" },
        { hex: "#78866B", name: "Verde Salvia" },
        { hex: "#556B2F", name: "Verde Olivo" },
        { hex: "#1E4D2B", name: "Verdes en general" },
      ],
      hasNoDinner: true,
      ceremonyImage: "/img/templo/sagrado-corazon.png",
      receptionImage: "/img/salon/quinta-aurora.jpg",
      showFlowersBg: false,
      womenConfig: {
        title: "Damas",
        subtitle: "Vestido largo de noche",
        description:
          "Vestido largo de etiqueta acompañado de calzado y accesorios acordes a una celebración formal. Favor de evitar vestidos cortos o casuales.",
      },
      menConfig: {
        title: "Caballeros",
        subtitle: "Traje formal / Vaquero",
        description:
          "Traje formal con camisa de vestir, corbata o moño y zapatos de vestir. o si así lo decide un estilo vaquero elegante que esté a la altura de la celebración. Se sugiere evitar prendas de estilo casual.",
      },
      bothRestrictions:
        "Agradecemos su comprensión y apoyo respetando el código de vestimenta requerido por el salón.",
      sectionsContainerClassName: "gap-12 mb-0 mt-10",
    },

    gallery: {
      containerClassName: "bg-paper",
      slides: [
        {
          src: "/img/vianey-omar/gallery/g3.webp",
          alt: "Imagen de la galería 3",
          thumb: "/img/vianey-omar/gallery/g3.webp",
          msrc: "/img/vianey-omar/gallery/g3.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g4.webp",
          alt: "Imagen de la galería 4",
          thumb: "/img/vianey-omar/gallery/g4.webp",
          msrc: "/img/vianey-omar/gallery/g4.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g1.webp",
          alt: "Imagen de la galería 1",
          thumb: "/img/vianey-omar/gallery/g1.webp",
          msrc: "/img/vianey-omar/gallery/g1.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g2.webp",
          alt: "Imagen de la galería 2",
          thumb: "/img/vianey-omar/gallery/g2.webp",
          msrc: "/img/vianey-omar/gallery/g2.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g6.webp",
          alt: "Imagen de la galería 6",
          thumb: "/img/vianey-omar/gallery/g6.webp",
          msrc: "/img/vianey-omar/gallery/g6.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g7.webp",
          alt: "Imagen de la galería 7",
          thumb: "/img/vianey-omar/gallery/g7.webp",
          msrc: "/img/vianey-omar/gallery/g7.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g5.webp",
          alt: "Imagen de la galería 5",
          thumb: "/img/vianey-omar/gallery/g5.webp",
          msrc: "/img/vianey-omar/gallery/g5.webp",
        },
        {
          src: "/img/vianey-omar/gallery/g8.webp",
          alt: "Imagen de la galería 8",
          thumb: "/img/vianey-omar/gallery/g8.webp",
          msrc: "/img/vianey-omar/gallery/g8.webp",
        },
      ],
      carouselHeight: "dynamic",
      customText:
        "Hay momentos que el tiempo no podrá borrar, porque el amor los hace eternos.",
    },

    gifts: {
      showCash: true,
      transfer: {
        bank: "santander",
        beneficiary: "Vianey Aracely Valdez Reyes",
        cardNumber: "5579 1004 9284 5415",
      },
      containerClassName: "bg-[#58624F]",
      customTitle: "Detalles para los novios",
      customPreTitle: "Obsequios",
      titleClassName: "text-3xl",
      customQuote:
        "Lo más importante para nosotros es contar con tu presencia. Si deseas expresar tu cariño con un detalle, a continuación encontrarás algunas opciones.",
    },

    assistants: {
      containerClassName: "bg-paper text-[#58624F]",
    },

    qrPhotos: {
      containerClassName: "bg-[#58624F]",
      urlPhotos: "https://photos.app.goo.gl/4qPCaPpbSQufCSFd7",
    },

    footer: {
      containerClassName: "bg-paper",
      textClassName: "text-[#58624F]",
      svgsColor: "#58624F",
    },

    audio: {
      musicPath: "/music/baby-im-yours-2.mp3",
      fadeMs: 1000,
      mediaMetadata: {
        title: "Vianey & Omar",
        artist: "JN Invitaciones",
        album: "Nuestra boda",
      },
    },
  },
};

export default vianeyOmarConfig;
