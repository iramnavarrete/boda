import Header from "@/features/shared/components/Header";
import Footer from "@/features/front/landing/components/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans antialiased bg-paper min-h-screen text-charcoal-600 selection:bg-gold selection:text-white flex flex-col">
      <Header variant="landing" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
