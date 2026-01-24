import React, { ReactNode } from "react";
import {
  Check,
  MapPin,
  Smartphone,
  Gift,
  ShieldCheck,
  Play,
  MessageCircle,
  Star,
  Calendar,
  Music,
} from "lucide-react";
import Image from "next/image";
import Header from "@/features/shared/components/Header";

interface SectionTitleProps {
  children: ReactNode;
  subtitle: string;
}

interface TextureButtonProps {
  children: ReactNode;
  primary?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
}

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  text: string;
}

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  recommended?: boolean;
  whatsappLink: string;
}

// --- COMPONENTES UI ---

const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
  <div className="text-center mb-16 px-4 relative z-10">
    <span className="inline-block py-1 px-5 rounded-full border border-primary/30 text-primary text-[10px] font-bold tracking-[0.25em] uppercase mb-4 bg-accent/80 backdrop-blur-sm">
      {subtitle}
    </span>
    <h2 className="text-4xl md:text-6xl font-serif text-primary mb-6 drop-shadow-sm">
      {children}
    </h2>
    <div className="flex items-center justify-center gap-2 opacity-60">
      <div className="w-8 h-[1px] bg-gold"></div>
      <div className="w-1.5 h-1.5 rotate-45 border border-gold"></div>
      <div className="w-8 h-[1px] bg-gold"></div>
    </div>
  </div>
);

const TextureButton: React.FC<TextureButtonProps> = ({
  children,
  primary = true,
  onClick,
  icon,
}) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-4 rounded-full font-medium tracking-widest uppercase text-xs transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 relative overflow-hidden group
      ${
        primary
          ? "bg-primary text-paper shadow-[0_4px_20px_rgba(88,98,79,0.4)]"
          : "bg-paper border border-border-button text-primary hover:border-primary shadow-sm"
      }
    `}
  >
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer  pointer-events-none"></div>
    {icon && <span className="w-4 h-4">{icon}</span>}
    <span className="relative z-10">{children}</span>
  </button>
);

const IconRings: React.FC = () => (
  <div className="w-48 h-48 md:w-56 md:h-56 animate-float-1">
    <Image
      alt="Boda"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/boda-religiosa-verde.svg`}
    />
    <p className=" text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Bodas
    </p>
  </div>
);

const IconDress: React.FC = () => (
  <div className="w-48 h-48 md:w-56 md:h-56 animate-float-2">
    <Image
      alt="Quinceañera"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/quinceanera-verde.svg`}
    />
    <p className=" text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Quinceañeras
    </p>
  </div>
);

const IconCups: React.FC = () => (
  <div className="w-44 h-44 md:w-48 md:h-48 animate-float-3">
    <Image
      alt="Cualquier evento"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/celebracion-verde.svg`}
    />
    <p className=" text-center pt-4 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Momentos especiales
    </p>
  </div>
);

// --- SECCIONES PRINCIPALES ---

