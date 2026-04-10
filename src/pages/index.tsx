import AdminShowcase from "@/features/front/landing/components/AdminShowCaseSection";
import DemoSection from "@/features/front/landing/components/DemoSection";
import Hero from "@/features/front/landing/components/HeroSection";
import Pricing from "@/features/front/landing/components/PricingSection";
import LandingLayout from "@/features/shared/layouts/landing";
import Head from "next/head";

export default function AppCurvedTextured() {
  return (
    <>
      <Head>
        <title>Invitaciones Digitales Elegantes | Promoción de Apertura</title>
        <meta
          name="description"
          content="La invitación perfecta para tu boda o evento. ¡Aprovecha nuestros precios de lanzamiento válidos solo hasta el 15 de abril! RSVP, pases digitales y más."
        />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jninvitaciones.com/" />
        <meta
          property="og:title"
          content="✨ Invitaciones Digitales Premium | Descuento de Apertura"
        />
        <meta
          property="og:description"
          content="Sorprende a tus invitados con una experiencia digital única. ¡Aprovecha nuestra promoción exclusiva de lanzamiento y obtén hasta un 20% de descuento durante el mes de abril! 🥂"
        />
        <meta
          property="og:image"
          content="https://jninvitaciones.com/img/cover_jn.png"
        />
        <meta property="og:image:width" content="1108" />
        <meta property="og:image:height" content="410" />
        <meta property="og:site_name" content="JN Invitaciones" />
        <meta property="og:locale" content="es_MX" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Invitaciones Digitales Premium | Promoción de Apertura"
        />
        <meta
          name="twitter:description"
          content="La forma más elegante de invitar y gestionar la asistencia de tus invitados. ¡Aprovecha precios de lanzamiento hasta el 15 de abril!"
        />
        <meta
          name="twitter:image"
          content="https://jninvitaciones.com/img/cover_jn.png"
        />
      </Head>
      <LandingLayout>
        <Hero />
        <DemoSection />
        <AdminShowcase />
        <Pricing />
      </LandingLayout>
    </>
  );
}
