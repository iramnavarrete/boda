"use client";

import { formatTo12Hour } from "@/utils/formatters";
import { cn } from "@heroui/theme";
import { animate, AnimationSequence, useInView, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface EditorialEventProps {
  time: string;
  place: string;
  address: string;
  link: string;
  IconComponent?: () => React.ReactNode;
  imageSrc?: string;
  title: string;
  sequence?: AnimationSequence;
  textClassName?: string;
  typeEvent: string;
}

const EditorialEvent: React.FC<EditorialEventProps> = ({
  address,
  place,
  time,
  link,
  IconComponent,
  imageSrc,
  title,
  sequence,
  textClassName = "",
  typeEvent,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.6, once: true });

  useEffect(() => {
    if (isInView && sequence) {
      animate(sequence);
    }
  }, [isInView, sequence]);

  const isImageVariant = !!imageSrc;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center w-full mx-auto relative z-10",
        isImageVariant ? "max-w-md" : "max-w-sm text-primary",
        textClassName,
      )}
    >
      <div
        className={cn(
          "w-full flex flex-col items-center transition-all",
          isImageVariant &&
            "relative rounded-[2rem] overflow-hidden py-16 sm:py-20 px-4 sm:px-6 shadow-2xl",
        )}
      >
        {isImageVariant && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
            />
            <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
          </div>
        )}

        <div
          className={cn(
            "relative z-10 flex flex-col items-center w-full",
            isImageVariant ? "text-white" : "text-current",
          )}
        >
          {!isImageVariant && IconComponent && (
            <div className="mb-4 bg-accent p-4 rounded-full text-primary">
              <IconComponent />
            </div>
          )}

          <p className="text-[9px] font-nourdMedium opacity-70 uppercase tracking-[0.4em] mb-2 text-center">
            {typeEvent}
          </p>
          <p
            className={cn(
              "text-4xl sm:text-5xl font-newIconScript mb-6 drop-shadow-md",
              textClassName,
            )}
          >
            {title}
          </p>
          <p className="text-center text-base sm:text-lg font-nourdMedium tracking-widest mb-4 opacity-90">
            {formatTo12Hour(time)}
          </p>
          <p className="text-center text-sm sm:text-base font-nourdMedium mb-2 px-4 opacity-90">
            {place}
          </p>
          <div className="opacity-80 text-center leading-relaxed text-xs sm:text-sm font-nourdLight mb-8 px-4 max-w-[280px]">
            <p className="whitespace-pre-wrap">
              {address.replaceAll(",", "\n")}
            </p>
          </div>

          <a
            className={cn(
              "group flex items-center justify-center gap-2 text-[10px] font-nourdMedium uppercase tracking-[0.2em] transition-all rounded-full px-8 py-3.5 duration-400",
              isImageVariant
                ? "bg-white text-black hover:bg-gray-100 hover:scale-105 shadow-[0_4px_14px_0_rgba(255,255,255,0.2)]"
                : "border border-current hover:bg-current",
            )}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-current group-hover:text-accent">
              Ver Mapa
            </span>
            {!isImageVariant && (
              <ArrowRight
                size={12}
                className="opacity-70 group-hover:translate-x-1 transition-transform text-current group-hover:text-accent"
              />
            )}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorialEvent;
