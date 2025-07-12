import AddToCalendar from "@/components/AddToCalendar";
import CountdownTimer from "@/components/CountDownTimer";
import ElegantText from "@/components/ElegantText";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground1 from "@/icons/flowers-background-1";
import GreenWaves from "@/icons/green-waves";
import Separator from "@/icons/separator";
import React from "react";

const finalDate = new Date("2025-10-25T21:00:00");

export default function ParentsGodFathers() {
  return (
    <article className="bg-accent border-t-1 drop border-primary flex flex-col items-center justify-center relative pt-20">
      <FlowersBackground1 className="w-full h-[85%] absolute top-0" />
      <div className="mx-10 text-center text-sm text-cool-gray z-10">
        <Separator className="w-full" />
        <div className="flex flex-col gap-5 my-8">
          <div className="font-newIconScript text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            <ElegantText
              delay={0}
              text="Con la bendición de nuestros padres"
              duration={0.2}
            />
          </div>
          <div>
            <div className="font-nourdLight text-xl mt-5">
              <ElegantText delay={0.63} text="Novio" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-2xl">
              <ElegantText delay={0.73} text="Juan Navarrete" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-2xl">
              <ElegantText delay={0.73} text="Ana Caraveo" duration={0.2} />
            </div>
          </div>
          <div>
            <div className="font-nourdLight text-xl">
              <ElegantText delay={1.04} text="Novia" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-2xl">
              <ElegantText delay={1.16} text="Miguel González" duration={0.2} />
            </div>
            <div className="font-nourdMedium text-2xl mb-5">
              <ElegantText
                delay={1.16}
                text="Margarita Hernández"
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
        <CountdownTimer targetDate={finalDate} />
        <BeigeWaves className="w-full absolute h-12 left-0 bottom-[-40px]" />
      </div>
    </article>
  );
}
