import { useRef, useState } from "react";
import "photoswipe/dist/photoswipe.css"; // Estilos base de PhotoSwipe

import Cover from "@/features/front/components/siena/cover";
import Quote from "@/features/front/components/sections/quote";
import CountDown from "@/features/front/components/siena/countdown";
import Gallery from "@/features/front/components/siena/gallery";
import GiftsTable from "@/features/front/components/siena/gifts-table";
import QrPhotos from "@/features/front/components/sections/qr-photos";
import { AudioController } from "@/features/front/components/sections/music";
import Footer from "@/features/front/components/sections/footer";

import EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import DesktopSidebars from "@/features/shared/components/DesktopSidebars";
import Head from "next/head";
import { InvitationsService } from "@/services/invitationsService";
import { GetServerSidePropsContext } from "next";
import { Invitation } from "@/types";
import { getEventTypeName } from "@/utils/formatters";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import FrontLayout from "@/features/shared/layouts/front";
import CeremonyToast from "@/features/front/components/siena/ceremony-toast";
import Assistants from "@/features/front/components/siena/Assistants";
import ParentsGodFathers from "@/features/front/components/siena/parents";
import { FamilyProvider } from "@/features/front/components/FamilyContext";
import MelissaSantiagoLogo from "@/icons/specificInvitation/MelissaSantiagoLogo";
import MelissaSantiagoSealLogo from "@/icons/specificInvitation/MelissaSantiagoSealLogo";

interface InvitationPageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function Home({ invitationData }: InvitationPageProps) {
  const isInitialized = useRef(false);
  if (!isInitialized.current) {
    useInvitationStore.setState({ invitationData });
    isInitialized.current = true;
  }

  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const eventName = invitationData.nombre;
  const coverImage = invitationData.imagenPortada;
  const eventUrl = invitationData.eventUrl;
  const description = `Te invitamos a celebrar con nosotros este día tan especial, nos encantaría contar con tu presencia.`;
  const faviconUrl = `/favicons/${invitationData.id}.ico`;

