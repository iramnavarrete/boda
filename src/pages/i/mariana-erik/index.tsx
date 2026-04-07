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
        <EnvelopeSplash
          sealImage="/img/mariana-erik/sello-guinda.png"
          onOpen={() => setIsEnvelopeOpened(true)}
        />

        <div style={{ overflow: "hidden" }}>
          <div className="flex flex-col items-center overflow-hidden">
            <DesktopSidebars
              flowersClassName="text-[#581817]"
              textClassName="text-[#581817]"
            />

            {/* Contenido Central (Secciones de la Invitación) */}
            <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
              <Cover
                isSealVisible={!isEnvelopeOpened}
                imagesConfig={[
                  {
                    src: "/img/mariana-erik/gallery/g1.webp",
                    style: { backgroundPosition: "center" },
                  },
                  {
                    src: "/img/mariana-erik/gallery/g2.webp",
                    style: { backgroundPosition: "center" },
                  },
                ]}
                musicIconClassName="text-[#581817]"
              />
              <Quote svgColor="#581817" containerClassname="bg-[#581817]" />
              <ParentsGodFathers
                containerClassName="border-[#581817] bg-gold/20"
                textClassName="text-[#581817]"
                svgsColor="#581817"
                addToCalendarBtnClassName="text-[#581817] border-[#581817] bg-gold/5"
                bottomWavesColor="#f3ede1"
              />
              <CountDown
                backgroundImage="/img/mariana-erik/gallery/g3.webp"
                imageClassName="!bg-cover !bg-[45%]"
              />
              <CeremonyToast
                svgsColor="#581817"
                textClassName="text-[#581817]"
                mapBtnClassName="text-[#581817] border-[#581817] bg-gold/5"
                containerClassName="#f3ede1"
              />
              <Gallery
                svgsColor="#581817"
                containerClassName="bg-gold/20"
                textClassName="text-[#581817]"
                slides={[
                  {
                    src: "/img/mariana-erik/gallery/g1.webp",
                    alt: "Imagen de la galería 1",
                    height: 2560,
                    width: 1706,
                    thumb: "/img/mariana-erik/gallery/thumbs/g1.webp",
                    msrc: "/img/mariana-erik/gallery/thumbs/g1.webp",
                  },
                  {
                    src: "/img/mariana-erik/gallery/g2.webp",
                    alt: "Imagen de la galería 2",
                    height: 2560,
                    width: 1706,
                    thumb: "/img/mariana-erik/gallery/thumbs/g2.webp",
                    msrc: "/img/mariana-erik/gallery/thumbs/g2.webp",
                  },
                  {
                    src: "/img/mariana-erik/gallery/g4.webp",
                    alt: "Imagen de la galería 4",
                    height: 1465,
                    width: 800,
                    thumb: "/img/mariana-erik/gallery/thumbs/g4.webp",
                    msrc: "/img/mariana-erik/gallery/thumbs/g4.webp",
                  },
                ]}
              />
              <GiftsTable
                containerClassName="bg-[#581817]"
                btnsClassName="text-[#581817] bg-accent"
                showCash={true}
                transfer={{
                  bank: "bbva",
                  cardNumber: "4152 3139 4438 3681",
                  beneficiary: "Iram Navarrete",
                }}
              />
              <Assistants
                svgsColor="#581817"
                textClassName="text-[#581817]"
                btnClassName="text-[#581817] border-[#581817] bg-gold/5"
                containerClassName="#f3ede1"
                activeConfirmBtnClassName="bg-transparent text-[#581817] border-[#581817]"
                inactiveConfirmBtnClassName="bg-transparent text-stone-400 border-stone-300"
                activeDeclineBtnClassName="bg-transparent text-[#581817] border-[#581817]"
                inactiveDeclineBtnClassName="bg-transparent text-stone-400 border-stone-300"
                sendFormBtnClassName="text-[#581817] border-[#581817] bg-gold/5 border"
                sealImage="/img/mariana-erik/sello-guinda.png"
              />
              <QrPhotos
                qrImage="/img/mariana-erik/qr-code.png"
                urlPhotos="https://photos.app.goo.gl/g2A54M6qEshxmoVA6"
                btnClassName="text-[#581817] bg-accent"
                containerClassName="bg-[#581817]"
              />
              <Footer
                textClassName="text-[#581817]"
                containerClassName="bg-gold/5"
                svgsColor="#581817"
              />
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
    const resolvedUrl = context.resolvedUrl || "/i/mariana-erik";
    const pathWithoutQuery = resolvedUrl.split("?")[0];
    const pathSegments = pathWithoutQuery.split("/").filter(Boolean);
    const INVITATION_ID = pathSegments[pathSegments.length - 1];

    // 2. Consulta a la base de datos
    const { invitation } =
      await InvitationsService.getInvitation(INVITATION_ID);
    if (!invitation) {
      return { notFound: true };
    }

    if (invitation.fecha && typeof invitation.fecha.toDate === "function") {
      invitation.fechaISO = invitation.fecha.toDate().toISOString();
    } else if (invitation.fecha instanceof Date) {
      invitation.fechaISO = invitation.fecha.toISOString();
    }

    // 2. Tomamos la hora de la recepción (si no existe, usamos "12:00" por defecto)
    const horaRecepcion = invitation.recepcion?.hora || "12:00";
    const [hours, minutes] = horaRecepcion.split(":").map(Number);

    // 3. Combinamos el día base con la hora de la recepción
    const targetDate = new Date(invitation.fecha.toDate());
    if (!isNaN(hours) && !isNaN(minutes)) {
      targetDate.setHours(hours, minutes, 0, 0);
    }

    // 4. Guardamos el resultado en la nueva variable
    invitation.fechaISO = targetDate.toISOString();

    // 3. Serialización de datos (evita errores de timestamp)
    const serializedData = JSON.parse(JSON.stringify(invitation));

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
        invitationData: { ...serializedData, id: INVITATION_ID },
      },
    };
  } catch (error) {
    console.error(`Error cargando invitación dinámica:`, error);
    return { notFound: true };
  }
};
