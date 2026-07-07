import React from "react";
import { cn } from "@heroui/theme";
import SealDecoration from "@/icons/seal-decoration";

interface WaxSealProps {
  initials?: string;
  sealColor?: string;
  textColor?: string;
  className?: string;
  size?: number;
}

export default function WaxSeal({
  initials,
  sealColor = "#6A7A62",
  textColor = "#1e241b",
  className,
  size = 130,
}: WaxSealProps) {
  // Separamos las iniciales (Ej: "J & Y")
  const parts = (initials || "J & Y").split("&").map((s) => s.trim());
  const leftInitial = parts[0] || "J";
  const rightInitial = parts[1] || "Y";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center drop-shadow-md",
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* 1. CAPA DE COLOR CON MÁSCARA 
        Esto recorta el color exactamente con la forma irregular del sello, 
        evitando el feo círculo perfecto de fondo.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: sealColor || "#6A7A62",
          WebkitMaskImage: `url('/img/sello-gris.png')`,
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskImage: `url('/img/sello-gris.png')`,
          maskSize: "contain",
          maskPosition: "center",
          maskRepeat: "no-repeat",
        }}
      />

      {/* 2. CAPA DE TEXTURA Y SOMBRAS
        Cambiamos de 'multiply' a 'hard-light'.
        Hard-light toma el gris neutro como transparente, manteniendo el color HEX original,
        mientras aplica las sombras negras y los brillos blancos de tu imagen en gris.
      */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `url('/img/sello-gris.png')`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          mixBlendMode: "hard-light",
        }}
      />

      {/* 3. EL GRABADO (ARTE FLORAL Y TEXTO)
        Usamos color-burn y opacidad para simular que está hundido en la cera.
      */}
      <div
        className="relative z-10 flex items-center justify-center w-full h-full opacity-80"
        style={{ color: textColor || "#1e241b" }}
      >
        {/* Aro floral minimalista y elegante (réplica de tu diseño) */}
        <SealDecoration
          className={`absolute text-[${textColor || "#1e241b"}]`}
          style={{
            width: size * 0.5,
            height: size * 0.5,
            transform: `translate(0, -${size * 0.01}px)`,
          }}
        />

        {/* Iniciales con la tipografía de tu invitación */}
        <div
          className={`absolute w-[${size * 0.2}px] h-[${size * 0.2}px]`}
          style={{
            width: size * 0.2,
            height: size * 0.2,
          }}
        >
          <div
            className={`relative h-full flex justify-center items-center font-newIconScript leading-none text-[${textColor || "#1e241b"}]`}
          >
            {/* J un poco más arriba */}
            <span
              style={{
                position: "absolute",
                fontSize: size * 0.12,
                transform: `translate(-${size * 0.085}px, -${size * 0.085}px)`,
              }}
            >
              {leftInitial}
            </span>
            {/* El ampersand pequeño en el centro */}
            <span
              style={{
                position: "absolute",
                fontSize: size * 0.07,
                transform: `translate(-${size * 0.005}px, 0)`,
              }}
              className="font-rhymeFormal italic mx-0.5"
            >
              &
            </span>
            {/* Y un poco más abajo */}
            <span
              style={{
                position: "absolute",
                fontSize: size * 0.12,
                transform: `translate(${size * 0.075}px, ${size * 0.075}px)`,
              }}
            >
              {rightInitial}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
