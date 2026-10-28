"use client";
import TextureButton from "@/features/shared/components/TextureButton";
import { useEmblaCarouselWithAutoplay } from "@/features/front/hooks/useEmblaCarouselWithAutoplay";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpDown,
  BarChart3,
  CalendarClock,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  EyeOff,
  Filter,
  History,
  LayoutGrid,
  ListFilter,
  LockKeyhole,
  MessageCircle,
  MessageCircleHeart,
  Move,
  QrCode,
  ScanLine,
  Search,
  Settings2,
  Tags,
  Ticket,
  UserCheck,
  UserPen,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import SectionTitle from "./SectionTitle";

// `useLayoutEffect` no debe ejecutarse en el servidor (Next.js avisa).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

interface AdminSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  features: { icon: ReactNode; title: string; text: string }[];
}

const ADMIN_SLIDES: AdminSlide[] = [
  {
    id: "resumen",
    image: "/img/landing/dashboard.webp",
    title: "Dashboard Central",
    description:
      "Todo tu evento en un vistazo: métricas en vivo, actividad reciente y cuenta regresiva.",
    features: [
      {
        icon: <BarChart3 size={20} />,
        title: "Métricas del Evento",
        text: "Confirmadas, declinadas y sin responder por invitados, familias o logística.",
      },
      {
        icon: <Activity size={20} />,
        title: "Actividad Reciente",
        text: "Los últimos movimientos de tus invitados, al instante.",
      },
      {
        icon: <MessageCircleHeart size={20} />,
        title: "Muro de Deseos",
        text: "Los mensajes de cariño que te dejan en la invitación.",
      },
      {
        icon: <CalendarClock size={20} />,
        title: "Cuenta Regresiva",
        text: "Días, horas y minutos que faltan para el gran día.",
      },
    ],
  },
  {
    id: "lista",
    image: "/img/landing/lista-invitados.webp",
    title: "Gestión de Familias",
    description:
      "Tu base de datos completa. Busca, filtra y organiza a tus invitados por familias, etiquetas o estado.",
    features: [
      {
        icon: <Users size={20} />,
        title: "Familias e Invitados",
        text: "Total, confirmados, pendientes y rechazados de un vistazo.",
      },
      {
        icon: <Filter size={20} />,
        title: "Filtros y Búsqueda",
        text: "Filtra por WhatsApp enviado, etiqueta o edición permitida.",
      },
      {
        icon: <MessageCircle size={20} />,
        title: "Envío por WhatsApp",
        text: "Comparte la invitación y los recordatorios con un clic.",
      },
      {
        icon: <LockKeyhole size={20} />,
        title: "Cambios Bloqueados",
        text: "Tú decides si la familia puede editar o no su respuesta.",
      },
    ],
  },
  {
    id: "formulario",
    image: "/img/landing/formulario-invitado.webp",
    title: "Registro de Familias",
    description:
      "Agrega familias completas, asigna pases y personaliza el mensaje de bienvenida.",
    features: [
      {
        icon: <UserPen size={20} />,
        title: "Registro en un Click",
        text: "Ajusta la información de la familia en un solo click.",
      },
      {
        icon: <Ticket size={20} />,
        title: "Límite de pases",
        text: "Define los pases totales y permiso de ingreso de niños.",
      },
      {
        icon: <Tags size={20} />,
        title: "Etiquetas",
        text: "Asigna etiquetas a familias para una mejor organización.",
      },
      {
        icon: <CalendarClock size={20} />,
        title: "Fecha Límite",
        text: "Controla hasta cuándo pueden confirmar su asistencia.",
      },
    ],
  },
  {
    id: "mesas",
    image: "/img/landing/gestion-mesas.webp",
    title: "Planificador de Mesas",
    description:
      "Diseña el salón a tu medida. Crea mesas, asigna invitados y exporta el plano final.",
    features: [
      {
        icon: <LayoutGrid size={20} />,
        title: "Mesas y Asientos",
        text: "Crea cada mesa con el número de asientos que necesites.",
      },
      {
        icon: <Move size={20} />,
        title: "Arrastrar y Soltar",
        text: "Asigna familias e invitados a las mesas con un clic.",
      },
      {
        icon: <Settings2 size={20} />,
        title: "Tamaño y Rotación",
        text: "Ajusta las dimensiones y la orientación de cada mesa.",
      },
      {
        icon: <Download size={20} />,
        title: "Exportar Plano",
        text: "Descarga el plano final para compartirlo o imprimirlo.",
      },
    ],
  },
  {
    id: "acceso",
    image: "/img/landing/accesos-evento.webp",
    title: "Control de Acceso",
    description:
      "Registra los ingresos en la puerta. Escáner QR, directorio y control de pases en tiempo real.",
    features: [
      {
        icon: <ScanLine size={20} />,
        title: "Escáner QR",
        text: "Registra el ingreso con la cámara del dispositivo.",
      },
      {
        icon: <ClipboardCheck size={20} />,
        title: "Directorio de Invitados",
        text: "Busca y filtra por estado de acceso en el momento.",
      },
      {
        icon: <QrCode size={20} />,
        title: "Pase de Acceso",
        text: "Cada invitado lleva su QR listo en el teléfono.",
      },
      {
        icon: <UserCheck size={20} />,
        title: "Control de Ingreso",
        text: "Registra el número de personas que ingresan en cada ocasión.",
      },
    ],
  },
  {
    id: "actividad",
    image: "/img/landing/actividad-invitados.webp",
    title: "Actividad de Invitados",
    description:
      "Sigue paso a paso todo lo que hacen tus invitados, desde que abren su invitación.",
    features: [
      {
        icon: <History size={20} />,
        title: "Historial por Familia",
        text: "Aperturas, confirmaciones y rechazos en una línea de tiempo.",
      },
      {
        icon: <ListFilter size={20} />,
        title: "Filtros por Tipo",
        text: "Confirmaciones, visualizaciones y rechazos por separado.",
      },
      {
        icon: <EyeOff size={20} />,
        title: "Vistas sin Responder",
        text: "Visualiza las familias que no han abierto su invitación.",
      },
      {
        icon: <ArrowUpDown size={20} />,
        title: "Ordenar y Buscar",
        text: "Ordena por más recientes o más antiguos y localiza a cualquier invitado.",
      },
    ],
  },
  {
    id: "mensajes",
    image: "/img/landing/mensajes-especiales.webp",
    title: "Mensajes y Bendiciones",
    description:
      "El muro de mensajes de tus invitados. Bendiciones, bromas y tradiciones en un solo lugar.",
    features: [
      {
        icon: <MessageCircleHeart size={20} />,
        title: "Muro de Mensajes",
        text: "Mira todos los mensajes y buenos deseos que tus invitados te envían.",
      },
      {
        icon: <Search size={20} />,
        title: "Búsqueda Rápida",
        text: "Encuentra cualquier mensaje al instante.",
      },
      {
        icon: <CheckCheck size={20} />,
        title: "Marcar como Leídos",
        text: "Limpia el muro de un solo toque.",
      },
      {
        icon: <MessageCircle size={20} />,
        title: "Nuevos y Leídos",
        text: "Separa lo pendiente de lo que ya has visto.",
      },
    ],
  },
];

