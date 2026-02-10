import { Check, MessageCircle, Star } from "lucide-react";
import SectionTitle from "./SectionTitle";

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  recommended?: boolean;
  whatsappLink: string;
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

export default Pricing;
