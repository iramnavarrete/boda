import CheersIcon from "@/icons/cheers-icon";
import { useEffect, useRef } from "react";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import { motion, animate, useInView, AnimationSequence } from "framer-motion";
import ChurchIcon from "@/icons/church-icon";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground2 from "@/icons/flowers-background-2";
import {
  churchSequence,
  glassesSequence,
} from "@/constants/animationSequences";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatTo12Hour } from "@/utils/formatters";
import { cn } from "@heroui/theme";
import { ArrowRight, Ban } from "lucide-react";
import LadiesShoeIcon from "@/icons/ladies-shoe-icon";
import TieIcon from "@/icons/tie-icon";

interface EditorialEventProps {
  time: string;
  place: string;
  address: string;
  link: string;
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
  textClassName?: string;
  typeEvent: string;
}

const EditorialEvent: React.FC<EditorialEventProps> = ({
  address,
  place,
  time,
  link,
  IconComponent,
  title,
  sequence,
  textClassName = "",
  typeEvent,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(sequence);
  }, [isInView, sequence]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full max-w-sm mx-auto relative z-10 text-primary",
        textClassName,
      )}
    >
      <AnimatedEntrance classname="w-full flex flex-col items-center">
        <motion.div ref={ref} className={cn("mb-4 bg-accent p-4 rounded-full")}>
          <IconComponent />
        </motion.div>
        <p className="text-[9px] font-nourdMedium text-current opacity-60 uppercase tracking-[0.4em] mb-2 text-center">
          {typeEvent}
        </p>
        <p
          className={cn(
            "text-5xl font-newIconScript mb-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)]",
            textClassName,
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-current text-center text-lg font-nourdMedium tracking-widest mb-4",
            textClassName,
          )}
        >
          {formatTo12Hour(time)}
        </p>
        <p
          className={cn(
            "text-current text-center text-base font-nourdMedium mb-2 px-4",
            textClassName,
          )}
        >
          {place}
        </p>
        <div
          className={cn(
            "text-current opacity-70 text-center leading-relaxed text-sm font-nourdLight mb-6 px-6",
            textClassName,
          )}
        >
          <p className="whitespace-pre-wrap">{address.replaceAll(",", "\n")}</p>
        </div>
        <a
          className="group flex items-center gap-2 text-[10px] font-nourdMedium uppercase tracking-[0.2em] border-b border-current pb-1 hover:border-current transition-all"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver ubicación{" "}
          <ArrowRight
            size={12}
            className="opacity-70 group-hover:translate-x-1 transition-transform"
          />
        </a>
      </AnimatedEntrance>
    </div>
  );
};

// ============================================================================
// COMPONENTE DRESS CODE (INTEGRADO Y FORMAL)
// ============================================================================

type ColorPalette = {
  hex: string;
  name: string;
}[];

interface DressCodeSection {
  title: string;
  description: string;
  restrictions: string;
}

interface DressCodeProps {
  title: string;
  text: string;
  womenConfig: DressCodeSection;
  menConfig: DressCodeSection;
  forbiddenColors: ColorPalette;
  textClassName?: string;
}

