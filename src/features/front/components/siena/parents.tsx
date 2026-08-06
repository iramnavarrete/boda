import CountdownTimer from "@/features/front/components/CountDownTimer";
import ElegantText, {
  getElegantTotalTime,
} from "@/features/shared/components/ElegantText";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground1 from "@/icons/flowers-background-1";
import { useInvitationStore } from "../../stores/invitationStore";
import { cn } from "@heroui/theme";
import { useCallback, useMemo } from "react";
import DynamicCalendar from "../DynamicCalendar";
// 🔥 Importamos motion de framer-motion
import { motion } from "framer-motion";

type Props = {
  textClassName?: string;
  containerClassName?: string;
  svgsColor?: string;
  addToCalendarBtnClassName?: string;
  bottomWavesColor?: string;
  calendarOptions?: {
    className?: string;
    hearthClassName?: string;
    heartActiveClassName?: string;
    showOnlyWeek?: boolean;
  };
  customLastPhrase?: string;
};

export default function ParentsGodFathers({
  textClassName = "",
  containerClassName = "",
  svgsColor,
  addToCalendarBtnClassName = "",
  bottomWavesColor = "",
  calendarOptions = {
    className: "",
    hearthClassName: "",
    heartActiveClassName: "",
  },
  customLastPhrase
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  const getEventDate = useCallback(() => {
    if (!invitationData?.fecha) return new Date();
    if (typeof invitationData.fecha.toDate === "function") {
      return invitationData.fecha.toDate();
    }
    if (!invitationData.fechaISO) {
      return new Date();
    }
    return new Date(invitationData.fechaISO);
  }, [invitationData]);

  const eventDate = getEventDate();

  const seq = useMemo(() => {
    const baseDuration = 0.1;

    const t1 = "— Con la bendición de —";
    const t2 = "Nuestros Padres";
    const t3 = "Novia";
    const t4 = invitationData?.padresNovia?.mama || "Mamá de la novia";
    const t5 = invitationData?.padresNovia?.papa || "Papá de la novia";
    const t6 = "Novio";
    const t7 = invitationData?.padresNovio?.mama || "Mamá del novio";
    const t8 = invitationData?.padresNovio?.papa || "Papá del novio";
    const t9 =
      customLastPhrase || "Nos complace invitarte a celebrar con nosotros este día tan especial";

    const d1 = 0;
    const d2 = d1 + getElegantTotalTime(t1, baseDuration);
    const d3 = d2 + getElegantTotalTime(t2, baseDuration);
    const d4 = d3 + getElegantTotalTime(t3, baseDuration);
    const d5 = d4 + getElegantTotalTime(t4, baseDuration);
    const d6 = d5 + getElegantTotalTime(t5, baseDuration);
    const d7 = d6 + getElegantTotalTime(t6, baseDuration);
    const d8 = d7 + getElegantTotalTime(t7, baseDuration);
    const d9 = d8 + getElegantTotalTime(t8, baseDuration);

    const t10 = "— Cada vez más cerca del —";
    const t11 = "Gran día";

    const d10 = 0; // Reinicia para el bloque del calendario
    const d11 = d10 + getElegantTotalTime(t10, baseDuration);

    return {
      baseDuration,
      texts: { t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11 },
      delays: { d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11 },
    };
  }, [invitationData]);

  return (
    <article
      className={cn(
        "bg-accent border-t-1 border-primary flex flex-col relative",
        containerClassName,
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FlowersBackground1
          className="w-full h-[65%] absolute top-0"
          color={svgsColor}
        />
        <FlowersBackground1
          className="w-full h-[65%] absolute top-[70%] rotate-180"
          color={svgsColor}
        />
      </div>

      <div
        className={cn(
          "mx-auto text-center text-sm text-cool-gray z-10 w-full max-w-4xl relative pt-20 px-4",
          textClassName,
        )}
      >
        <div className="flex flex-col items-center justify-center w-full mt-4 mb-14">
          <div
            className={cn(
              "text-[9px] md:text-[10px] font-nourdMedium text-primary/70 uppercase tracking-[0.3em] mb-4 text-center",
              textClassName,
            )}
          >
            <ElegantText
              delay={seq.delays.d1}
              text={seq.texts.t1}
              duration={seq.baseDuration}
            />
          </div>
          <h2
            className={cn(
              "text-4xl md:text-5xl text-primary mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]",
              textClassName,
            )}
          >
            <ElegantText
              delay={seq.delays.d2}
              text={seq.texts.t2}
              duration={seq.baseDuration}
            />
          </h2>

          <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
            <div
              className={cn(
                "w-8 h-px text-primary/30 bg-current",
                textClassName,
              )}
            />
            <span className={cn("text-primary/50 text-xs", textClassName)}>
              ✦
            </span>
            <div
              className={cn(
                "w-8 h-px bg-current text-primary/30",
                textClassName,
              )}
            />
          </div>

          <div className="flex flex-col gap-10 w-full max-w-lg mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="font-nourdLight text-[11px] uppercase tracking-[0.2em] text-current/60 mb-3">
                <ElegantText
                  delay={seq.delays.d3}
                  text={seq.texts.t3}
                  duration={seq.baseDuration}
                />
              </div>
              <div className="font-newIconScript drop-shadow-2xl text-2xl text-current leading-relaxed">
                <ElegantText
                  delay={seq.delays.d4}
                  text={seq.texts.t4}
                  duration={seq.baseDuration}
                />
                <ElegantText
                  delay={seq.delays.d5}
                  text={seq.texts.t5}
                  duration={seq.baseDuration}
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="font-nourdLight text-[11px] uppercase tracking-[0.2em] text-current/60 mb-3">
                <ElegantText
                  delay={seq.delays.d6}
                  text={seq.texts.t6}
                  duration={seq.baseDuration}
                />
              </div>
              <div className="font-newIconScript drop-shadow-2xl text-2xl text-current leading-relaxed">
                <ElegantText
                  delay={seq.delays.d7}
                  text={seq.texts.t7}
                  duration={seq.baseDuration}
                />
                <ElegantText
                  delay={seq.delays.d8}
                  text={seq.texts.t8}
                  duration={seq.baseDuration}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="font-nourdLight text-base text-current/90 max-w-sm mx-auto px-4">
          <ElegantText
            delay={seq.delays.d9}
            text={seq.texts.t9}
            duration={seq.baseDuration}
          />
        </div>

        {/* 🔥 SEPARADOR Y CALENDARIO AGRUPADOS PARA MOSTRARSE AL 50% */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5, once: true }} // El amount: 0.5 detona la animación al 50% de visibilidad
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full"
        >
          {/* El separador ahora está dentro del contenedor animado */}
          <div className="flex items-center justify-center gap-3 my-12 opacity-60">
            <div
              className={cn(
                "w-8 h-px text-primary/30 bg-current",
                textClassName,
              )}
            />
            <span className={cn("text-primary/50 text-xs", textClassName)}>
              ✦
            </span>
            <div
              className={cn(
                "w-8 h-px bg-current text-primary/30",
                textClassName,
              )}
            />
          </div>

          <div className="text-[9px] md:text-[10px] font-nourdMedium text-current/70 uppercase tracking-[0.3em] mb-4 text-center">
            <ElegantText
              delay={seq.delays.d10}
              text={seq.texts.t10}
              duration={seq.baseDuration}
            />
          </div>
          <h2 className="text-4xl md:text-5xl text-current mb-8 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText
              delay={seq.delays.d11}
              text={seq.texts.t11}
              duration={seq.baseDuration}
            />
          </h2>
          <DynamicCalendar
            calendarOptions={calendarOptions}
            targetDate={eventDate}
          />

          <div className="mt-16 w-full">
            <p className="font-newIconScript text-3xl text-current mb-4 drop-shadow-sm">
              Cuenta regresiva
            </p>
            <CountdownTimer
              textClassName={textClassName}
              addToCalendarBtnClassName={addToCalendarBtnClassName}
            />
          </div>
        </motion.div>

        <div className="h-10" />
      </div>

      <div className="w-full relative z-20 mt-auto -mb-[45px] pointer-events-none drop-shadow-[0_24px_10px_rgba(0,0,0,0.10)]">
        <BeigeWaves
          className="w-full h-[47px] block"
          color={bottomWavesColor}
        />
      </div>
    </article>
  );
}
