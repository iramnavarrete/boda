import { useState } from "react";
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

interface InvitationPageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function Home({ invitationData }: InvitationPageProps) {
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const eventName = invitationData.nombre;
  const coverImage = invitationData.imagenPortada;
  const eventUrl = invitationData.eventUrl;
  const description = `Te invitamos a celebrar con nosotros este día tan especial, nos encantaría contar con tu presencia.`;

  return (
    <>
      <Head>
        <title>{eventName} | Estás Invitado</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={eventUrl} />

        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`Invitación: ${eventName}`} />
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
              <GiftsTable />
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
    const host = context.req?.headers?.host || "bodajy.info";
    // Verificamos si estamos en un entorno seguro (https) o local (http)
    const protocol =
      context.req?.headers?.["x-forwarded-proto"] ||
      (host.includes("localhost") ? "http" : "https");
    // Construimos la URL Base dinámica
    const baseUrl = `${protocol}://${host}`;

    // 1. Extracción dinámica del ID de la URL
    const resolvedUrl = context.resolvedUrl || "/i/josue-yaneth";
    const pathWithoutQuery = resolvedUrl.split("?")[0];
    const pathSegments = pathWithoutQuery.split("/").filter(Boolean);
    const INVITATION_ID = pathSegments[pathSegments.length - 1];

    // 2. Consulta a la base de datos
    const rawData = await InvitationsService.getInvitation(INVITATION_ID);

    if (!rawData) {
      return { notFound: true };
    }

    // 3. Serialización de datos (evita errores de timestamp)
    const serializedData = JSON.parse(JSON.stringify(rawData));

    // 4. PREPARACIÓN DE URLS PARA SEO DIRECTO EN EL SERVIDOR

    // a) Formateo de Imagen Portada a URL Absoluta (usando nuestro baseUrl dinámico)
    let absoluteImageUrl = `${baseUrl}/img/og-cover.jpg`; // Imagen por defecto

    if (serializedData.imagenPortada) {
      if (serializedData.imagenPortada.startsWith("http")) {
        // Ya es absoluta (ej. subida a un bucket externo de Firebase)
        absoluteImageUrl = serializedData.imagenPortada;
      } else {
        // Es relativa, garantizamos que no se duplique el "/"
        const relativePath = serializedData.imagenPortada.startsWith("/")
          ? serializedData.imagenPortada
          : `/${serializedData.imagenPortada}`;

        absoluteImageUrl = `${baseUrl}${relativePath}`;
      }
    }

    // Asignamos la ruta absoluta convertida al objeto serializado
    serializedData.imagenPortada = absoluteImageUrl;

    // b) Agregamos la URL del evento lista para usar en `og:url`
    serializedData.eventUrl = `${baseUrl}/i/${INVITATION_ID}`;

    return {
      props: {
        invitationData: serializedData,
      },
    };
  } catch (error) {
    console.error(`Error cargando invitación dinámica:`, error);
    return { notFound: true };
  }
};