const DressCode: React.FC<DressCodeProps> = ({
  title,
  text,
  womenConfig,
  menConfig,
  forbiddenColors,
  textClassName,
}) => {
  // Lógica para distribuir los colores simétricamente
  const getColorRows = (colors: ColorPalette) => {
    if (!colors || colors.length === 0) return [];
    if (colors.length <= 6) return [colors]; // Si son 6 o menos, 1 sola fila

    // Si son más de 6, partimos el arreglo en 2 mitades balanceadas
    const half = Math.ceil(colors.length / 2);
    return [colors.slice(0, half), colors.slice(half)];
  };

  const colorRows = getColorRows(forbiddenColors || []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full mx-auto z-10 pt-10",
        textClassName,
      )}
    >
      <AnimatedEntrance classname="w-full flex flex-col items-center">
        {/* Overline & Título Principal */}
        <p className="text-[10px] font-nourdMedium text-current opacity-70 uppercase tracking-[0.3em] mb-4 text-center">
          — La etiqueta del evento —
        </p>
        <h2 className="text-4xl md:text-5xl text-current mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
          {title}
        </h2>

        {/* Separador Sutil */}
        <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
          <span className="text-current opacity-50 text-xs">✦</span>
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
        </div>

        {/* Texto de Descripción General */}
        <p className="text-current opacity-90 font-nourdLight text-center max-w-md mb-14 leading-relaxed text-base px-4">
          {text}
        </p>

        {/* Estilos (Mujeres y Hombres) */}
        <div className="flex flex-col gap-16 w-full max-w-md mx-auto px-4 mb-16">
          {/* Bloque Mujeres */}
          <div className="flex flex-col items-center text-center">
            <LadiesShoeIcon
              className="text-current opacity-60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-current mb-3">
              {womenConfig.title}
            </h3>
            <p className="text-current opacity-80 text-sm leading-relaxed mb-5 font-nourdLight px-2">
              {womenConfig.description}
            </p>
            {womenConfig.restrictions && (
              <span className="text-[10px] font-nourdMedium uppercase tracking-[0.1em] text-current opacity-90 bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-5 py-2 rounded-md mb-6 border border-[color-mix(in_srgb,currentColor_20%,transparent)]">
                {womenConfig.restrictions}
              </span>
            )}

            {/* Paleta de Colores Prohibidos Integrada en Mujeres */}
            {colorRows.length > 0 && (
              <div className="flex flex-col items-center border border-[color-mix(in_srgb,currentColor_20%,transparent)] bg-[color-mix(in_srgb,currentColor_5%,transparent)] rounded-2xl py-6 w-full relative mt-2">
                <p className="text-[9px] font-nourdMedium text-current opacity-80 uppercase tracking-[0.2em] text-center mb-5">
                  Colores Exclusivos (No Permitidos)
                </p>

                {/* Contenedor de Filas Dinámicas */}
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                  {colorRows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
                    >
                      {row.map((color, idx) => (
                        <div
                          key={idx}
                          className="relative group flex flex-col items-center justify-center"
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow-sm border-2 border-white transition-transform group-hover:scale-110 cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                          />
                          {/* Tooltip animado */}
                          <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 flex flex-col items-center translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-[9px] font-nourdMedium uppercase tracking-widest shadow-lg border border-primary/10 whitespace-nowrap">
                              {color.name}
                            </div>
                            <div className="w-2 h-2 bg-white/95 border-r border-b border-primary/10 rotate-45 -mt-1 shadow-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <p className="text-current opacity-60 text-[11px] italic font-serif mt-5 text-center px-4">
                  *Tonalidades reservadas estrictamente para la novia y las
                  damas de honor.
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex justify-center opacity-30">
            <div className="w-24 h-px bg-current"></div>
          </div>

          {/* Bloque Hombres */}
          <div className="flex flex-col items-center text-center">
            <TieIcon
              className="text-current opacity-60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-current mb-3">
              {menConfig.title}
            </h3>
            <p className="text-current opacity-80 text-sm leading-relaxed mb-5 font-nourdLight px-2">
              {menConfig.description}
            </p>
            {menConfig.restrictions && (
              <span className="text-[10px] font-nourdMedium uppercase tracking-[0.1em] text-current opacity-90 bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-5 py-2 rounded-md border border-[color-mix(in_srgb,currentColor_20%,transparent)]">
                {menConfig.restrictions}
              </span>
            )}
          </div>
        </div>
      </AnimatedEntrance>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL (EXPORTADO)
// ============================================================================

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  textDressCode?: string;
  hasNoDinner?: boolean;
  womenConfig?: DressCodeSection;
  menConfig?: DressCodeSection;
  forbiddenColors?: ColorPalette;
};

export default function CeremonyToast({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  textDressCode = "Para nosotros es muy importante compartir este día tan especial con ustedes. Nos encantaría que nos acompañen luciendo su mejor atuendo, respetando la etiqueta sugerida para mantener la armonía de nuestra celebración.",
  hasNoDinner = false,

  // Textos formales y extensos
  womenConfig = {
    title: "Damas",
    description:
      "Sugerimos elegir un vestido de gala largo o de corte midi que denote elegancia y distinción. Las telas con caídas suaves y cortes refinados son ideales para la ocasión.",
    restrictions: "Prohibido el uso de blanco y paleta de damas",
  },
  menConfig = {
    title: "Caballeros",
    description:
      "Recomendamos optar por un traje formal clásico o un estilo vaquero elegante que esté a la altura de la celebración. Un saco bien entallado será la elección perfecta.",
    restrictions: "Exclusivamente mezclilla negra (tonos azules no permitidos)",
  },

  // Nombres elegantes para la paleta Borgoña + Blanco
  forbiddenColors = [
    { hex: "#FFFFFF", name: "Blanco / Marfil" },
    { hex: "#FCAFC8", name: "Rosa Palo" },
    { hex: "#CB5D78", name: "Rosa Viejo" },
    { hex: "#B64160", name: "Frambuesa" },
    { hex: "#8D163A", name: "Borgoña" },
    { hex: "#53071B", name: "Vino Tinto" },
  ],
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  return (
    <div className="w-full flex flex-col relative">
      <div className="w-full relative z-20 -mt-11 pointer-events-none drop-shadow-[0_-24px_10px_rgba(0,0,0,0.10)]">
        <BeigeWaves className="w-full h-12 block scale-y-[-1]" />
      </div>

      <div
        className={cn(
          "w-full relative text-medium bg-accent overflow-hidden",
          containerClassName,
        )}
      >
        <div className="px-5 relative min-h-screen">
          <FlowersBackground2
            className="absolute h-[70%] 2xl:h-[95%] w-full left-0 top-12 z-0 opacity-80"
            color={svgsColor}
          />

          <div className="px-4 py-24 flex flex-col gap-24 relative z-10">
            <EditorialEvent
              IconComponent={() => (
                <ChurchIcon
                  className="w-[60px] h-[60px] animated-church"
                  color={svgsColor}
                />
              )}
              sequence={churchSequence}
              address={invitationData?.ceremonia.direccion || ""}
              link={invitationData?.ceremonia.enlaceMaps || "#"}
              place={invitationData?.ceremonia.nombreTemplo || ""}
              time={invitationData?.ceremonia.hora || ""}
              title="Ceremonia"
              textClassName={textClassName}
              typeEvent="Misa"
            />

            <EditorialEvent
              IconComponent={() => (
                <CheersIcon
                  className="w-[60px] h-[60px] animated-glasses"
                  color={svgsColor}
                />
              )}
              sequence={glassesSequence}
              address={invitationData?.recepcion.direccion || ""}
              link={invitationData?.recepcion.enlaceMaps || "#"}
              place={invitationData?.recepcion.nombreSalon || ""}
              time={invitationData?.recepcion.hora || ""}
              title="Recepción"
              textClassName={textClassName}
              typeEvent="Fiesta"
            />

            {hasNoDinner && (
              <AnimatedEntrance>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center w-full mt-4 max-w-md mx-auto text-center z-10 text-primary",
                    textClassName,
                  )}
                >
                  <div className="w-full py-4 relative">
                    <div className="flex items-center justify-center gap-3 mb-4 opacity-60">
                      <div className="w-12 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
                      <span className="text-current opacity-50 text-xs">✦</span>
                      <div className="w-12 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
                    </div>

                    <p className="text-[9px] font-nourdMedium text-current opacity-60 uppercase tracking-[0.4em] mb-4">
                      — Nota Importante —
                    </p>
                    <p
                      className={cn(
                        "text-current opacity-90 font-nourdLight text-sm leading-relaxed bg-[color-mix(in_srgb,currentColor_3%,transparent)] p-3 rounded-lg border border-[color-mix(in_srgb,currentColor_40%,transparent)]",
                        textClassName,
                      )}
                    >
                      Queremos que disfruten al máximo de nuestra celebración.
                      Por ello, les informamos que{" "}
                      <span className="font-nourdMedium">
                        no se servirá cena formal
                      </span>{" "}
                      durante el evento, para que puedan tomar sus precauciones.
                      ¡Habrá mucha música, brindis y alegría!
                    </p>
                  </div>
                </div>
              </AnimatedEntrance>
            )}
          </div>
        </div>

        {/* SECCIÓN DEL CÓDIGO DE VESTIMENTA */}
        {/* Le agregamos la clase text-accent para que el text-current del hijo lo herede */}
        <div
          className={cn(
            "px-5 bg-primary w-full pb-24 pt-16 relative z-10 text-accent",
            svgsColor ? `bg-[${svgsColor}]` : "",
          )}
        >
          <div className="flex flex-col gap-16">
            <DressCode
              title="Código de vestimenta"
              text={textDressCode}
              womenConfig={womenConfig}
              menConfig={menConfig}
              forbiddenColors={forbiddenColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}