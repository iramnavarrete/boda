import { motion } from "framer-motion";
import React, { PropsWithChildren } from "react";

const AnimatedEntrance: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24,
          duration: 1,
          delay: 0.5,
        },
      }}
      viewport={{ once: true, amount: "some" }}
      initial={{ y: 40, opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedEntrance;
