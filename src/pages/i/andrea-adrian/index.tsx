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

  return (
    <>
      <Head>
        <title>
          {`${getEventTypeName(invitationData.tipo)} ${eventName} | JN Invitaciones`}
        </title>
        <meta name="description" content={description} />
        <link rel="canonical" href={eventUrl} />

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
          {/* <EnvelopeSplash onOpen={() => setIsEnvelopeOpened(true)} />

          <div style={{ overflow: "hidden" }}>
            <div className="flex flex-col items-center overflow-hidden bg-texture">
              <DesktopSidebars  />

              <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
                <Cover isSealVisible={!isEnvelopeOpened} />
                <Quote />
                <ParentsGodFathers />
                <CountDown />
                <CeremonyToast hasNoDinner />
                <Gallery />
                <GiftsTable
                  showCash
                  transfer={{
                    bank: "bbva",
                    beneficiary: "Beneficiario",
                    cardNumber: "0000 0000 0000 0000",
                  }}
                />
                <Assistants />
                <QrPhotos />
                <Footer />
                <AudioController />
              </div>
            </div>
          </div> */}
          <EnvelopeSplash
            onOpen={() => setIsEnvelopeOpened(true)}
            sealConfig={{
              initials: eventName
                .split(" ")
                .map((el) => el.substring(0, 1))
                .join(" "),
              sealColor: "#5b0012",
              textColor: "#FFF",
            }}
          />

          <div style={{ overflow: "hidden" }}>
            <div className="flex flex-col items-center overflow-hidden">
              <DesktopSidebars
                flowersClassName="text-[#5b0012]"
                textClassName="text-[#5b0012]"
              />

              {/* Contenido Central (Secciones de la Invitación) */}
              <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
                <Cover
                  eventTitleClassName="text-[32px]"
                  isSealVisible={!isEnvelopeOpened}
                  imagesConfig={[
                    {
                      src: "/img/andrea-adrian/gallery/g5.webp",
                      style: { backgroundPosition: "center" },
                    },
                    {
                      src: "/img/andrea-adrian/gallery/g2.webp",
                      style: { backgroundPosition: "center" },
                    },
                  ]}
                  musicIconClassName="text-[#5b0012]"
                  musicContainerClassName="bg-[#fff7f9]"
                />
                <Quote
                  svgColor="#5b0012"
                  containerClassname="bg-[#5b0012]"
                  quote="El destino me ha premiado, pues a mi lado te ha puesto. Y para serte honesto, mi corazón está de fiesta, porque desde que tú llegaste, mi historia está completa."
                />
                <ParentsGodFathers
                  containerClassName="border-[#5b0012] bg-[#fff7f9]"
                  textClassName="text-[#5b0012]"
                  svgsColor="#5b0012"
                  addToCalendarBtnClassName="text-[#5b0012] border-[#5b0012]"
                  bottomWavesColor="#fff7f9"
                  calendarOptions={{
                    className: "bg-[#5b0012]",
                    hearthClassName: "text-[#b73c58]",
                    showOnlyWeek: false,
                  }}
                />
                <CountDown backgroundImage="/img/andrea-adrian/gallery/g6.webp" />
                <CeremonyToast
                  svgsColor="#5b0012"
                  textClassName="text-[#5b0012]"
                  containerClassName="#f3ede1"
                  textDressCode="Formal / Vaquero"
                  hasNoDinner
                />
                <Gallery
                  svgsColor="#5b0012"
                  containerClassName="bg-[3f3ede1]"
                  textClassName="text-[#5b0012]"
                  slides={[
                    {
                      src: "/img/andrea-adrian/gallery/g2.webp",
                      alt: "Imagen de la galería 2",
                      thumb: "/img/andrea-adrian/gallery/thumbs/g2.webp",
                      msrc: "/img/andrea-adrian/gallery/thumbs/g2.webp",
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
                      src: "/img/andrea-adrian/gallery/g6.webp",
                      alt: "Imagen de la galería 6",
                      thumb: "/img/andrea-adrian/gallery/thumbs/g6.webp",
                      msrc: "/img/andrea-adrian/gallery/thumbs/g6.webp",
                    },
                  ]}
                />
                <GiftsTable
                  containerClassName="bg-[#5b0012]"
                  showCash={true}
                  transfer={{
                    bank: "bbva",
                    cardNumber: "4815 1630 5099 1002",
                    beneficiary: "Andrea Lara",
                  }}
                />
                <Assistants
                  svgsColor="#5b0012"
                  textClassName="text-[#5b0012]"
                  btnClassName="text-[#5b0012] border-[#5b0012] bg-gold/5"
                  containerClassName="#f3ede1"
                  activeConfirmBtnClassName="bg-transparent text-[#5b0012] border-[#5b0012]"
                  inactiveConfirmBtnClassName="bg-transparent text-stone-400 border-stone-300"
                  activeDeclineBtnClassName="bg-transparent text-[#5b0012] border-[#5b0012]"
                  inactiveDeclineBtnClassName="bg-transparent text-stone-400 border-stone-300"
                  sendFormBtnClassName="text-[#5b0012] border-[#5b0012] bg-gold/5 border"
                  sealImage="/img/andrea-adrian/sello-guinda.png"
                />
                <QrPhotos
                  urlPhotos="https://photos.app.goo.gl/CvX5tzkMZpkL1Hv36"
                  btnClassName="text-[#5b0012] bg-accent"
                  containerClassName="bg-[#5b0012]"
                />
                <Footer
                  textClassName="text-[#5b0012]"
                  containerClassName="bg-gold/5"
                  svgsColor="#5b0012"
                />
                <AudioController musicPath="/music/exist-for-love.mp3" />
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