/**
 * Cuerpo de un slide. Se reutiliza en la versión visible y en la copia
 * oculta que sirve para medir la altura de cada slide.
 */
const SlideContent: React.FC<{ slide: AdminSlide; animated?: boolean }> = ({
  slide,
  animated = false,
}) => (
  <>
    <div className="space-y-2">
      <h3 className="font-serif text-3xl md:text-4xl text-primary">
        {slide.title}
      </h3>
      <p className="text-charcoal-400 text-base leading-relaxed">
        {slide.description}
      </p>
    </div>

    <div className="space-y-3 overflow-hidden pb-3">
      {slide.features.map((feature, idx) => {
        const item = (
          <AdminFeatureItem
            icon={feature.icon}
            title={feature.title}
            text={feature.text}
          />
        );

        if (!animated) return <div key={idx}>{item}</div>;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            {item}
          </motion.div>
        );
      })}
    </div>
  </>
);

const AdminShowcase: React.FC = () => {
  /**
   * Mismo hook y mismas reglas que el carrusel de la galería de las
   * invitaciones: el autoplay sólo corre con el carrusel a la vista, se
   * detiene al interactuar y reinicia el contador en cada acción (flechas,
   * puntitos y drag).
   */
  const {
    emblaRef,
    emblaApi,
    ref: wrapperRef,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useEmblaCarouselWithAutoplay({
    emblaOptions: { loop: true },
    autoplay: {
      delay: 2000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: false,
      // La raíz del autoplay es toda la sección: así el hover sobre la lista
      // de características también pausa, no sólo el de las imágenes.
      rootNode: (root) => root.closest("#dashboard") ?? root,
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Sincronizar estado de selección
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const activeSlide = ADMIN_SLIDES[selectedIndex];

  /**
   * Altura reservada para el bloque de contenido.
   *
   * Los slides tienen textos de distinta longitud, así que su altura varía y
   * el botón de abajo daría un salto brusco al cambiar de slide. Para evitarlo
   * se miden todos los slides en una copia oculta (que tiene exactamente el
   * mismo ancho) y se reserva siempre la altura del más alto: el bloque
   * mantiene su tamaño y el botón nunca se desplaza.
   */
  const measureRef = useRef<HTMLDivElement>(null);
  const [reservedHeight, setReservedHeight] = useState<number | undefined>(
    undefined,
  );

  const measureSlides = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const tallest = Math.max(
      ...Array.from(el.children).map((child) =>
        Math.round(child.getBoundingClientRect().height),
      ),
    );
    if (!tallest) return;
    setReservedHeight((prev) => (prev === tallest ? prev : tallest));
  }, []);

  useIsomorphicLayoutEffect(measureSlides);

  // Al redimensionar cambia el ancho y con él el alto de los textos.
  useEffect(() => {
    window.addEventListener("resize", measureSlides);
    return () => window.removeEventListener("resize", measureSlides);
  }, [measureSlides]);

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
          <div
            ref={wrapperRef}
            className="relative flex-[3] w-full aspect-[16/9] xl:h-[400px]"
          >
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
            <div
              className="relative flex flex-col justify-center"
              style={{ minHeight: reservedHeight }}
            >
              {/* Copia oculta: mide la altura de cada slide para reservar
                  siempre la del más alto y que el botón no salte. */}
              <div
                ref={measureRef}
                aria-hidden
                className="invisible absolute inset-x-0 top-0 h-0 overflow-hidden pointer-events-none"
              >
                {ADMIN_SLIDES.map((slide) => (
                  <div key={slide.id} className="space-y-6">
                    <SlideContent slide={slide} />
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <SlideContent slide={activeSlide} animated />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="mx-auto">
          <TextureButton
            onClick={() =>
              window.open(
                `https://wa.me/+526148750265?text=${encodeURIComponent("Hola me comunico para saber más información sobre el demo de la gestión de invitados para una invitación digital.")}`,
                "_blank",
              )
            }
          >
            Solicita tu Demo
          </TextureButton>
        </div>
      </div>
    </section>
  );
};

export default AdminShowcase;
