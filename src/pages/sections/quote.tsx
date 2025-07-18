import ElegantText from "@/components/ElegantText";
import GreenWaves from "@/icons/green-waves";

export default function Quote() {
  return (
    <article className="bg-primary w-full flex flex-col items-center justify-center pt-12 pb-16 px-8 relative">
      <GreenWaves className="w-full absolute top-[-30px]" />
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-md">
          <div className="text-white font-nourdLight text-center">
            <ElegantText
              text='"Ves que no es casualidad que estemos aquí de pie, jurándonos amor eterno con tanta fe. Que un para siempre es poco estando a tu lado amándote"'
              duration={0.2}
              delay={0}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
