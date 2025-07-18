import { motion } from "framer-motion";
import React, { HTMLProps, PropsWithChildren } from "react";

const AnimatedEntrance: React.FC<PropsWithChildren<{ classname?: string }>> = ({
  children,
  classname = "",
}) => {
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
      className={classname}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedEntrance;
