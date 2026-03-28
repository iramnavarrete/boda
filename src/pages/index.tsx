import AdminShowcase from "@/features/front/landing/components/AdminShowCaseSection";
import DemoSection from "@/features/front/landing/components/DemoSection";
import Hero from "@/features/front/landing/components/HeroSection";
import Pricing from "@/features/front/landing/components/PricingSection";
import LandingLayout from "@/features/shared/layouts/landing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitaciones Digitales Elegantes | Promoción de Apertura",
  description:
    "La invitación perfecta para tu boda o evento. ¡Aprovecha nuestros precios de lanzamiento válidos solo hasta el 15 de abril! RSVP, pases digitales y más.",

  // Open Graph (Es lo que leen WhatsApp, Facebook, LinkedIn, etc.)
  openGraph: {
    title: "✨ Invitaciones Digitales Premium | Descuento de Apertura",
    description:
      "Sorprende a tus invitados con una experiencia digital única. ¡Aprovecha nuestra promoción exclusiva de lanzamiento y obtén hasta un 20% de descuento antes del 15 de abril! 🥂",
    url: "https://bodajy.info",
    siteName: "JN Invitaciones",
    images: [
      {
        url: "/img/cover_jn.png",
        width: 1108,
        height: 410,
        alt: "Invitaciones Digitales Elegantes para Eventos",
      },
    ],
    locale: "es_MX",
    type: "website",
  },

  // Twitter Cards (Para cuando comparten en X / Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Invitaciones Digitales Premium | Promoción de Apertura",
    description:
      "La forma más elegante de invitar y gestionar la asistencia de tus invitados. ¡Aprovecha precios de lanzamiento hasta el 15 de abril!",
    images: ["/img/cover_jn.png"],
  },
};

export default function AppCurvedTextured() {
  return (
    <LandingLayout>
      <Hero />
      <DemoSection />
      <AdminShowcase />
      <Pricing />
    </LandingLayout>
  );
}
