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
import { ArrowRight } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto relative z-10">
      <AnimatedEntrance classname="w-full flex flex-col items-center">
        {/* ICONO CON FONDO PARA CORTAR LA LÍNEA DEL TIMELINE */}
        <motion.div ref={ref} className="mb-4 bg-accent p-4 rounded-full">
          <IconComponent />
        </motion.div>

        {/* Overline */}
        <p className="text-[9px] font-nourdMedium text-primary/60 uppercase tracking-[0.4em] mb-2 text-center">
          {typeEvent}
        </p>

        {/* Título Script */}
        <p
          className={cn(
            "text-5xl font-newIconScript text-primary mb-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)]",
            textClassName,
          )}
        >
          {title}
        </p>

        {/* Información Horario (Destacado) */}
        <p
          className={cn(
            "text-primary text-center text-lg font-nourdMedium tracking-widest mb-4",
            textClassName,
          )}
        >
          {formatTo12Hour(time)}
        </p>

        {/* Lugar */}
        <p
          className={cn(
            "text-primary text-center text-base font-nourdMedium mb-2 px-4",
            textClassName,
          )}
        >
          {place}
        </p>

        {/* Dirección */}
        <div
          className={cn(
            "text-primary/70 text-center leading-relaxed text-sm font-nourdLight mb-6 px-6",
            textClassName,
          )}
        >
          <p className="whitespace-pre-wrap">{address.replaceAll(",", "\n")}</p>
        </div>

        {/* Enlace Sutil con Flecha */}
        <a
          className="group flex items-center gap-2 text-[10px] font-nourdMedium text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-1 hover:border-primary transition-all"
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
  colorPalette,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto z-10 pt-10">
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
          <div className="w-8 h-px bg-accent/30" />
          <span className="text-accent/50 text-xs">✦</span>
          <div className="w-8 h-px bg-accent/30" />
        </div>

        {/* Texto de Descripción */}
        <p className="text-accent/90 font-nourdLight text-center max-w-md mb-8 leading-relaxed text-lg px-4">
          {text} <br />
          <span className="opacity-80 text-sm mt-2 block italic">
            Paletas cromáticas inspiradas en la sutileza de la naturaleza.
          </span>
        </p>

        {/* Paleta de Colores */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {colorPalette.map((color, idx) => (
            <div
              key={idx}
              className="relative group flex items-center justify-center"
            >
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full shadow-inner border border-black/10 transition-transform group-hover:scale-110 cursor-pointer"
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

        {/* Estilos (Mujeres y Hombres) - Diseño Editorial sin Cajas */}
        <div className="flex flex-col gap-12 w-full max-w-sm mx-auto px-4 mb-12">
          {/* Bloque Mujeres */}
          <div className="flex flex-col items-center text-center">
            <LadiesShoeIcon
              className="text-accent/60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-accent mb-3">
              Mujeres
            </h3>
            <p className="text-accent/80 text-sm leading-relaxed mb-5 font-nourdLight">
              Sugerimos vestidos de gala o corte midi con caída suave. Los
              colores terrosos, verde olivo y matices neutros armonizan
              idealmente con el entorno.
            </p>
            <span className="text-[9px] font-nourdMedium uppercase tracking-[0.2em] text-accent/60 border-b border-accent/20 pb-1">
              Omitir blanco y marfil
            </span>
          </div>

          {/* Bloque Hombres */}
          <div className="flex flex-col items-center text-center">
            <TieIcon
              className="text-accent/60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-accent mb-3">
              Hombres
            </h3>
            <p className="text-accent/80 text-sm leading-relaxed mb-5 font-nourdLight">
              Recomendamos el uso de lino, guayaberas formales o trajes en
              tonalidades tierra y bosque. Un estilo sofisticado, fresco y ad
              hoc a la velada.
            </p>
            <span className="text-[9px] font-nourdMedium uppercase tracking-[0.2em] text-accent/60 border-b border-accent/20 pb-1">
              Omitir bermudas y calzado informal
            </span>
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
  arrayRestrictions?: string[];
  textDressCode?: string;
  hasNoDinner?: boolean;
  colorPalette?: ColorPalette;
};

export default function CeremonyToast({
  containerClassName = "",
  textClassName = "",
  svgsColor,
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
    <div className="w-full flex flex-col relative">
      <div className="w-full relative z-20 -mt-11 pointer-events-none">
        <BeigeWaves className="w-full h-12 block scale-y-[-1]" />
      </div>

      <div
        className={cn(
          "w-full relative text-medium bg-accent overflow-hidden",
          containerClassName,
        )}
      >
        <div className="px-5 relative min-h-screen">
          {/* FONDO FLORAL */}
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
                <div className="flex flex-col items-center justify-center w-full px-6 mt-4 max-w-md mx-auto text-center bg-accent z-10">
                  <div className="w-full py-8 border-y border-primary/20 relative">
                    {/* Pequeños rombos decorativos en los bordes */}
                    <div className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-primary/40" />
                    <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-primary/40" />

                    <p className="text-[9px] font-nourdMedium text-primary/60 uppercase tracking-[0.4em] mb-4">
                      — Nota Importante —
                    </p>
                    <p
                      className={cn(
                        "text-primary/90 font-nourdLight text-sm leading-relaxed",
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
        <div
          className={cn(
            "px-5 bg-primary w-full pb-24 pt-16 relative z-10",
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
