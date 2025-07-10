import ChurchIcon from "@/icons/church-icon";
import CheersIcon from "@/icons/cheers-icon";
import { useEffect, useRef, useState } from "react";
import AnimatedEntrance from "@/components/AnimatedEntrance";
import { motion, animate, useInView, AnimationSequence } from "framer-motion";

interface CardEventProps {
  date: string;
  time: string;
  place: string;
  address: string;
  link: string;
  IconComponent: () => React.ReactNode;
  title: string;
  sequence: AnimationSequence;
}

const CardEvent: React.FC<CardEventProps> = ({
  date,
  address,
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
          <p className="pt-2 text-xl">{title}</p>
          <hr className="m-4 w-3/5 h-[2px]primary border-primary" />
          <div className="text-cool-gray text-center leading-6">
            <p>{date}</p>
            <p>{time}</p>
          </div>
          <div className="my-4 text-black text-center">
            <p>{place}</p>
          </div>
          <div className="text-cool-gray text-center leading-6">
            <p>{address}</p>
          </div>
          <a
            className="border-primary border-1 mt-4 p-3 rounded-2xl bg-[#fff2e0]"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir mapa
          </a>
        </div>
      </AnimatedEntrance>
    </div>
  );
};

export default function CeremonyToast() {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  });

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
    <div className="w-full relative text-medium bg-white" style={{ height }}>
      <div
        className="absolute border-primary border-1 m-5 mt-[-50px]"
        ref={ref}
      >
        <div className="p-12 bg-white font-handlee flex flex-col gap-16">
          <CardEvent
            IconComponent={() => (
              <ChurchIcon className="w-[70px] h-[70px] animated-church" />
            )}
            sequence={churchSequence}
            address="Parque España s/n, Jardines de Oriente, 31385 Chihuahua, Chihuahua"
            date="Sábado, 7 de septiembre 2024"
            link="https://maps.app.goo.gl/WernF53fWoLj6Mgc9"
            place="Parroquia San Juan Pablo II"
            time="Hora: 6:30 p.m."
            title="Ceremonia"
          />
          <CardEvent
            IconComponent={() => (
              <CheersIcon className="w-[70px] h-[70px] animated-glasses" />
            )}
            sequence={glassesSequence}
            address="C. 25a 7105, Aeropuerto, 31384 Chihuahua, Chihuahua"
            date="Sábado, 7 de septiembre 2024"
            link="https://maps.app.goo.gl/EmCao4B5J8p1N6dx5"
            place="Salón Quinta Esparza"
            time="Hora: 9:00 p.m."
            title="Recepción"
          />
        </div>
      </div>
    </div>
  );
}
