import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import CountdownTimer from "@/features/front/components/CountDownTimer";
import ElegantText from "@/features/shared/components/ElegantText";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground1 from "@/icons/flowers-background-1";
import Separator from "@/icons/separator";
import { useInvitationStore } from "../../stores/invitationStore";

export default function ParentsGodFathers() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  return (
    <article className="bg-accent border-t-1 drop border-primary flex flex-col items-center justify-center relative pt-20">
      <FlowersBackground1 className="w-full h-[85%] 2xl:h-full absolute top-0" />
      <div className="mx-10 text-center text-sm text-cool-gray z-10">
        <Separator className="w-full" />
        <div className="flex flex-col gap-2 my-12">
          <div className="font-newIconScript text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText
              delay={0}
              text="Con la bendición de nuestros padres"
              duration={0.2}
            />
          </div>
          <div className="mt-12">
            <div className="font-nourdLight text-lg">
              <ElegantText delay={0.63} text="Novia" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-xl">
              <ElegantText
                delay={0.73}
                text={invitationData?.padresNovia.mama || "Mamá novia"}
                duration={0.2}
              />
            </div>
            <div className="font-nourdMedium text-xl">
              <ElegantText
                delay={0.73}
                text={invitationData?.padresNovia.papa || "Papá novia"}
                duration={0.2}
              />
            </div>
          </div>
          <div className="mb-12 mt-5">
            <div className="font-nourdLight text-lg">
              <ElegantText delay={1.04} text="Novio" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-xl">
              <ElegantText
                delay={1.16}
                text={invitationData?.padresNovio.mama || "Mamá Novio"}
                duration={0.2}
              />
            </div>
            <div className="font-nourdMedium text-xl">
              <ElegantText
                delay={1.16}
                text={invitationData?.padresNovio.papa || "Papá novio"}
                duration={0.2}
              />
            </div>
          </div>
          <div className="font-nourdLight text-lg">
            <ElegantText
              delay={1.52}
              text="Nos complace invitarte a ser parte de este gran día"
              duration={0.2}
            />
          </div>
        </div>
        <Separator className="w-full" />
        <AnimatedEntrance>
          <CountdownTimer />
        </AnimatedEntrance>

        <BeigeWaves className="w-full absolute h-12 left-0 bottom-[-40px]" />
      </div>
    </article>
  );
}
