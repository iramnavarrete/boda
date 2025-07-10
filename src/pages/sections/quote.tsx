import AnimatedEntrance from "@/components/AnimatedEntrance";
import ElegantText from "@/components/ElegantText";
import SquareFrameIcon from "@/icons/square-frame";

export default function Quote() {
  return (
    <article className="bg-white w-full flex flex-col items-center justify-center py-28 px-2">
      <SquareFrameIcon className="drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] text-primary" />
      <div className="absolute max-w-[35ch] text-sm">
        <div className="text-cool-gray font-handlee text-center">
          <ElegantText
            text="Hay momentos en la vida que son especiales por si solos, pero
            compartirlos con personas tan especiales como tú, se convierten en
            momentos imposibles de olvidar."
            duration={0.2}
            delay={0}
          />
          <br />
          <br />
          <ElegantText
            delay={1.82}
            text="¡Me hará muy feliz que puedas acompañarme en este día tan especial!"
            duration={0.2}
          />
        </div>
      </div>
    </article>
  );
}
