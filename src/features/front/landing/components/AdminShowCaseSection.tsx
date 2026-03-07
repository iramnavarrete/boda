"use client";
import TextureButton from "@/features/shared/components/TextureButton";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  Lock,
  MousePointerClick,
  QrCode,
  RotateCcw,
  Send,
  Users,
} from "lucide-react";
import Image from "next/image";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  text: string;
}

const AdminFeatureItem: React.FC<
  FeatureItemProps & { style?: React.CSSProperties; className?: string }
> = ({ icon, title, text, style, className }) => (
  <div
    className={`flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-transparent hover:border-gold/30 hover:bg-paper hover:shadow-md transition-all duration-300 group/item ${className}`}
    style={style}
  >
    <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 text-gold shadow-sm border border-border-button/30 group-hover/item:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="relative z-10">
      <h4 className="font-serif text-base text-primary mb-1 font-bold">
        {title}
      </h4>
      <p className="text-charcoal-400 text-xs font-light leading-relaxed">
        {text}
      </p>
    </div>
  </div>
);

const ADMIN_SLIDES = [
  {
    id: "resumen",
    image: "/img/landing/dashboard.png",
    title: "Dashboard Central",
    description:
      "Visualiza el estado de tu evento en tiempo real. Gráficas de confirmación, actividad reciente y accesos rápidos.",
    features: [
      {
        icon: <BarChart3 size={20} />,
        title: "Estadísticas en Vivo",
        text: "Confirmados, pendientes y declinados.",
      },
      {
        icon: <RotateCcw size={20} />,
        title: "Actividad Reciente",
        text: "Historial de cambios y confirmaciones.",
      },
      {
        icon: <Lock size={20} />,
        title: "Seguridad",
        text: "Controla quién puede editar su respuesta.",
      },
    ],
  },
  {
    id: "lista",
    image: "/img/landing/lista-invitados.png",
    title: "Gestión de Invitados",
    description:
      "Tu base de datos completa. Filtra, busca, edita y organiza a tus invitados por familias o grupos.",
    features: [
      {
        icon: <Filter size={20} />,
        title: "Filtros Inteligentes",
        text: "Encuentra rápidamente por estado o nombre.",
      },
      {
        icon: <Send size={20} />,
        title: "Envío WhatsApp",
        text: "Comparte la invitación con un solo clic.",
      },
      {
        icon: <FileSpreadsheet size={20} />,
        title: "Exportar Datos",
        text: "Descarga tu lista para proveedores.",
      },
    ],
  },
  {
    id: "formulario",
    image: "/img/landing/formulario-invitado.png",
    title: "Registro Familiar",
    description:
      "Agrega familias completas fácilmente, asigna pases y personaliza mensajes de bienvenida.",
    features: [
      {
        icon: <Users size={20} />,
        title: "Agrupación Familiar",
        text: "Gestiona pases por grupo o familia.",
      },
      {
        icon: <QrCode size={20} />,
        title: "Pases QR",
        text: "Generación automática de accesos.",
      },
      {
        icon: <MousePointerClick size={20} />,
        title: "Edición Fácil",
        text: "Interfaz intuitiva y rápida.",
      },
    ],
  },
];

const AdminShowcase: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    if (emblaApi) emblaApi.plugins().autoplay?.stop();
  };

  const handleMouseLeave = () => {
    if (emblaApi) emblaApi.plugins().autoplay?.play();
  };

  // --- INTERSECTION OBSERVER PARA CONTROLAR AUTOPLAY ---
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Si la sección es visible, inicia (o reanuda) el autoplay
          autoplay.play();
        } else {
          // Si la sección sale de pantalla, detiene el autoplay para ahorrar recursos
          autoplay.stop();
        }
      },
      { threshold: 0.2 }, // Se activa cuando el 20% de la sección es visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      // Limpieza opcional: asegurar que se detenga al desmontar
      autoplay.stop();
    };
  }, [emblaApi]);

  // Sincronizar estado de selección
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const activeSlide = ADMIN_SLIDES[selectedIndex];

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-paper relative overflow-visible"
      id="dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col gap-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto">
          <SectionTitle subtitle="Panel de Control">
            Gestión Inteligente
          </SectionTitle>
          <p className="text-cool-gray text-lg font-light -mt-8 leading-relaxed">
            Una plataforma poderosa diseñada para darte el control total de tu
            evento. Administra tus invitados desde un solo sitio hermoso e
            intuitivo.
          </p>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="flex flex-col px-2 sm:px-6 md:px-8 xl:flex-row gap-12 lg:gap-20 items-center min-h-[500px]">
          {/* COLUMNA IZQUIERDA: CARRUSEL DE IMÁGENES */}
          <div className="relative flex-[3] w-full aspect-[16/9] xl:h-[400px]">
            {/* Marco Decorativo */}
            <div className="absolute inset-0 bg-gold/5 transform translate-x-4 translate-y-4 -z-10 rounded-3xl"></div>

            {/* Embla Viewport */}
            <div
              className="overflow-hidden rounded-2xl shadow-2xl border border-border-button bg-paper h-full relative"
              ref={emblaRef}
            >
              <div className="flex h-full">
                {ADMIN_SLIDES.map((slide) => (
                  <div
                    className="flex-[0_0_100%] min-w-0 relative h-full group"
                    key={slide.id}
                  >
                    {/* Header de navegador falso */}
                    <div className="h-8 bg-primary/5 border-b border-primary/10 flex items-center px-4 gap-2 z-20 backdrop-blur-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/50"></div>
                    </div>
                    {/* Imagen */}
                    <div className="relative w-full h-full pt-8">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={slide.id === "resumen"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO DINÁMICA CON TRANSICIONES SUAVES */}
          <div className="flex-[2] flex-col justify-center gap-6 w-full">
            {/* BARRA DE CONTROL: Indicadores + Flechas */}
            <div className="flex items-center justify-between pb-4 mb-2">
              {/* Indicadores */}
              <div className="flex gap-2">
                {ADMIN_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? "w-8 bg-gold" : "w-2 bg-border-button hover:bg-gold/50"}`}
                  />
                ))}
              </div>

              {/* Flechas de Navegación */}
              <div className="flex gap-2">
                <button
                  onClick={scrollPrev}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border-button text-charcoal-400 hover:text-primary hover:border-primary hover:bg-paper transition-all"
                  title="Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={scrollNext}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border-button text-charcoal-400 hover:text-primary hover:border-primary hover:bg-paper transition-all"
                  title="Siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Contenedor de contenido cambiante con AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                onHoverEnd={handleMouseLeave}
                onHoverStart={handleMouseEnter}
                key={activeSlide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Título y Descripción */}
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl md:text-4xl text-primary">
                    {activeSlide.title}
                  </h3>
                  <p className="text-charcoal-400 text-base leading-relaxed">
                    {activeSlide.description}
                  </p>
                </div>

                {/* Lista de Features */}
                <div className="space-y-3 overflow-hidden pb-3">
                  {activeSlide.features.map((feature, idx) => (
                    <motion.div
                      key={`${activeSlide.id}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                    >
                      <AdminFeatureItem
                        icon={feature.icon}
                        title={feature.title}
                        text={feature.text}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mx-auto">
          <TextureButton
            onClick={() => window.open("https://bodajy.info/admin", "_blank")}
          >
            Solicita tu Demo
          </TextureButton>
        </div>
      </div>
    </section>
  );
};

export default AdminShowcase;
