import Head from "next/head";
import LoginContent from "@/features/admin/components/LoginContent";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>JN Invitaciones — Panel de Administración</title>
        <meta
          name="description"
          content="Panel de administración de JN Invitaciones: organiza invitados, mesas, mensajes y accesos por QR desde un solo lugar."
        />
        <link rel="canonical" href="https://jninvitaciones.com/login" />

        {/* Open Graph — Facebook, WhatsApp, LinkedIn, Discord, Slack */}
        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="JN Invitaciones — Panel de Administración"
        />
        <meta
          property="og:description"
          content="Organiza invitados, mesas, mensajes y accesos por QR desde un solo lugar."
        />
        <meta property="og:url" content="https://jninvitaciones.com/login" />
        <meta
          property="og:image"
          content="https://jninvitaciones.com/cover/admin.jpg"
        />
        <meta property="og:image:width" content="2752" />
        <meta property="og:image:height" content="1536" />
        <meta property="og:image:type" content="image/jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="JN Invitaciones — Panel de Administración"
        />
        <meta
          name="twitter:description"
          content="Organiza invitados, mesas, mensajes y accesos por QR desde un solo lugar."
        />
        <meta
          name="twitter:image"
          content="https://jninvitaciones.com/cover/admin.jpg"
        />
      </Head>

      <LoginContent />
    </>
  );
}