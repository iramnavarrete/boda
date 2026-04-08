import { useRef, useState } from "react";
import "photoswipe/dist/photoswipe.css";

import Cover from "@/features/front/components/sections/cover";
import Quote from "@/features/front/components/sections/quote";
import ParentsGodFathers from "@/features/front/components/sections/parents";
import CountDown from "@/features/front/components/sections/countdown";
import CeremonyToast from "@/features/front/components/sections/ceremony-toast";
import Gallery from "@/features/front/components/sections/gallery";
import Assistants from "@/features/front/components/sections/Assistants";
import GiftsTable from "@/features/front/components/sections/gifts-table";
import QrPhotos from "@/features/front/components/sections/qr-photos";
import { AudioController } from "@/features/front/components/sections/music";
import Footer from "@/features/front/components/sections/footer";

import EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import DesktopSidebars from "@/features/shared/components/DesktopSidebars";
import {
  newIconScript,
  nourdBold,
  nourdLight,
  nourdMedium,
} from "@/features/shared/fonts";
import Head from "next/head";
import { InvitationsService } from "@/services/invitationsService";
import { GetServerSidePropsContext } from "next";
import { Invitation } from "@/types";
import { getEventTypeName } from "@/utils/formatters";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

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
      <main
        className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable}`}
      >
        {/* Componente que maneja la apertura del Lottie inicial */}
        <EnvelopeSplash onOpen={() => setIsEnvelopeOpened(true)} />

        <div style={{ overflow: "hidden" }}>
          <div className="flex flex-col items-center overflow-hidden bg-texture">
            <DesktopSidebars />

            {/* Contenido Central (Secciones de la Invitación) */}
            <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
              <Cover isSealVisible={!isEnvelopeOpened} />
              <Quote />
              <ParentsGodFathers />
              <CountDown />
              <CeremonyToast />
              <Gallery />
              <GiftsTable showCash transfer={{bank: 'bbva', beneficiary: 'Beneficiario', cardNumber: '0000 0000 0000 0000'}} />
              <Assistants />
              <QrPhotos />
              <Footer />
              <AudioController />
            </div>
          </div>
        </div>
      </main>
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