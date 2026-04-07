"use client";

import { motion } from "framer-motion";
import { useCountdown } from "@/features/front/hooks/useCountDown";
import AddToCalendar from "./AddToCalendar";
import { useInvitationStore } from "../stores/invitationStore";
import { FC } from "react";
import { cn } from "@heroui/theme";

const Square = ({
  text,
  bottomText,
  textClassName = "",
}: {
  text: string;
  bottomText: string;
  textClassName?: string;
}) => {
  return (
    <div className="w-[50px] h-[65px] text-center rounded-md flex flex-col justify-center items-center">
      <p
        className={cn(
          "leading-6 text-2xl font-nourdBold text-primary",
          textClassName,
        )}
      >
        {text}
      </p>
      <p
        className={cn(
          "text-xs font-nourdMedium text-primary mt-1",
          textClassName,
        )}
      >
        {bottomText}
      </p>
    </div>
  );
};

type Props = {
  textClassName?: string;
  addToCalendarBtnClassName?: string;
};

const CountdownTimer: FC<Props> = ({ textClassName = "", addToCalendarBtnClassName = '' }) => {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const [days, hours, minutes, seconds] = useCountdown(
    invitationData?.fechaISO,
  );

  return (
    <div className="relative w-full mt-10 mb-3">
      <motion.div
        whileTap={{ scale: 1.2 }}
        className="text-white"
        initial={{ opacity: 0 }}
        whileInView={{
          opacity: 1,
          transition: {
            duration: 1.5,
          },
        }}
        viewport={{ once: true, amount: "some" }}
      >
        <p
          className={cn(
            "relative flex flex-row font-newIconScript text-primary text-3xl items-center justify-center mb-2 drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]",
            textClassName,
          )}
        >
          Falta poco:
        </p>
        <div className="flex flex-row justify-center items-center gap-1">
          <Square bottomText="DÍAS" text={days} textClassName={textClassName} />
          <div className="h-[50px] flex flex-col items-center">
            <p
              className={cn(
                "leading-6 text-xl font-nourdBold text-primary",
                textClassName,
              )}
            >
              :
            </p>
          </div>
          <Square
            bottomText="HORAS"
            text={hours}
            textClassName={textClassName}
          />
          <div className="h-[50px] flex flex-col items-center">
            <p
              className={cn(
                "leading-6 text-xl font-nourdBold text-primary",
                textClassName,
              )}
            >
              :
            </p>
          </div>
          <Square
            bottomText="MIN"
            text={minutes}
            textClassName={textClassName}
          />
          <div className="h-[50px] flex flex-col items-center">
            <p
              className={cn(
                "leading-6 text-xl font-nourdBold text-primary",
                textClassName,
              )}
            >
              :
            </p>
          </div>
          <Square
            bottomText="SEG"
            text={seconds}
            textClassName={textClassName}
          />
        </div>
      </motion.div>
      <AddToCalendar addToCalendarBtnClassName={addToCalendarBtnClassName} />
    </div>
  );
};

export default CountdownTimer;
