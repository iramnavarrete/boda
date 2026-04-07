import CheersIcon from "@/icons/cheers-icon";
import { PropsWithChildren, useEffect, useRef } from "react";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import { motion, animate, useInView, AnimationSequence } from "framer-motion";
import ChurchIcon from "@/icons/church-icon";
import DressCodeIcon from "@/icons/church-icon copy";
import BeigeWaves from "@/icons/beige-waves";
import FlowersBackground2 from "@/icons/flowers-background-2";
import {
  churchSequence,
  glassesSequence,
} from "@/constants/animationSequences";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatTo12Hour } from "@/utils/formatters";
import { cn } from "@heroui/theme";

interface CardEventProps {
  time: string;
  place: string;
  address: string;
  link: string;
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
  textClassName?: string;
  mapBtnClassName?: string;
}

const CardEvent: React.FC<CardEventProps> = ({
  address,
  place,
  time,
  link,
  IconComponent,
  title,
  sequence,
  textClassName = '',
  mapBtnClassName = ''
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(sequence);
  }, [isInView]);

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div ref={ref}>
        <IconComponent />
      </motion.div>
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center">
          <p
            className={cn(
              "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary",
              textClassName,
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              "text-primary text-center leading-6 pt-5 text-lg font-nourdMedium",
              textClassName,
            )}
          >
            <p>{formatTo12Hour(time)}</p>
          </div>
          <div
            className={cn(
              "my-3 text-primary text-center text-lg font-nourdMedium",
              textClassName,
            )}
          >
            <p>{place}</p>
          </div>
          <div
            className={cn(
              "text-primary text-center leading-5 text-sm",
              textClassName,
            )}
          >
            <p className="whitespace-pre-wrap">
              {address.replaceAll(",", "\n")}
            </p>
          </div>
          <a
            className={cn(
              "border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary",
              mapBtnClassName,
            )}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mapa
          </a>
        </div>
      </AnimatedEntrance>
    </div>
  );
};

interface DressCodeProps {
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
  text: string;
}

const DressCode: React.FC<PropsWithChildren<DressCodeProps>> = ({
  IconComponent,
  title,
  sequence,
  text,
  children,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(sequence);
  }, [isInView]);

  return (
    <div className="flex flex-col items-center justify-center">
      <BeigeWaves className="w-full absolute h-12 left-0 top-[-40px] scale-y-[-1]" />
      <motion.div ref={ref}>
        <IconComponent />
      </motion.div>
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center">
          <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-accent">
            {title}
          </p>
        </div>
        <div className="text-accent text-center leading-5 my-6 text-xl font-nourdLight">
          <p>{text}</p>
        </div>
        {children}
      </AnimatedEntrance>
    </div>
  );
};

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  mapBtnClassName?: string;
};

export default function CeremonyToast({ containerClassName = "", textClassName = '', svgsColor, mapBtnClassName = '' }: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);

  return (
    <div className="mt-[-100%]">
      <div
        className={cn(
          "w-full relative text-medium bg-accent",
          containerClassName,
        )}
      >
        <div className="px-5 relative">
          <FlowersBackground2
            className="absolute h-[70%] 2xl:h-[95%] w-full left-0 top-12 z-0"
            color={svgsColor}
          />
          <div className="px-8 py-20 flex flex-col gap-16 relative">
            <CardEvent
              IconComponent={() => (
                <ChurchIcon
                  className="w-[70px] h-[70px] animated-church"
                  color={svgsColor}
                />
              )}
              sequence={churchSequence}
              address={invitationData?.ceremonia.direccion || ""}
              link={invitationData?.ceremonia.enlaceMaps || "#"}
              place={invitationData?.ceremonia.nombreTemplo || ""}
              time={invitationData?.ceremonia.hora || ""}
              title="Ceremonia"
              textClassName={textClassName}
              mapBtnClassName={mapBtnClassName}
            />
            <CardEvent
              IconComponent={() => (
                <CheersIcon
                  className="w-[70px] h-[70px] animated-glasses"
                  color={svgsColor}
                />
              )}
              sequence={glassesSequence}
              address={invitationData?.recepcion.direccion || ""}
              link={invitationData?.recepcion.enlaceMaps || "#"}
              place={invitationData?.recepcion.nombreSalon || ""}
              time={invitationData?.recepcion.hora || ""}
              title="Recepción"
              textClassName={textClassName}
              mapBtnClassName={mapBtnClassName}
            />
          </div>
        </div>
        <div className={cn("px-5 bg-primary w-full py-20", svgsColor ? `bg-[${svgsColor}]` : '')}>
          <div className=" flex flex-col gap-16">
            <DressCode
              IconComponent={() => (
                <DressCodeIcon className="w-[70px] h-[70px] animated-church" />
              )}
              sequence={churchSequence}
              title="Código de vestimenta"
              text="Formal"
            >
              <div className="text-accent text-center leading-7 text-md font-nourdBold">
                <p>¡NO BLANCO!</p>
                <p>¡NO VERDE!</p>
              </div>
            </DressCode>
          </div>
        </div>
      </div>
    </div>
  );
}
