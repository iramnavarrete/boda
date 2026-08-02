"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import splitString from "@/utils/splitTextRegex";

// 🔥 1. Extraemos el tiempo de separación a una constante exportable
export const ELEGANT_STAGGER_TIME = 0.01;

// 🔥 2. Creamos una función que calcula exactamente cuánto tarda el texto
export const getElegantTotalTime = (text: string, duration: number = 0.2) => {
  const charCount = splitString(text).length;
  // Tiempo total = (cantidad de letras * tiempo entre letras) + duración de la última letra
  return charCount * ELEGANT_STAGGER_TIME + duration;
};

type Props = {
  text: string;
  duration?: number; // Lo hacemos opcional con valor por defecto
  delay?: number; // Lo hacemos opcional con valor por defecto
};

const charVariants = {
  hidden: { opacity: 0 },
  reveal: { opacity: 1 },
};

function ElegantText({ text, delay = 0, duration = 0.2 }: Props) {
  const textChars: string[] = splitString(text);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <motion.p
      initial="hidden"
      whileInView="reveal"
      // 🔥 Usamos la constante aquí para que jamás se desincronice
      transition={{
        staggerChildren: ELEGANT_STAGGER_TIME,
        delayChildren: delay,
      }}
      viewport={{ once: true, amount: "some" }}
    >
      {textChars.map((char, index) => {
        return (
          <motion.span
            key={`char-index-${index}`}
            variants={charVariants}
            transition={{ duration }}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.p>
  );
}

export default ElegantText;
