import AnimatedEntrance from "@/components/AnimatedEntrance";
import ElegantText from "@/components/ElegantText";
import React from "react";

export default function ParentsGodFathers() {
  return (
    <article className="h-screen bg-white border-t-1 drop border-primary flex flex-col items-center justify-center">
      <div className="bg-white flex flex-col font-handlee mx-5 text-center px-12 py-28 text-sm text-cool-gray border-1 drop-shadow-[4px_4px_8px_rgba(0,0,0,0.25)] border-primary">
        <div className="mb-5">
          <ElegantText
            delay={0}
            text="Con la bendición de Dios y en compañía de mis padres y padrinos"
            duration={0.2}
          />
        </div>
        <div className="mb-3">
          <ElegantText delay={0.63} text="Mis padres" duration={0.2} />
        </div>
        <div className="font-sacramento text-black text-2xl mb-1">
          <ElegantText delay={0.73} text="Eduardo Meléndez" duration={0.2} />
        </div>
        <div className="font-sacramento text-black text-2xl">
          <ElegantText delay={0.89} text="Rubí Navarrete" duration={0.2} />
        </div>
        <div className="my-3">
          <ElegantText delay={1.04} text="Mis padrinos" duration={0.2} />
        </div>
        <div className="font-sacramento text-black text-2xl mb-1">
          <ElegantText delay={1.16} text="Antonio Navarrete" duration={0.2} />
        </div>
        <div className="font-sacramento text-black text-2xl">
          <ElegantText delay={1.33} text="Enriqueta Hernández" duration={0.2} />
        </div>
        <div className="mt-5">
          <ElegantText
            delay={1.52}
            text="Nos complace invitarte a ser parte de este gran día"
            duration={0.2}
          />
        </div>
      </div>
    </article>
  );
}
