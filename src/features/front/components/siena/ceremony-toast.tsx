import CheersIcon from "@/icons/cheers-icon";
import { motion } from "framer-motion";
import ChurchIcon from "@/icons/church-icon";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground2 from "@/icons/flowers-background-2";
import {
  churchSequence,
  glassesSequence,
} from "@/constants/animationSequences";
import { useInvitationStore } from "../../stores/invitationStore";
import { cn } from "@heroui/theme";
import type { ReactNode } from "react";
import DressCode, { ColorPalette, DressCodeSection } from "./DressCode";
import AccommodationSection, {
  AccommodationConfig,
  AccommodationStyleConfig,
} from "./AccomodationSection";
import EditorialEvent from "./EditorialEvent";
import EditorialTimeline, {
  GraphicTimelineItem,
  TimelineStyleConfig,
} from "./EditorialTimeline";

type Props = {
  containerClassName?: string;
  innerContainerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  textDressCode?: string;
  hasNoDinner?: boolean;
  womenConfig?: DressCodeSection;
  menConfig?: DressCodeSection;
  forbiddenColors?: ColorPalette | false | "none";
  onlyText?: boolean;
  textRestrictions?: string[];
  wavesColor?: string;
  ceremonyImage?: string;
  receptionImage?: string;
  showFlowersBg?: boolean;
  gapBetweenElements?: number;
  bothRestrictions?: string;
  sectionsContainerClassName?: string;

  // Props para Hospedaje (Datos + Estilos Personalizables)
  accommodationConfig?: AccommodationConfig; // Si no se pasa, la sección no aparece
  accommodationStyles?: AccommodationStyleConfig; // Objeto con ClassNames específicos
  /**
   * Slot opcional para inyectar un sub-componente de hospedaje ya construido
   * desde fuera (ej: `AccommodationSection` del módulo de invitaciones).
   * Si se pasa, **tiene prioridad** sobre `accommodationConfig/Styles`.
   */
  accommodationSlot?: ReactNode;

  timelineItems?: GraphicTimelineItem[]; // Si no se pasa, la sección no aparece
  timelineTitle?: string;
  timelineSubtitle?: string;
  timelineStyles?: TimelineStyleConfig;
  timelineAccentColor?: string;
  /**
   * Slot opcional para inyectar un sub-componente de timeline ya construido
   * desde fuera (ej: `TimelineSection` del módulo de invitaciones).
   * Si se pasa, **tiene prioridad** sobre `timelineItems/Titles/...`.
   */
  timelineSlot?: ReactNode;
};