  return (
    <>
      <Head>
        <title>
          {`${getEventTypeName(invitationData.tipo)} ${eventName} | JN Invitaciones`}
        </title>
        <meta name="description" content={description} />
        <link rel="canonical" href={eventUrl} />

        <link rel="icon" type="image/x-icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />

        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={`Invitación ${getEventTypeName(invitationData.tipo)} ${eventName}`}
        />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={eventUrl} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Invitación: ${eventName}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={coverImage} />
      </Head>
      <FrontLayout>
        {/* Componente que maneja la apertura del Lottie inicial */}
        <FamilyProvider>
          <EnvelopeSplash
            onOpen={() => setIsEnvelopeOpened(true)}
            sealConfig={{
              customSvg: (
                <MelissaSantiagoSealLogo className="text-white h-10 w-10 -translate-x-[2px]" />
              ),
              textColor: "#fff",
              sealColor: "#252a33",
            }}
          />

          <div style={{ overflow: "hidden" }}>
            <div className="flex flex-col items-center overflow-hidden bg-texture">
              <DesktopSidebars
                flowersClassName="text-[#252a33]"
                textClassName="text-[#252a33]"
              />

              {/* Contenido Central (Secciones de la Invitación) */}
              <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
                <Cover
                  isSealVisible={!isEnvelopeOpened}
                  textAlign="center"
                  musicContainerClassName="bg-white"
                  musicIconClassName="text-[#252a33]"
                  musicButtonDelay={4200}
                  scrollIndicatorDelay={4600}
                  customTitleComponent={
                    <MelissaSantiagoLogo className="w-52 h-auto text-white overflow-visible" />
                  }
                  eventTitleClassName="flex justify-center"
                  imagesConfig={[
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
                  ]}
                />
                <Quote
                  svgColor="#252a33"
                  containerClassname="bg-[#252a33]"
                  quote="Así que ya no son dos, sino uno solo. Por tanto, lo que Dios ha unido, que no lo separe nadie."
                  author="Mateo 19:6"
                />
                <ParentsGodFathers
                  bottomWavesColor="#f9f7f2"
                  containerClassName="bg-paper"
                  textClassName="text-[#252a33]"
                  svgsColor="rgb(37 42 51 / 0.8)"
                  addToCalendarBtnClassName="text-[#252a33]"
                  calendarOptions={{
                    className: "bg-[#252a33]",
                    heartActiveClassName: "text-paper",
                    hearthClassName: "text-gold-800",
                  }}
                  customLastPhrase="Queremos compartir contigo el momento en que dos corazones, unidos por el amor de Dios, comienzan una vida para siempre."
                />
                <CountDown
                  backgroundImage="/img/melissa-santiago/gallery/g7.jpg"
                  panStart="20%"
                  panEnd="65%"
                />
                <CeremonyToast
                  containerClassName="bg-paper"
                  innerContainerClassName="px-0 py-8"
                  gapBetweenElements={24}
                  wavesColor="#f9f7f2"
                  svgsColor="#252a33"
                  forbiddenColors="none"
                  ceremonyImage="/img/templo/sagrado-corazon.png"
                  receptionImage="/img/salon/monjes.jpg"
                  showFlowersBg={false}
                  accommodationStyles={{
                    mainContainer: "border-[#252a33] border-opacity-20",
                    amenitiesGridContainer: "bg-[#252a33]",
                    headerContainer: "bg-[#252a33]",
                    roomsSectionContainer: "bg-[#252a33]",
                    roomCard:
                      "bg-paper text-[#252a33] border-[#252a33] border-0",
                    contactSectionContainer: "bg-paper text-[#252a33]",
                    contactButton:
                      "hover:bg-[#252a33] hover:text-paper border-[#252a33]",
                    mapsButton:
                      "bg-[#252a33] hover:bg-paper hover:text-[#252a33] text-paper border-[#252a33]",
                  }}
                  accommodationConfig={{
                    amenities: [
                      {
                        icon: "location",
                        title: "Ubicación",
                        desc: "Periférico de la Juventud",
                      },
                      {
                        icon: "coffee",
                        title: "Desayuno Buffet",
                        desc: "Incluido",
                      },
                      {
                        icon: "parking",
                        title: "Estacionamiento",
                        desc: "Gratuito",
                      },
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
                    mapsLink:
                      "https://maps.app.goo.gl/Z1kRyxDJEdMPdRWAA?g_st=ic",
                  }}
                  timelineItems={[
                    {
                      time: "4:00 PM",
                      title: "Ceremonia religiosa",
                      iconKey: "ceremonia",
                    },
                    {
                      time: "7:45 PM",
                      title: "Recepción",
                      iconKey: "recepcion",
                    },
                    {
                      time: "8:00 PM",
                      title: "Rompehielos",
                      iconKey: "cocktails",
                    },
                    {
                      time: "9:15 PM",
                      title: "Banquete",
                      iconKey: "banquete",
                    },
                    { time: "9:45 PM", title: "Vals", iconKey: "vals" },
                    {
                      time: "10:00 PM",
                      title: "Desarrollo de la fiesta",
                      iconKey: "baile",
                    },
                    {
                      time: "2:00 AM",
                      title: "Fin del evento",
                      iconKey: "despedida",
                    },
                  ]}
                  timelineTitle="Itinerario"
                  timelineSubtitle="Nuestro gran día"
                  timelineAccentColor="#252a33" // Tu color de acento
                  timelineStyles={{
                    eventTitleClassName: "text-[#252a33]",
                    timeClassName: "text-[#252a33]/70",
                    sectionSubtitle: "text-[#252a33]/80",
                    sectionTitle: "text-[#252a33]",
                  }}
                  womenConfig={{
                    subtitle: "Vestido largo de noche",
                    restrictions:
                      "Con el fin de preservar el protagonismo de la novia, agradecemos a nuestras invitadas evitar vestidos en tonos blancos o colores muy claros.",
                    description:
                      "Vestido largo de etiqueta acompañado de calzado y accesorios acordes a una celebración formal. Favor de evitar vestidos cortos o casuales.",
                    title: "Damas",
                  }}
                  menConfig={{
                    description:
                      "Traje formal con camisa de vestir, corbata o moño y zapatos de vestir. Se sugiere evitar prendas de estilo casual o vaquero.",
                    title: "Caballeros",
                    subtitle: "Traje formal completo",
                  }}
                  bothRestrictions="Agradecemos su comprehensión y apoyo respetando el código de vestimenta requerido por el salón."
                  sectionsContainerClassName="gap-12 mb-0 mt-10"
                />
                <Gallery
                  containerClassName="bg-paper"
                  slides={[
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
                  ]}
                  carouselHeight="dynamic"
                  customText="Hay momentos que el tiempo no podrá borrar, porque el amor los hace eternos."
                />
                <GiftsTable
                  showCash
                  transfer={{
                    bank: "citibanamex",
                    beneficiary: "Melissa Alvídrez & Santiago Mora",
                    cardNumber: "5204 1663 1331 1799",
                  }}
                  containerClassName="bg-[#252a33]"
                  customTitle="Detalles para los novios"
                  titleClassName="text-3xl"
                  customQuote="Lo más importante para nosotros es contar con tu presencia. Si deseas expresar tu cariño con un detalle, a continuación encontrarás algunas opciones."
                />
                <Assistants containerClassName="bg-paper text-[#252a33]" />
                <QrPhotos
                  containerClassName="bg-[#252a33]"
                  urlPhotos="https://photos.app.goo.gl/6g12DGN71docTMSv9"
                />
                <Footer
                  containerClassName="bg-paper"
                  textClassName="text-[#252a33]"
                  svgsColor="#676a70"
                />
                <AudioController musicPath="/music/baby-im-yours.mp3#t=5" />
              </div>
            </div>
          </div>
        </FamilyProvider>
      </FrontLayout>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const host = context.req?.headers?.host || "jninvitaciones.com";
    const protocol =
      context.req?.headers?.["x-forwarded-proto"] ||
      (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    const resolvedUrl = context.resolvedUrl || "/i/josue-yaneth";
    const pathWithoutQuery = resolvedUrl.split("?")[0];
    const pathSegments = pathWithoutQuery.split("/").filter(Boolean);
    const INVITATION_ID = pathSegments[pathSegments.length - 1];

    const { invitation } =
      await InvitationsService.getInvitation(INVITATION_ID);
    if (!invitation) {
      return { notFound: true };
    }

    // ── Fecha ISO con zona horaria correcta de Chihuahua ──────────────────────
    const firestoreDate =
      typeof invitation.fecha?.toDate === "function"
        ? invitation.fecha.toDate()
        : invitation.fecha instanceof Date
          ? invitation.fecha
          : null;

    if (firestoreDate) {
      const horaRecepcion = invitation.recepcion?.hora || "12:00";
      const [horaStr, minStr] = horaRecepcion.split(":");
      const hours = parseInt(horaStr, 10);
      const minutes = parseInt(minStr ?? "0", 10);

      const tz = "America/Chihuahua";
      const fmt = (opts: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-US", { ...opts, timeZone: tz }).format(
          firestoreDate,
        );

      const year = fmt({ year: "numeric" });
      const month = fmt({ month: "2-digit" });
      const day = fmt({ day: "2-digit" });

      const hh = isNaN(hours) ? "12" : String(hours).padStart(2, "0");
      const mm = isNaN(minutes) ? "00" : String(minutes).padStart(2, "0");

      // Offset real de Chihuahua en esa fecha (maneja horario de verano automáticamente)
      const tzNamePart =
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "shortOffset",
        })
          .formatToParts(firestoreDate)
          .find((p) => p.type === "timeZoneName")?.value ?? "GMT-6";

      const offsetMatch = tzNamePart.match(/GMT([+-])(\d+)/);
      const sign = offsetMatch?.[1] ?? "-";
      const offsetH = (offsetMatch?.[2] ?? "6").padStart(2, "0");

      invitation.fechaISO = `${year}-${month}-${day}T${hh}:${mm}:00${sign}${offsetH}:00`;
      // Resultado: "2026-05-10T21:00:00-06:00"
    }
    // ─────────────────────────────────────────────────────────────────────────

    const serializedData = JSON.parse(JSON.stringify(invitation));

    let absoluteImageUrl = `${baseUrl}/img/og-cover.jpg`;
    if (serializedData.imagenPortada) {
      if (serializedData.imagenPortada.startsWith("http")) {
        absoluteImageUrl = serializedData.imagenPortada;
      } else {
        const relativePath = serializedData.imagenPortada.startsWith("/")
          ? serializedData.imagenPortada
          : `/${serializedData.imagenPortada}`;
        absoluteImageUrl = `${baseUrl}${relativePath}`;
      }
    }

    serializedData.imagenPortada = absoluteImageUrl;
    serializedData.eventUrl = `${baseUrl}/i/${INVITATION_ID}`;

    return {
      props: {
        invitationData: { ...serializedData, id: INVITATION_ID },
      },
    };
  } catch (error) {
    console.error(`Error cargando invitación dinámica:`, error);
    return { notFound: true };
  }
};
