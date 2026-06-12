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
import { Info } from "lucide-react";
import LadiesShoeIcon from "@/icons/ladies-shoe-icon";
import TieIcon from "@/icons/tie-icon";

interface CardEventProps {
  time: string;
  place: string;
  address: string;
  link: string;
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
  textClassName?: string;
  mapBtnClassName?: string;
}

const CardEvent: React.FC<CardEventProps> = ({
  address,
  place,
  time,
  link,
  IconComponent,
  title,
  sequence,
  textClassName = "",
  mapBtnClassName = "",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(sequence);
  }, [isInView, sequence]);

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div ref={ref}>
        <IconComponent />
      </motion.div>
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center">
          <p
            className={cn(
              "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary",
              textClassName,
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              "text-primary text-center leading-6 pt-5 text-lg font-nourdMedium",
              textClassName,
            )}
          >
            <p>{formatTo12Hour(time)}</p>
          </div>
          <div
            className={cn(
              "my-3 text-primary text-center text-lg font-nourdMedium",
              textClassName,
            )}
          >
            <p>{place}</p>
          </div>
          <div
            className={cn(
              "text-primary text-center leading-5 text-sm",
              textClassName,
            )}
          >
            <p className="whitespace-pre-wrap">
              {address.replaceAll(",", "\n")}
            </p>
          </div>
          <a
            className={cn(
              "border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary transition-all hover:scale-95",
              mapBtnClassName,
            )}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mapa
          </a>
        </div>
      </AnimatedEntrance>
    </div>
  );
};

type ColorPalette = {
  hex: string;
  name: string;
}[];

interface DressCodeProps {
  title: string;
  text: string;
  arrayRestrictions?: string[];
  colorPalette: ColorPalette;
}