const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="min-h-screen pt-16 pb-20 px-4 flex flex-col items-center justify-center bg-paper relative overflow-hidden"
    >
      {/* TEXTURA */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('/img/textures/cream-paper.png')] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center z-10 relative mt-6">
        <h1 className="font-serif text-4xl md:text-7xl text-primary leading-[1.05] mb-8 drop-shadow-sm">
          Tu invitación soñada
          <br />
          <span className="italic font-light text-gold text-4xl md:text-7xl relative inline-block">
            llena de vida
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-gold opacity-40"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="text-cool-gray text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed px-20">
          Invitaciones digitales diseñadas para hacer tu evento inolvidable
          desde la primera impresión.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <TextureButton
            onClick={() => {
              const element = document.getElementById("paquetes");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Nuestros trabajos
          </TextureButton>
        </div>
      </div>

      {/* --- GRID DE ÍCONOS EN TARJETA DE CRISTAL --- */}
      <div className="mt-16 relative w-full max-w-6xl mx-auto px-4 perspective-1000">
        <div className="relative rounded-[40px] border border-white/40 bg-white/20 backdrop-blur-md shadow-[0_30px_60px_-15px_rgba(88,98,79,0.15)] overflow-hidden">
          {/* Iluminación Superior */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

          {/* Contenedor Flex/Grid Real */}
          <div className="w-full relative z-10 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-center justify-items-center">
              <IconRings />
              <IconDress />
              <IconCups />
            </div>
          </div>

          {/* Brillo de Fondo Radial */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent rounded-[40px] pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, text }) => (
  <div className="p-8 rounded-[20px] bg-paper relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-transparent hover:border-border-button/50 hover:shadow-xl hover:shadow-primary/5">
    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-paper transition-colors shadow-inner">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-primary mb-3">{title}</h3>
      <p className="text-charcoal-400 text-sm font-light leading-relaxed">
        {text}
      </p>
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <>
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 opacity-[0.3] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem
              icon={<Smartphone strokeWidth={1.5} />}
              title="Diseño Adaptable"
              text="Visualización perfecta en cualquier dispositivo móvil, tablet o computadora."
            />
            <FeatureItem
              icon={<MapPin strokeWidth={1.5} />}
              title="Ubicación GPS"
              text="Integración nativa con Google Maps y Waze para que tus invitados lleguen fácil."
            />
            <FeatureItem
              icon={<Gift strokeWidth={1.5} />}
              title="Mesa de Regalos"
              text="Enlaces directos a tus mesas de regalos en tiendas o sobres virtuales."
            />
            <FeatureItem
              icon={<ShieldCheck strokeWidth={1.5} />}
              title="Acceso Seguro"
              text="Control de pases con códigos QR únicos por familia o invitado."
            />
          </div>
        </div>
      </section>
    </>
  );
};

const DemoSection: React.FC = () => {
  return (
    <section id="demo" className="py-32 bg-accent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        <div className="lg:w-1/2">
          <SectionTitle subtitle="Inmersión">Experiencia Visual</SectionTitle>
          <p className="text-cool-gray text-lg font-light mb-10 leading-relaxed text-center lg:text-left">
            Diseñamos cada pantalla pensando en la usabilidad y la estética. Tus
            invitados disfrutarán de una navegación fluida, acompañada de música
            y animaciones sutiles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "RSVP Digital", icon: <MessageCircle size={16} /> },
              { label: "Galería de Fotos", icon: <Check size={16} /> },
              { label: "Música de Fondo", icon: <Music size={16} /> },
              { label: "Agregar a Calendario", icon: <Calendar size={16} /> },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-xl bg-paper border border-charcoal-100 shadow-sm hover:border-gold transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gold shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-primary text-sm font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center perspective-1000">
          <div className="relative group">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/20 blur-xl rounded-[100%] group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative bg-paper p-3 rounded-[3.5rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.05),0_20px_40px_rgba(88,98,79,0.15)] border border-charcoal-100">
              <div className="relative w-[350px] h-[650px] bg-white rounded-[3rem] overflow-hidden border-[6px] border-paper shadow-inner">
                <iframe
                  src="https://bodajy.info"
                  className="w-full h-full border-0"
                  title="Demo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  features,
  recommended,
  whatsappLink,
}) => (
  <div
    className={`
    relative p-8 md:p-10 rounded-[2rem] transition-all duration-300 flex flex-col h-full border
    ${
      recommended
        ? "bg-paper border-gold shadow-[0_20px_60px_-10px_rgba(197,166,105,0.25)] z-10 scale-100 md:scale-105"
        : "bg-white border-charcoal-100 hover:border-border-button hover:shadow-lg text-cool-gray"
    }
  `}
  >
    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] rounded-[2rem] pointer-events-none"></div>
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-paper text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-20">
        <Star size={10} fill="currentColor" /> Recomendado
      </div>
    )}
    <div className="relative z-10 text-center mb-8">
      <h3 className="font-serif text-3xl text-primary mb-1">{title}</h3>
      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal-400 font-semibold">
        {subtitle}
      </p>
      <div className="my-6 flex justify-center items-baseline text-primary">
        <span className="text-xl font-light mr-1">$</span>
        <span className="text-5xl font-serif">{price}</span>
        <span className="text-sm font-medium text-charcoal-400 ml-2">MXN</span>
      </div>
      <div className="w-12 h-[1px] bg-border-button mx-auto"></div>
    </div>
    <div className="space-y-4 mb-10 flex-grow relative z-10">
      {features.map((feat, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className={`mt-1 p-0.5 rounded-full ${recommended ? "bg-gold text-white" : "bg-charcoal-100 text-charcoal-400"}`}
          >
            <Check size={10} strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-cool-gray leading-tight">
            {feat}
          </span>
        </div>
      ))}
    </div>
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`
      w-full py-4 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group z-10
      ${
        recommended
          ? "bg-primary text-paper hover:bg-charcoal-700 shadow-lg shadow-primary/20"
          : "bg-transparent border border-primary text-primary hover:bg-primary hover:text-paper"
      }
    `}
    >
      <MessageCircle size={16} />
      <span>Me Interesa</span>
    </a>
  </div>
);

