import ElegantText from "@/features/shared/components/ElegantText";
import Waves from "@/icons/waves";
import { cn } from "@heroui/theme";
import { FC } from "react";

type Props = {
  containerClassname?: string;
  svgColor?: string;
  quote?: string;
};

const Quote: FC<Props> = ({ containerClassname = "", svgColor, quote }) => {
  return (
    <article
      className={cn(
        "bg-primary w-full flex flex-col items-center justify-center pt-12 pb-16 px-8 relative",
        containerClassname,
      )}
    >
      <Waves className="w-full absolute top-[-30px]" color={svgColor} />
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-md">
          <div className="text-white font-nourdLight text-center">
            <ElegantText
              text={
                quote
                  ? `"${quote}"`
                  : "Ves que no es casualidad que estemos aquí de pie, jurándonos amor eterno con tanta fe. Que un para siempre es poco estando a tu lado amándote"
              }
              duration={0.2}
              delay={0}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default Quote;
