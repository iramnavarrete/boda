interface BeigeWavesProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  flipY?: boolean; // 🔥 Nueva propiedad para voltearlo nativamente
}

const BeigeWaves = ({
  color,
  className,
  flipY = false,
  ...props
}: BeigeWavesProps) => {
  return (
    <svg
      viewBox="0 0 496 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ transform: "translate3d(0,0,0)" }}
      className={className}
      {...props}
    >
      {/* 🔥 Aplicamos la inversión con matemáticas nativas de SVG */}
      <g transform={flipY ? "translate(0, 113) scale(1, -1)" : undefined}>
        <path
          d="M0 101.413C23.2605 92.6683 107.032 80.4265 256.032 101.413C405.033 122.399 478.094 110.157 496 101.413V3.38574H0V101.413Z"
          fill={color ? color : "#F5EFE6"}
          fillOpacity="0.5"
        />
        <path
          d="M0 112.918C23.2605 104.174 111.55 77.6653 260.551 98.6513C409.551 119.637 478.094 101.873 496 93.1286V0H0V112.918Z"
          fill={color ? color : "#F5EFE6"}
          fillOpacity="0.6"
        />
        <path
          d="M0 98.0268C23.2605 89.2826 107.032 77.0407 256.032 98.0268C405.033 119.013 478.094 106.771 496 98.0268V0H0V98.0268Z"
          fill={color ? color : "#F5EFE6"}
        />
      </g>
    </svg>
  );
};

export default BeigeWaves;
