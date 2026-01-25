import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Check,
  MapPin,
  Gift,
  MessageCircle,
  Star,
  Calendar,
  Music,
  Palette,
  Timer,
  ImageIcon,
  QrCode,
  PlayCircle,
  ExternalLink,
  RotateCcw,
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

const svgClassNames = "w-44 h-44 lg:w-48 lg:h-48 ";

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
  <div className={svgClassNames + "animate-float-1"}>
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
  <div className={svgClassNames + "animate-float-2"}>
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
  <div className={svgClassNames + "animate-float-3"}>
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
        <h1 className="font-serif text-3xl sm:text-4xl md:text-7xl text-primary leading-[1.05] mb-8 drop-shadow-sm">
          Tu invitación soñada
          <br />
          <span className="italic font-light text-gold text-3xl sm:text-4xl md:text-7xl relative inline-block">
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

        <p className="text-cool-gray text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed px-8 sm:px-16 md:px-20">
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
            Ver paquetes
          </TextureButton>
        </div>
      </div>

      {/* --- GRID DE ÍCONOS EN TARJETA DE CRISTAL --- */}
      <div className="mt-16 relative w-full max-w-6xl mx-auto px-4 perspective-1000">
        <div className="relative rounded-[40px] border border-white/40 bg-white/20 backdrop-blur-md shadow-[0_30px_60px_-15px_rgba(88,98,79,0.15)] overflow-hidden">
          {/* Iluminación Superior */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

          {/* Contenedor Flex/Grid Real */}
          <div className="w-full relative z-10 px-8 py-8">
            <p className="text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
              Cuenta con nosotros para todo tipo de eventos.
            </p>
            <div className="py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-center justify-items-center">
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
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 text-paper">
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
          <SectionTitle subtitle="Funcionalidades premium">
            Todo lo que tu evento necesita
          </SectionTitle>
          <div className="max-w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem
              icon={<Palette strokeWidth={1.5} />}
              title="Diseño personalizado"
              text="Cada historia es única. Adaptamos colores, tipografías y estilos para reflejar la esencia de tu evento."
            />
            <FeatureItem
              icon={<MessageCircle strokeWidth={1.5} />}
              title="Confirmación (RSVP)"
              text="Olvídate de las llamadas. Tus invitados confirman asistencia directamente desde la invitación."
            />
            <FeatureItem
              icon={<MapPin strokeWidth={1.5} />}
              title="Ubicación GPS"
              text="Integración directa con Google Maps para que nadie se pierda en el camino."
            />
            <FeatureItem
              icon={<QrCode strokeWidth={1.5} />}
              title="Álbum QR"
              text="Acceso directo al álbum de fotografías de tu evento (Google Fotos preferentemente)."
            />
            <FeatureItem
              icon={<ImageIcon strokeWidth={1.5} />}
              title="Galería de Fotos"
              text="Comparte su sesión de fotos en alta calidad para emocionar a los invitados antes del gran día."
            />
            <FeatureItem
              icon={<Music strokeWidth={1.5} />}
              title="Música de Fondo"
              text="Canciones instrumentales que llenan de vida tu invitación y reflejan la esencia de tu evento"
            />
            <FeatureItem
              icon={<Timer strokeWidth={1.5} />}
              title="Cuenta Regresiva"
              text="Un temporizador elegante que genera expectativa y emoción contando los días, horas y minutos restantes."
            />
            <FeatureItem
              icon={<Gift strokeWidth={1.5} />}
              title="Mesa de Regalos"
              text="Sugerencias de regalos, sobres digitales o enlaces directos a tiendas departamentales."
            />
          </div>
        </div>
      </section>
    </>
  );
};

function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- LÓGICA DE INTERSECCIÓN Y CONTROL DE VIDEO ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlaying(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Efecto para sincronizar el estado isPlaying con el elemento de video real
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        // Promesa para evitar errores si el video no ha cargado
        videoRef.current
          .play()
          .catch((e) => console.log("Autoplay prevenido por navegador", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se pause al hacer clic en el botón
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section
      id="demo"
      className={`py-24 md:py-32 relative overflow-hidden bg-paper`}
    >
      <div className="absolute inset-0 opacity-[0.4] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
        <SectionTitle subtitle="Experiencia Inmersiva">
          Magia en cada interacción
        </SectionTitle>
        <p className="text-cool-gray text-lg font-light mb-10 leading-relaxed text-center lg:text-left">
          Transmite la elegancia y el amor de tu celebración antes de que llegue
          la fecha. Una experiencia sensorial completa donde el diseño, el
          movimiento y el sonido se unen para emocionar a quienes más quieres.
        </p>

        {/* --- IPHONE MOCKUP CENTRAL --- */}
        <div
          ref={containerRef}
          className="relative z-20 transform transition-all duration-700 cursor-pointer group"
          onClick={() => setIsPlaying(!isPlaying)} // Click manual para alternar si el usuario quiere
        >
          {/* Estructura del Teléfono */}
          <div className="relative mx-auto w-[280px] h-[550px] bg-charcoal-900 rounded-[55px] shadow-[0_30px_60px_-15px_rgba(197,166,105,0.4)] border-[8px] border-charcoal-900">
            {/* Botones Laterales */}
            <div className="absolute top-24 -left-[10px] w-[3px] h-[32px] bg-charcoal-900 rounded-l-md" />
            <div className="absolute top-36 -left-[10px] w-[3px] h-[50px] bg-charcoal-900 rounded-l-md" />
            <div className="absolute top-36 -right-[10px] w-[3px] h-[80px] bg-charcoal-900 rounded-r-md" />

            {/* Pantalla Interna */}
            <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-black">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-charcoal-900 rounded-b-[16px] z-30 flex justify-center pt-1">
                <div className="w-12 h-1 rounded-full bg-stone-950" />
              </div>

              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src="/video/example.mp4"
                  poster="/img/example.jpg" // Imagen mientras carga
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />

                {/* Overlay de "Play" si está pausado */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20 transition-opacity duration-500 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 text-white shadow-xl animate-pulse">
                    <PlayCircle
                      size={32}
                      fill="currentColor"
                      className="opacity-90"
                    />
                  </div>
                </div>

                {/* Botón de Reinicio (Discreto) */}
                <button
                  onClick={handleRestart}
                  className="absolute bottom-4 left-3 z-30 p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-95"
                  title="Reiniciar video"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Reflejo Glassy */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-40 pointer-events-none z-40 rounded-[48px]" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <TextureButton
            onClick={() => window.open("https://bodajy.info", "_blank")}
          >
            <div className="flex gap-2">
              Ver Demo en Vivo <ExternalLink size={16} />
            </div>
          </TextureButton>
        </div>
      </div>
    </section>
  );
}


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
