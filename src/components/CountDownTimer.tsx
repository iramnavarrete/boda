import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountDown";
import { useEffect, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";

const Square = ({ text, bottomText }: { text: string; bottomText: string }) => {
  return (
    <div className="w-[65px] h-[65px] text-center rounded-md bg-[#8f7022] flex flex-col justify-center items-center drop-shadow-[4px_4px_2px_rgba(0,0,0,0.25)]">
      <p className="leading-6 text-xl">{text}</p>
      <p className="text-xs">{bottomText}</p>
    </div>
  );
};

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  const [isClient, setIsClient] = useState(false);
  const { height } = useWindowSize();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient ? (
        <motion.div
          whileTap={{ scale: 1.2 }}
          className="text-white"
          initial={{ opacity: 0, y: height ? height * 0.7 : 0 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 24,
            },
          }}
          viewport={{ once: true, amount: "some" }}
        >
          <p className="relative flex flex-row font-sacramento text-5xl items-center justify-center mb-2 drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            Faltan:
          </p>
          <div className="flex flex-row gap-2 font-handlee">
            <Square bottomText="días" text={days} />
            <Square bottomText="horas" text={hours} />
            <Square bottomText="minutos" text={minutes} />
            <Square bottomText="segundos" text={seconds} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default CountdownTimer;