export default function CeremonyToast({
  containerClassName = "",
  innerContainerClassName = "",
  textClassName = "",
  svgsColor,
  textDressCode,
  hasNoDinner = false,
  onlyText = false,
  textRestrictions = [],
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
  forbiddenColors = [
    { hex: "#FFFFFF", name: "Blanco / Marfil" },
    { hex: "#FCAFC8", name: "Rosa Palo" },
    { hex: "#CB5D78", name: "Rosa Viejo" },
    { hex: "#B64160", name: "Frambuesa" },
    { hex: "#8D163A", name: "Borgoña" },
    { hex: "#53071B", name: "Vino Tinto" },
  ],
  wavesColor = "#F5EFE6",
  ceremonyImage,
  receptionImage,
  showFlowersBg = true,
  gapBetweenElements = 96,
  accommodationConfig,
  accommodationStyles,
  timelineItems,
  timelineTitle,
  timelineSubtitle,
  timelineStyles,
  timelineAccentColor = "#252a33",
  bothRestrictions,
  sectionsContainerClassName,
  accommodationSlot,
  timelineSlot,
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  return (
    <div className="w-full flex flex-col relative transform-gpu">
      <div className="w-full relative z-20 -mt-11 pointer-events-none drop-shadow-[0_-24px_10px_rgba(0,0,0,0.10)]">
        <BeigeWaves
          className="w-full h-12 block"
          flipY={true}
          color={wavesColor}
        />
      </div>

      <div
        className={cn(
          "w-full relative text-medium bg-accent overflow-hidden",
          "will-change-transform",
          containerClassName,
        )}
      >
        <div className="px-5 relative min-h-screen">
          {showFlowersBg && (
            <FlowersBackground2
              className="absolute h-[70%] 2xl:h-[95%] w-full left-0 top-12 z-0 opacity-80"
              color={svgsColor}
            />
          )}

          <div
            className={cn(
              "px-4 py-24 flex flex-col relative z-10",
              innerContainerClassName,
            )}
            style={{ gap: gapBetweenElements }}
          >
            {/* EVENTO CEREMONIA */}
            <EditorialEvent
              imageSrc={ceremonyImage}
              IconComponent={
                !ceremonyImage
                  ? () => (
                      <ChurchIcon
                        className="w-[60px] h-[60px] animated-church"
                        color={svgsColor}
                      />
                    )
                  : undefined
              }
              sequence={!ceremonyImage ? churchSequence : undefined}
              address={invitationData?.ceremonia.direccion || ""}
              link={invitationData?.ceremonia.enlaceMaps || "#"}
              place={invitationData?.ceremonia.nombreTemplo || ""}
              time={invitationData?.ceremonia.hora || ""}
              title="Ceremonia"
              textClassName={textClassName}
              typeEvent="Misa"
            />

            {/* EVENTO RECEPCIÓN */}
            <EditorialEvent
              imageSrc={receptionImage}
              IconComponent={
                !receptionImage
                  ? () => (
                      <CheersIcon
                        className="w-[60px] h-[60px] animated-glasses"
                        color={svgsColor}
                      />
                    )
                  : undefined
              }
              sequence={!receptionImage ? glassesSequence : undefined}
              address={invitationData?.recepcion.direccion || ""}
              link={invitationData?.recepcion.enlaceMaps || "#"}
              place={invitationData?.recepcion.nombreSalon || ""}
              time={invitationData?.recepcion.hora || ""}
              title="Recepción"
              textClassName={textClassName}
              typeEvent="Fiesta"
            />

            {/* SECCIÓN: HOSPEDAJE (slot externo tiene prioridad) */}
            {accommodationSlot
              ? accommodationSlot
              : accommodationConfig && (
                  <AccommodationSection
                    config={accommodationConfig}
                    styles={accommodationStyles}
                  />
                )}

            {/* NOTA IMPORTANTE (Opcional) */}
            {hasNoDinner && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.6, once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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
                      "text-current opacity-90 font-nourdLight text-sm leading-relaxed bg-[color-mix(in_srgb,currentColor_3%,transparent)] p-4 rounded-lg border border-[color-mix(in_srgb,currentColor_40%,transparent)] whitespace-pre-line mx-2",
                      textClassName,
                    )}
                  >
                    Queremos que disfruten al máximo de nuestra celebración. Por
                    ello, les informamos que{" "}
                    <span className="font-nourdMedium">no se servirá cena</span>{" "}
                    durante el evento, para que puedan tomar sus precauciones.
                    {"\n"}¡Habrá mucha música, brindis y alegría!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* SECCIÓN TIMELINE / ITINERARIO (slot externo tiene prioridad) */}
        {timelineSlot
          ? timelineSlot
          : timelineItems &&
            timelineItems.length > 0 && (
              <EditorialTimeline
                items={timelineItems}
                title={timelineTitle}
                subtitle={timelineSubtitle}
                styles={timelineStyles}
                accentColor={timelineAccentColor}
              />
            )}

        {/* SECCIÓN DEL CÓDIGO DE VESTIMENTA */}
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
              onlyText={onlyText}
              textRestrictions={textRestrictions}
              bothRestrictions={bothRestrictions}
              sectionsContainerClassName={sectionsContainerClassName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
