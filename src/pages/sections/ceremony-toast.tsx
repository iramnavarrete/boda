import CheersIcon from "@/icons/cheers-icon";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import AnimatedEntrance from "@/components/AnimatedEntrance";
import { motion, animate, useInView, AnimationSequence } from "framer-motion";
import ChurchIcon from "@/icons/church-icon";
import DressCodeIcon from "@/icons/church-icon copy";
import FlowersBackground1 from "@/icons/flowers-background-1";
import AddToCalendarButton from "@/components/AddToCalendar";

interface CardEventProps {
  time: string;
  place: string;
  address1: string;
  address2: string;
  address3: string;
  link: string;
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
}

const CardEvent: React.FC<CardEventProps> = ({
  address1,
  address2,
  address3,
  place,
  time,
  link,
  IconComponent,
  title,
  sequence,
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
          <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript">
            {title}
          </p>
          <div className="text-primary text-center leading-6 pt-5 text-lg font-nourdMedium">
            <p>{time}</p>
          </div>
          <div className="my-3 text-primary text-center text-lg font-nourdMedium">
            <p>{place}</p>
          </div>
          <div className="text-primary text-center leading-5 text-sm">
            <p>{address1}</p>
            <p>{address2}</p>
            <p>{address3}</p>
          </div>
          <a
            className="border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button font-nourdMedium text-primary"
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

export default function CeremonyToast() {
  const churchSequence: AnimationSequence = [
    [".animated-church", { opacity: 1 }, { duration: 0.2 }],
    [".animated-church", { scale: 1.2 }, { duration: 0.2 }],
    [".animated-church", { scale: 1 }, { duration: 0.2 }],
  ];

  const glassesSequence: AnimationSequence = [
    [".animated-glasses", { opacity: 1 }, { duration: 0.2 }],
    [".animated-glasses", { scale: 1.2 }, { duration: 0.2 }],
    [".animated-glasses", { rotate: "20deg" }, { duration: 0.2 }],
    [".animated-glasses", { rotate: "-20deg" }, { duration: 0.2 }],
    [".animated-glasses", { scale: 1, rotate: "0deg" }, { duration: 0.2 }],
  ];

  return (
    <div className="mt-[-100%]">
      <div className="w-full relative text-medium bg-accent">
        <div className="px-5 relative">
          <FlowersBackground1 className="absolute h-[80%] w-full left-0" />
          <div className="px-8 py-20 flex flex-col gap-16 z-20">
            <CardEvent
              IconComponent={() => (
                <ChurchIcon className="w-[70px] h-[70px] animated-church" />
              )}
              sequence={churchSequence}
              address1="Juan de Dios Martin Barba Antes #6112,"
              address2="Nombre de Dios, 31110,"
              address3="Chihuahua, Chih."
              link="https://maps.app.goo.gl/6tZo4PFqmskX2nsa8"
              place="Parroquia San Juan Bautista"
              time="6:30 pm"
              title="Ceremonia"
            />
            <CardEvent
              IconComponent={() => (
                <CheersIcon className="w-[70px] h-[70px] animated-glasses" />
              )}
              sequence={glassesSequence}
              address1="Ctra. Chihuahua-Aldama Km 1 #6902,"
              address2="Privada Ejido Robinson, 31313"
              address3="Chihuahua, Chih."
              link="https://maps.app.goo.gl/dgtiBetWv66uCrRi6"
              place="Hacienda el refugio"
              time="9:00 pm"
              title="Recepción"
            />
          </div>
        </div>
        <div className="px-5 bg-primary w-full py-20">
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
                <p>¡NO VERDE OLIVA!</p>
              </div>
            </DressCode>
          </div>
        </div>
      </div>
    </div>
  );
}
