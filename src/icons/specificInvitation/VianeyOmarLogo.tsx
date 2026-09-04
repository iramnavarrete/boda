"use client";

import { motion } from "framer-motion";
import { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<typeof motion.div>;

export default function VianeyOmarLogo(props: Props) {
  // Contenedor principal
  const containerVariants = {
    hidden: {},
    visible: {},
  };

  // 1. SVG: Se anima PRIMERO (espera los 1.5s del sobre)
  const svgVariants = {
    hidden: {
      clipPath: "polygon(0% -20%, 0% -20%, 0% 120%, 0% 120%)",
      opacity: 0,
    },
    visible: {
      clipPath: "polygon(-10% -20%, 110% -20%, 110% 120%, -10% 120%)",
      opacity: 1,
      transition: {
        delay: 1.5, // ⏱️ 1.5s
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  // 2. TEXTO SUPERIOR: Se anima SEGUNDO
  const topTextVariants = {
    hidden: { x: 40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        delay: 2.7, // ⏱️ 1.5s + 0.8s = 2.3s
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // 3. TEXTO INFERIOR: Se anima TERCERO
  const bottomTextVariants = {
    hidden: { x: -40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        delay: 3.2, // ⏱️ 2.3s + 0.8s = 3.1s
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col items-center justify-center text-center"
      {...props}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square min-w-[340px] w-[140%] max-w-[400px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.28)_0%,transparent_65%)] pointer-events-none -z-10" />

      {/* TEXTO SUPERIOR */}
      <motion.p
        className="font-edwardianScriptItc text-3xl drop-shadow-[4px_1px_1px_rgba(0,0,0,0.8)]"
        variants={topTextVariants}
      >
        Vianey <span className="font-greatVibes text-base ml-1 mr-0.5">&</span> Omar
      </motion.p>

      {/* SVG (MONOGRAMA) */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width="10em"
        height="7em"
        viewBox="0 0 46.825 29.617"
        variants={svgVariants}
      >
        <path
          d="M115.546 123.336c-2.876-.822-5.058-2.095-7.164-4.176-1.072-1.06-2.012-1.926-2.089-1.926-.077 0-.061.953.036 2.117l.177 2.117h-3.109l-.946-2.183c-.52-1.2-1.983-4.505-3.25-7.342a1246.717 1246.717 0 0 1-4.754-10.824c-2.536-5.863-2.848-6.32-4.358-6.383-.364-.016-.9-.13-1.19-.256-.32-.137 1.524-.225 4.63-.222 5.038.006 5.125.015 3.704.397-.8.215-1.56.493-1.687.617-.298.292-.194.563 3.02 7.807 1.486 3.347 3.38 7.633 4.212 9.525.83 1.892 1.757 3.916 2.058 4.498l.548 1.058.188-.994c.2-1.063.164-1.365-.532-4.43-.812-3.575-.09-7.793 1.833-10.726 1.037-1.581 2.721-3.331 3.843-3.993.442-.262.804-.576.804-.698s-.684-.542-1.521-.932c-1.082-.504-1.954-.71-3.019-.713-1.207-.003-1.442-.07-1.21-.351 1.024-1.239 3.938-1.449 7.411-.535 2.24.59 5.626.785 7.335.421.764-.162.647-.053-.661.62-.873.45-1.29.734-.926.632.364-.102 1.866-.245 3.339-.318 3.127-.155 4.779.22 7.193 1.636 2.698 1.581 4.475 3.922 5.63 7.417.497 1.503.609 2.4.595 4.762-.017 3.135-.455 4.859-1.828 7.202-1.62 2.764-5.253 5.368-8.75 6.27-2.273.586-7.357.536-9.562-.094zm7.934-.843c2.035-.432 3.809-1.415 5.555-3.081 2.526-2.409 3.644-5.334 3.649-9.548.01-7.68-4.096-12.738-10.34-12.738-2.607 0-5.713 1.276-7.061 2.9-.227.273-.293.887-.2 1.863.17 1.782-.336 4.044-1.257 5.615-.378.645-1.762 2.353-3.077 3.797-1.315 1.445-2.393 2.815-2.397 3.047-.004.231.359 1.152.805 2.045 2.312 4.626 8.616 7.31 14.323 6.1zm-14.34-13.35c0-.055.598-.993 1.331-2.083 1.878-2.796 2.631-4.527 2.634-6.058.003-1.264-.634-3.082-1.08-3.082-.318 0-2.29 2.537-2.899 3.73-.945 1.852-1.627 5.973-1.382 8.349l.149 1.438.623-1.097c.343-.603.623-1.142.623-1.197zm6.105-10.587c.352-.378 1.058-.92 1.567-1.204l.926-.517-1.294.146a26.85 26.85 0 0 1-2.47.145h-1.178l.685.814c.377.448.685.924.685 1.058 0 .434.422.261 1.079-.442z"
          style={{ fill: "currentColor" }}
          transform="translate(-88.863 -94.224)"
        />
      </motion.svg>

      {/* TEXTO INFERIOR */}
      <motion.p
        className="font-greatVibes text-xl drop-shadow-[4px_1px_1px_rgba(0,0,0,0.8)]"
        variants={bottomTextVariants}
      >
        07/11/26
      </motion.p>
    </motion.div>
  );
}