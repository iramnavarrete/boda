import AdminShowcase from "@/features/front/landing/components/AdminShowCaseSection";
import DemoSection from "@/features/front/landing/components/DemoSection";
import Hero from "@/features/front/landing/components/HeroSection";
import Pricing from "@/features/front/landing/components/PricingSection";
import LandingLayout from "@/features/shared/layouts/landing";

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
