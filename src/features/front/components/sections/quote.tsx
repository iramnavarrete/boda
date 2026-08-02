import { FC, useMemo } from "react";
// 🔥 Importamos el componente y su función calculadora
import ElegantText, {
  getElegantTotalTime,
} from "@/features/shared/components/ElegantText";
import Waves from "@/icons/waves";
import { cn } from "@heroui/theme";

type Props = {
  containerClassname?: string;
  svgColor?: string;
  quote?: string;
  author?: string;
};

const Quote: FC<Props> = ({
  containerClassname = "",
  svgColor,
  quote,
  author,
}) => {
  const quoteText = useMemo(() => {
    return quote
      ? `"${quote}"`
      : '"Ves que no es casualidad que estemos aquí de pie, jurándonos amor eterno con tanta fe. Que un para siempre es poco estando a tu lado amándote"';
  }, [quote]);

  // 🔥 1. Calculamos EXACTAMENTE cuánto va a tardar el primer texto
  const baseDuration = 0.2;
  const quoteDuration = getElegantTotalTime(quoteText, baseDuration);

  return (
    <article
      className={cn(
        "bg-primary w-full flex flex-col items-center justify-center pt-12 pb-16 px-8 relative",
        containerClassname,
      )}
    >
      <Waves className="w-full absolute top-[-30px] z-20" color={svgColor} />
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-md">
          <div className="text-white font-nourdLight text-center flex flex-col items-center gap-4">
            {/* Primer texto animado */}
            <ElegantText text={quoteText} duration={baseDuration} delay={0} />

            {/* Segundo texto animado (Autor) */}
            {author && (
              <div className="font-nourdMedium opacity-80 mt-2">
                <ElegantText
                  text={author}
                  duration={baseDuration}
                  // 🔥 2. Le pasamos el tiempo exacto que tardó el anterior
                  delay={quoteDuration}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Quote;
