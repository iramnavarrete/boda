import ElegantText from "@/components/ElegantText";
import GreenWaves from "@/icons/green-waves";

export default function Quote() {
  return (
    <article className="bg-primary w-full flex flex-col items-center justify-center pt-24 pb-32 px-2 relative">
      <GreenWaves className="w-full absolute top-[-30px]" />
      <div className="absolute max-w-[32ch] text-md">
        <div className="text-white font-nourdLight text-center">
          <ElegantText
            text='"Ves que no es casualidad que estemos aquí de pie, jurándonos amor eterno con tanta fe. Que un para siempre es poco estando a tu lado amándote"'
            duration={0.2}
            delay={0}
          />
        </div>
      </div>
    </article>
  );
}
