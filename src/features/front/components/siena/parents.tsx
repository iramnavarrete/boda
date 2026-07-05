import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import CountdownTimer from "@/features/front/components/CountDownTimer";
import ElegantText from "@/features/shared/components/ElegantText";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground1 from "@/icons/flowers-background-1";
import { useInvitationStore } from "../../stores/invitationStore";
import { cn } from "@heroui/theme";
import { useCallback } from "react";
import DynamicCalendar from "../DynamicCalendar";

type Props = {
  textClassName?: string;
  containerClassName?: string;
  svgsColor?: string;
  addToCalendarBtnClassName?: string;
  bottomWavesColor?: string;
};

export default function ParentsGodFathers({
  textClassName = "",
  containerClassName = "",
  svgsColor,
  addToCalendarBtnClassName = "",
  bottomWavesColor = "",
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  // Extraer la fecha real del evento de forma segura
  const getEventDate = useCallback(() => {
    if (!invitationData?.fecha) return new Date();
    // Si es un Timestamp de Firebase, usamos toDate()
    if (typeof invitationData.fecha.toDate === "function") {
      return invitationData.fecha.toDate();
    }
    if (!invitationData.fechaISO) {
      return new Date();
    }
    // Si es un string o date estándar
    return new Date(invitationData.fechaISO);
  }, [invitationData]);

  const eventDate = getEventDate();

  return (
    <article
      className={cn(
        // Quitamos items-center y justify-center para permitir el flujo normal en bloque
        "bg-accent border-t-1 border-primary flex flex-col relative",
        containerClassName,
      )}
    >
      {/* FONDO AISLADO (Mantiene overflow-hidden para no derramar las flores) */}
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

      {/* CONTENEDOR PRINCIPAL DEL TEXTO Y MÓDULOS */}
      <div
        className={cn(
          "mx-auto text-center text-sm text-cool-gray z-10 w-full max-w-4xl relative pt-20 px-4",
          textClassName,
        )}
      >
        {/* SECCIÓN DE PADRES (Estilo Editorial) */}
        <div className="flex flex-col items-center justify-center w-full mt-4 mb-14">
          <p className="text-[9px] md:text-[10px] font-nourdMedium text-primary/70 uppercase tracking-[0.3em] mb-4 text-center">
            <ElegantText
              delay={0}
              text="— Con la bendición de —"
              duration={0.2}
            />
          </p>
          <h2 className="text-4xl md:text-5xl text-primary mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText delay={0.2} text="Nuestros Padres" duration={0.2} />
          </h2>

          <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
            <div className="w-8 h-px bg-primary/30" />
            <span className="text-primary/50 text-xs">✦</span>
            <div className="w-8 h-px bg-primary/30" />
          </div>

          <div className="flex flex-col gap-10 w-full max-w-lg mx-auto">
            {/* Novia */}
            <div className="flex flex-col items-center text-center">
              <div className="font-nourdLight text-[11px] uppercase tracking-[0.2em] text-primary/60 mb-3">
                <ElegantText delay={0.4} text="Novia" duration={0.2} />
              </div>
              <div className="font-nourdMedium text-xl text-primary leading-relaxed">
                <ElegantText
                  delay={0.5}
                  text={invitationData?.padresNovia?.mama || "Mamá de la novia"}
                  duration={0.2}
                />
                <ElegantText
                  delay={0.6}
                  text={invitationData?.padresNovia?.papa || "Papá de la novia"}
                  duration={0.2}
                />
              </div>
            </div>

            {/* Novio */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="font-nourdLight text-[11px] uppercase tracking-[0.2em] text-primary/60 mb-3">
                <ElegantText delay={0.8} text="Novio" duration={0.2} />
              </div>
              <div className="font-nourdMedium text-xl text-primary leading-relaxed">
                <ElegantText
                  delay={0.9}
                  text={invitationData?.padresNovio?.mama || "Mamá del novio"}
                  duration={0.2}
                />
                <ElegantText
                  delay={1.0}
                  text={invitationData?.padresNovio?.papa || "Papá del novio"}
                  duration={0.2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PADRINOS (Estilo Editorial) */}
        {/* <div className="flex flex-col items-center justify-center w-full mb-16">
          <p className="text-[9px] md:text-[10px] font-nourdMedium text-primary/70 uppercase tracking-[0.3em] mb-4 text-center">
            <ElegantText
              delay={1.2}
              text="— Y en compañía de —"
              duration={0.2}
            />
          </p>
          <h2 className="text-4xl md:text-5xl text-primary mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText delay={1.4} text="Nuestros Padrinos" duration={0.2} />
          </h2>

          <div className="flex items-center justify-center gap-3 mb-10 opacity-80">
            <div className="w-12 h-px bg-primary/30" />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="font-nourdLight text-[11px] uppercase tracking-[0.2em] text-primary/60 mb-3">
              <ElegantText
                delay={1.6}
                text="Padrinos de Velación"
                duration={0.2}
              />
            </div>
            <div className="font-nourdMedium text-xl text-primary leading-relaxed">
              <ElegantText
                delay={1.7}
                text={
                  invitationData?.padrinos?.madrina || "Nombre de la madrina"
                }
                duration={0.2}
              />
              <br />
              <ElegantText
                delay={1.8}
                text={invitationData?.padrinos?.padrino || "Nombre del padrino"}
                duration={0.2}
              />
            </div>
          </div>
        </div> */}

        {/* MENSAJE FINAL INVITACIÓN */}
        <div className="font-nourdLight text-lg text-primary/90 max-w-sm mx-auto px-4">
          <ElegantText
            delay={1.0}
            text="Nos complace invitarte a celebrar con nosotros este día tan especial"
            duration={0.2}
          />
        </div>

        {/* <Separator
          className="w-full max-w-xs mx-auto mb-14"
          color={svgsColor}
        /> */}

        <div className="flex items-center justify-center gap-3 my-12 opacity-60">
          <div className="w-8 h-px bg-primary/30" />
          <span className="text-primary/50 text-xs">✦</span>
          <div className="w-8 h-px bg-primary/30" />
        </div>
        {/* CALENDARIO Y CUENTA REGRESIVA */}
        <AnimatedEntrance classname="flex flex-col items-center justify-center w-full ">
          <p className="text-[9px] md:text-[10px] font-nourdMedium text-primary/70 uppercase tracking-[0.3em] mb-4 text-center">
            <ElegantText
              delay={0}
              text="— Cada vez más cerca del —"
              duration={0.2}
            />
          </p>
          <h2 className="text-4xl md:text-5xl text-primary mb-8 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText delay={0.2} text="Gran día" duration={0.2} />
          </h2>
          <DynamicCalendar targetDate={eventDate} />

          <div className="mt-16 w-full">
            <p className="font-newIconScript text-3xl text-primary mb- drop-shadow-sm">
              Cuenta regresiva
            </p>
            <CountdownTimer
              textClassName={textClassName}
              addToCalendarBtnClassName={addToCalendarBtnClassName}
            />
          </div>
        </AnimatedEntrance>

        {/* Espaciador antes de la onda */}
        <div className="h-10" />
      </div>

      {/* ONDA EN EL FLUJO NORMAL DEL DOCUMENTO */}
      <div className="w-full relative z-20 mt-auto -mb-[45px] pointer-events-none">
        <BeigeWaves
          className="w-full h-[47px] block"
          color={bottomWavesColor}
        />
      </div>
    </article>
  );
}