const Pricing: React.FC = () => {
  const phoneNumber = "5215555555555";
  return (
    <section id="paquetes" className="py-32 bg-white relative">
      {/* <div className="absolute top-0 left-0 w-full h-24 bg-accent rounded-b-[50%] scale-x-150 -translate-y-12"></div> */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <SectionTitle subtitle="Inversión">Nuestros Paquetes</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <PricingCard
            title="Plus"
            subtitle="Esencial & Elegante"
            price="1,200"
            whatsappLink={`https://wa.me/${phoneNumber}?text=Hola,%20me%20interesa%20el%20Paquete%20Plus%20de%20$1200%20MXN`}
            features={[
              "Diseño Digital Personalizado (Carta)",
              "Ubicación GPS Interactiva",
              "Mesa de Regalos (Sobres/Tiendas)",
              "RSVP Básico (WhatsApp)",
              "Música de Fondo",
              "Timeline del Evento",
              "Botón de Calendario",
            ]}
          />
          <PricingCard
            title="Diamante"
            subtitle="Gestión Total"
            price="1,600"
            recommended={true}
            whatsappLink={`https://wa.me/${phoneNumber}?text=Hola,%20me%20interesa%20el%20Paquete%20Diamante%20de%20$1600%20MXN`}
            features={[
              "Todo lo incluido en Plus",
              "Gestión Avanzada de Invitados (RSVP)",
              "Pases Digitales con QR",
              "Control de Accesos por Familia",
              "Restricciones Alimenticias",
              "Recordatorios Automáticos",
            ]}
          />
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-primary pt-24 pb-12 rounded-t-[3rem] relative overflow-hidden text-paper">
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-10 relative z-10">
      <div className="max-w-xs">
        <h4 className="font-serif text-3xl mb-4 tracking-wide text-gold">
          JN INVITACIONES
        </h4>
        <p className="text-charcoal-100 text-sm font-light leading-relaxed opacity-80">
          Creamos experiencias digitales que perduran en la memoria. Elegancia
          atemporal para tu evento más importante.
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end gap-4">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-paper/10 border border-paper/20 hover:bg-paper hover:text-primary transition-all"
        >
          <MessageCircle size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Contactar Soporte
          </span>
        </a>
        <div className="text-charcoal-100/60 text-xs mt-4">
          © {new Date().getFullYear()} JN Invitaciones. Todos los derechos
          reservados.
        </div>
      </div>
    </div>
  </footer>
);

export default function AppCurvedTextured() {
  return (
    <div className="font-sans antialiased bg-paper min-h-screen text-charcoal-600 selection:bg-gold selection:text-white">
      <Header variant="landing" />
      <Hero />
      <Features />
      <DemoSection />
      <Pricing />
      <Footer />
    </div>
  );
}
