import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import splitString from "@/utils/splitTextRegex";

type Props = {
  text: string;
  duration: number;
  delay: number;
};

const charVariants = {
  hidden: { opacity: 0 },
  reveal: { opacity: 1 },
};
function ElegantText({ text, delay, duration }: Props) {
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
      transition={{ staggerChildren: 0.01, delayChildren: delay }}
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
