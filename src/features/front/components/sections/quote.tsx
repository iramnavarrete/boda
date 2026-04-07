import ElegantText from "@/features/shared/components/ElegantText";
import Waves from "@/icons/waves";
import { cn } from "@heroui/theme";
import { FC } from "react";

type Props = {
  containerClassname?: string;
  svgColor?: string;
};

const Quote: FC<Props> = ({ containerClassname = "", svgColor }) => {
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
              text='"Me quedé corto cuando dije para siempre, quiero tres vidas cuando menos junto a ti. Que nuestra historia tenga un principio, pero nunca un fin"'
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
