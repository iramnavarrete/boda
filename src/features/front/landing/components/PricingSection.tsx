import { Check, MessageCircle, Star, Sparkles, Clock } from "lucide-react";
import React, { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  subtitle: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
  <div className="text-center mb-12 px-4 relative z-10">
    <span className="inline-block py-1 px-5 rounded-full border border-[#C5A669]/30 text-[#58624F] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 bg-[#F9F7F2]/80 backdrop-blur-sm">
      {subtitle}
    </span>
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#58624F] mb-6 drop-shadow-sm leading-tight">
      {children}
    </h2>
    <div className="flex items-center justify-center gap-2 opacity-60">
      <div className="w-8 h-[1px] bg-[#C5A669]"></div>
      <div className="w-1.5 h-1.5 rotate-45 border border-[#C5A669]"></div>
      <div className="w-8 h-[1px] bg-[#C5A669]"></div>
    </div>
  </div>
);

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  features: string[];
  recommended?: boolean;
  whatsappLink: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  originalPrice,
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
    <div className="absolute inset-0 opacity-30 bg-[url('/img/textures/cream-paper.png')] rounded-[2rem] pointer-events-none"></div>
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

      {/* Sección de Precio Actualizada para mostrar Descuento */}
      <div className="my-6 flex flex-col items-center justify-center text-primary">
        {originalPrice && (
          <div className="text-sm text-charcoal-400/60 font-medium line-through decoration-red-400/60 mb-1">
            ${originalPrice} MXN
          </div>
        )}
        <div className="flex items-baseline">
          <span className="text-xl font-light mr-1">$</span>
          <span className="text-5xl font-serif">{price}</span>
          <span className="text-sm font-medium text-charcoal-400 ml-2">
            MXN
          </span>
        </div>
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
  const phoneNumber = "+526142537718";

  // --- LÓGICA DINÁMICA DE PROMOCIÓN ---
  // Cambia esto a false cuando expire la promoción el 15 de abril
  const isPromoActive = true;

  // Generador de enlaces dinámico
  const generateWhatsAppLink = (
    pkgName: string,
    price: string,
    hasDiscount: boolean,
  ) => {
    const message = hasDiscount
      ? `Hola, me interesa el Paquete ${pkgName} con descuento de apertura de $${price} MXN.`
      : `Hola, me interesa el Paquete ${pkgName} por $${price} MXN.`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="paquetes" className="py-32 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <SectionTitle subtitle="Inversión">Nuestros Paquetes</SectionTitle>

        {/* Banner de Promoción condicional */}
        {isPromoActive && (
          <div className="max-w-2xl mx-auto mb-16 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute inset-0 bg-gold/5 transform translate-x-2 translate-y-2 rounded-2xl -z-10 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
            <div className="bg-paper border border-gold/30 rounded-2xl p-6 md:p-8 text-center shadow-sm relative z-10 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[url('/img/textures/cream-paper.png')] pointer-events-none"></div>

              <div className="bg-gold text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 flex items-center gap-1.5 shadow-sm relative z-10">
                <Sparkles size={12} /> Promoción por Apertura
              </div>

              <p className="text-primary font-medium text-base md:text-lg relative z-10">
                Aprovecha nuestros precios especiales de lanzamiento.
              </p>
              <p className="text-sm text-charcoal-400 mt-2 flex items-center justify-center gap-1.5 font-bold relative z-10">
                <Clock size={14} className="text-gold" /> Válido solo hasta el{" "}
                <span className="text-gold">15 de abril</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <PricingCard
            title="Plus"
            subtitle="Esencial & Elegante"
            price={isPromoActive ? "1,000" : "1,250"}
            originalPrice={isPromoActive ? "1,250" : undefined}
            whatsappLink={generateWhatsAppLink(
              "Plus",
              isPromoActive ? "1,000" : "1,250",
              isPromoActive,
            )}
            features={[
              "Animación de apertura de invitación",
              "Portada con una o varias imágenes",
              "Ubicación GPS de ceremonia y recepción",
              "Mesa de Regalos (Sobres/Tiendas)",
              "RSVP Básico (confirmación via WhatsApp)",
              "Música instrumental de Fondo",
              "Timeline del Evento",
              "Botón de Agregar al Calendario",
              "Cuenta regresiva",
              "Envíos ilimitados",
            ]}
          />
          <PricingCard
            title="Diamante"
            subtitle="Gestión Total"
            price={isPromoActive ? "1,500" : "1,900"}
            originalPrice={isPromoActive ? "1,900" : undefined}
            recommended={true}
            whatsappLink={generateWhatsAppLink(
              "Diamante",
              isPromoActive ? "1,500" : "1,900",
              isPromoActive,
            )}
            features={[
              "Todo lo incluido en Plus",
              "Gestión Avanzada de Invitados (RSVP)",
              "Confirmaciones de invitados en tiempo real",
              "Control de Accesos por Familia",
              "Visualización de mensajes de los invitados",
              "Sección de actividad de invitados",
              "Atención prioritaria",
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