const DressCode: React.FC<DressCodeProps> = ({
  title,
  text,
  arrayRestrictions = [],
  colorPalette
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto z-10 pt-10">
      <BeigeWaves className="w-full absolute h-12 left-0 top-[-40px] scale-y-[-1]" />

      <AnimatedEntrance classname="w-full flex flex-col items-center">
        {/* Overline & Título Principal */}
        <p className="text-[10px] font-nourdMedium text-accent/70 uppercase tracking-[0.3em] mb-4 text-center">
          — La etiqueta del evento —
        </p>
        <h2 className="text-4xl md:text-5xl text-accent mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
          {title}
        </h2>

        {/* Separador Sutil */}
        <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
          <div className="w-12 h-px bg-accent/30" />
        </div>

        {/* Texto de Descripción */}
        <p className="text-accent/90 font-nourdLight text-center max-w-md mb-8 leading-relaxed text-lg px-4">
          {text} <br />
          <span className="opacity-80 text-sm mt-1 block">
            Paletas cromáticas inspiradas en la sutileza de la naturaleza.
          </span>
        </p>

        {/* Paleta de Colores (Círculos) con Tooltips */}
        <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-full shadow-lg border border-primary/10 mb-12">
          {colorPalette.map((color, idx) => (
            <div
              key={idx}
              className="relative group flex items-center justify-center"
            >
              <div
                className="w-8 h-8 rounded-full shadow-inner border border-black/10 transition-transform group-hover:scale-110 cursor-pointer"
                style={{ backgroundColor: color.hex }}
              />
              {/* Tooltip animado */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 flex flex-col items-center translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-[9px] font-nourdMedium uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-primary/10 whitespace-nowrap">
                  {color.name}
                </div>
                <div className="w-2.5 h-2.5 bg-white/95 border-r border-b border-primary/10 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.05)]"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tarjetas de Estilo (Mujeres y Hombres) en UNA SOLA columna */}
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto px-4 mb-8">
          {/* Tarjeta Mujeres */}
          <div className="bg-white/90 rounded-3xl p-8 border border-primary/10 shadow-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-5 border border-primary/10 shadow-sm">
              <LadiesShoeIcon
                className="text-primary/70 w-6 h-6"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="font-nourdMedium text-xl text-primary mb-3">
              Mujeres
            </h3>
            <p className="text-primary/80 text-sm leading-relaxed mb-6 font-nourdLight">
              Sugerimos vestidos de gala o corte midi con caída suave. Los
              colores terrosos, verde olivo y matices neutros armonizan
              idealmente con el entorno.
            </p>
            <div className="mt-auto inline-flex items-center gap-2 px-5 py-2 bg-stone-100 text-stone-600 rounded-full text-[9px] font-nourdMedium uppercase tracking-widest border border-stone-200 shadow-sm">
              Omitir blanco y marfil
            </div>
          </div>

          {/* Tarjeta Hombres */}
          <div className="bg-white/90 rounded-3xl p-8 border border-primary/10 shadow-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-5 border border-primary/10 shadow-sm">
              <TieIcon className="text-primary/70 w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-nourdMedium text-xl text-primary mb-3">
              Hombres
            </h3>
            <p className="text-primary/80 text-sm leading-relaxed mb-6 font-nourdLight">
              Recomendamos el uso de lino, guayaberas formales o trajes en
              tonalidades tierra y bosque. Un estilo sofisticado, fresco y ad
              hoc a la velada.
            </p>
            <div className="mt-auto inline-flex items-center gap-2 px-5 py-2 bg-stone-100 text-stone-600 rounded-full text-[9px] font-nourdMedium uppercase tracking-widest border border-stone-200 shadow-sm">
              Omitir bermudas y calzado informal
            </div>
          </div>
        </div>

        {/* Píldoras de Restricciones Extra (Dinámicas) */}
        {arrayRestrictions && arrayRestrictions.length > 0 && (
          <div className="flex flex-col gap-3 px-4">
            {arrayRestrictions.map((restriction, idx) => (
              <div
                key={`restriction-${idx}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white/80 rounded-full border border-primary/10 shadow-md transition-transform hover:scale-105"
              >
                <span className="text-primary/50">
                  <Info size={16} strokeWidth={1.5} />
                </span>
                <span className="text-primary font-nourdLight text-sm text-center">
                  {restriction}
                </span>
              </div>
            ))}
          </div>
        )}
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
  mapBtnClassName?: string;
  arrayRestrictions?: string[];
  textDressCode?: string;
  hasNoDinner?: boolean;
  colorPalette?: ColorPalette;
};

export default function CeremonyToast({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  mapBtnClassName = "",
  arrayRestrictions = ["El color blanco es exclusivo de la novia"],
  textDressCode = "Formal",
  hasNoDinner = false,
  colorPalette = [
    { hex: "#2C3627", name: "Verde Noche" },
    { hex: "#4A5B4D", name: "Verde Bosque" },
    { hex: "#787E6D", name: "Verde Olivo" },
    { hex: "#A5A299", name: "Gris Piedra" },
    { hex: "#D1CFC2", name: "Arena" },
    { hex: "#5C4A3D", name: "Tierra" },
  ],
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  return (
    <div className="mt-[-100%]">
      <div
        className={cn(
          "w-full relative text-medium bg-accent",
          containerClassName,
        )}
      >
        <div className="px-5 relative">
          <FlowersBackground2
            className="absolute h-[70%] 2xl:h-[95%] w-full left-0 top-12 z-0"
            color={svgsColor}
          />
          <div className="px-8 py-20 flex flex-col gap-16 relative z-10">
            <CardEvent
              IconComponent={() => (
                <ChurchIcon
                  className="w-[70px] h-[70px] animated-church"
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
              mapBtnClassName={mapBtnClassName}
            />
            <CardEvent
              IconComponent={() => (
                <CheersIcon
                  className="w-[70px] h-[70px] animated-glasses"
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
              mapBtnClassName={mapBtnClassName}
            />

            {hasNoDinner && (
              <AnimatedEntrance>
                <div className="flex flex-col items-center justify-center w-full px-4 mt-8 mb-4">
                  <h2
                    className={cn(
                      "text-xl font-newIconScript text-amber-900 mb-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.1)]",
                      textClassName,
                    )}
                  >
                    Información Importante
                  </h2>
                  <div className="border border-amber-900/20 rounded-xl p-3 bg-amber-900/5 max-w-md mx-auto shadow-sm">
                    <p
                      className={cn(
                        "text-amber-900 text-center font-nourdLight text-sm",
                        textClassName,
                      )}
                    >
                      Queremos que disfruten al máximo de nuestra celebración.
                      Por ello, les informamos que{" "}
                      <span className="font-bold italic">
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
        <div
          className={cn(
            "px-5 bg-primary w-full pb-24 pt-10",
            svgsColor ? `bg-[${svgsColor}]` : "",
          )}
        >
          <div className="flex flex-col gap-16">
            <DressCode
              colorPalette={colorPalette}
              title="Código de vestimenta"
              text={textDressCode}
              arrayRestrictions={arrayRestrictions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
