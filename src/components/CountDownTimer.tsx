import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountDown";
import { useEffect, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";

const Square = ({ text, bottomText }: { text: string; bottomText: string }) => {
  return (
    <div className="w-[50px] h-[65px] text-center rounded-md flex flex-col justify-center items-center">
      <p className="leading-6 text-2xl font-nourdBold text-primary ">{text}</p>
      <p className="text-xs font-nourdMedium text-primary mt-1">
        {bottomText}
      </p>
    </div>
  );
};

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative w-full mt-10 mb-3">
      {isClient ? (
        <motion.div
          whileTap={{ scale: 1.2 }}
          className="text-white"
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              duration: 1.5
            },
          }}
          viewport={{ once: true, amount: "some" }}
        >
          <p className="relative flex flex-row font-newIconScript text-primary text-3xl items-center justify-center mb-2 drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
            Falta poco:
          </p>
          <div className="flex flex-row justify-center items-center gap-1">
            <Square bottomText="DÍAS" text={days} />
            <div className="h-[50px] flex flex-col items-center">
              <p className="leading-6 text-xl font-nourdBold text-primary">
                :
              </p>
            </div>
            <Square bottomText="HORAS" text={hours} />
            <div className="h-[50px] flex flex-col items-center">
              <p className="leading-6 text-xl font-nourdBold text-primary">
                :
              </p>
            </div>
            <Square bottomText="MIN" text={minutes} />
            <div className="h-[50px] flex flex-col items-center">
              <p className="leading-6 text-xl font-nourdBold text-primary">
                :
              </p>
            </div>
            <Square bottomText="SEG" text={seconds} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default CountdownTimer;
