import AdminShowcase from "@/features/front/landing/components/AdminShowCaseSection";
import DemoSection from "@/features/front/landing/components/DemoSection";
import Footer from "@/features/front/landing/components/Footer";
import Hero from "@/features/front/landing/components/HeroSection";
import Pricing from "@/features/front/landing/components/PricingSection";
import Header from "@/features/shared/components/Header";

export default function AppCurvedTextured() {
  return (
    <div className="font-sans antialiased bg-paper min-h-screen text-charcoal-600 selection:bg-gold selection:text-white">
      <Header variant="landing" />
      <Hero />
      <DemoSection />
      <AdminShowcase />
      <Pricing />
      <Footer />
    </div>
  );
}
