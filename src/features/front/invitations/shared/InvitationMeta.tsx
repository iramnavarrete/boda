import Head from "next/head";
import type { ReactNode } from "react";
import type { Invitation } from "@/types";
import { getEventTypeName } from "@/utils/formatters";

interface InvitationMetaProps {
  invitationData: Invitation & { eventUrl: string; id: string };
  description?: string;
  children?: ReactNode;
}

/**
 * Head con SEO/OG/Twitter para una invitación.
 *
 * Mantiene una sola fuente de verdad: si agregas un nuevo meta tag aquí,
 * aplica a todas las invitaciones dinámicas.
 */
export default function InvitationMeta({
  invitationData,
  description = "Te invitamos a celebrar con nosotros este día tan especial, nos encantaría contar con tu presencia.",
  children,
}: InvitationMetaProps) {
  const eventName = invitationData.nombre;
  const coverImage = invitationData.imagenPortada;
  const eventUrl = invitationData.eventUrl;
  const faviconUrl = `/favicons/${invitationData.id}.ico`;

  return (
    <Head>
      <title>
        {`${getEventTypeName(invitationData.tipo)} ${eventName} | JN Invitaciones`}
      </title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={eventUrl} />

      <link rel="icon" type="image/x-icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />

      <meta property="og:locale" content="es_MX" />
      <meta property="og:type" content="article" />
      <meta
        property="og:title"
        content={`Invitación ${getEventTypeName(invitationData.tipo)} ${eventName}`}
      />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={eventUrl} />
      <meta property="og:image" content={coverImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`Invitación: ${eventName}`} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={coverImage} />

      {children}
    </Head>
  );
}
