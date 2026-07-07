import React, { useEffect, useRef, useState } from "react";
import theme from "@/utils/theme";

interface ChartDataSlice {
  label: string;
  value: number;
  color: string;
}

interface AnimatedDonutChartProps {
  data: ChartDataSlice[];
  total: number;
  centerNumber: number | string;
  centerLabel: string;
  size?: number;
}

const AnimatedDonutChart: React.FC<AnimatedDonutChartProps> = ({
  data,
  total,
  centerNumber,
  centerLabel,
  size = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estado local para manejar el tooltip al pasar el cursor
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    value: number;
    color: string;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 12;
    let animationFrameId: number;
    let progress = 0;

    const draw = () => {
      const ease = 1 - Math.pow(1 - progress, 3);
      ctx.clearRect(0, 0, size, size);
      let startAngle = -0.5 * Math.PI;

      data.forEach((slice) => {
        const safeTotal = total > 0 ? total : 1;
        const sliceAngle = (slice.value / safeTotal) * (2 * Math.PI);
        const animatedSliceAngle = sliceAngle * ease;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          startAngle,
          startAngle + animatedSliceAngle,
        );
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();

        if (slice.value > 0) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = theme.colors.white;
          ctx.stroke();
        }
        startAngle += sliceAngle;
      });

      // Círculo hueco central
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = theme.colors.white;
      ctx.fill();

      // Textos centrales
      ctx.fillStyle = theme.colors.primary.DEFAULT;
      ctx.font = "bold 32px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerNumber.toString(), centerX, centerY - 6);

      ctx.fillStyle = theme.colors.stone[500];
      ctx.font = "10px sans-serif";
      ctx.fillText(centerLabel, centerX, centerY + 18);

      if (progress < 1) {
        progress += 0.03;
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [data, total, centerNumber, centerLabel, size]);

  // Lógica trigonométrica para saber qué tajada de la dona se está tocando
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 12;
    const innerRadius = radius * 0.7;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Verificamos si está estrictamente dentro del grosor de la dona
    if (distance >= innerRadius && distance <= radius) {
      // Calculamos el ángulo actual basándonos en el offset inicial de -0.5 * PI
      let normAngle = Math.atan2(dy, dx) - -0.5 * Math.PI;
      if (normAngle < 0) normAngle += 2 * Math.PI;

      let currentAngle = 0;
      let found = false;

      for (let i = 0; i < data.length; i++) {
        const safeTotal = total > 0 ? total : 1;
        const sliceAngle = (data[i].value / safeTotal) * (2 * Math.PI);

        if (
          normAngle >= currentAngle &&
          normAngle <= currentAngle + sliceAngle
        ) {
          if (data[i].value > 0) {
            setTooltip({
              visible: true,
              x: x,
              y: y,
              label: data[i].label,
              value: data[i].value,
              color: data[i].color,
            });
            found = true;
          }
          break;
        }
        currentAngle += sliceAngle;
      }

      if (!found) setTooltip(null);
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} />

      {/* Tooltip Dinámico */}
      {tooltip && tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none bg-white border border-[#EBE5DA] shadow-lg rounded-lg px-3 py-2 flex flex-col gap-0.5 animate-in fade-in duration-150"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            minWidth: "110px",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-none">
              {tooltip.label}
            </span>
          </div>
          <span className="text-base font-serif font-bold text-[#2C2C29]">
            {tooltip.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(AnimatedDonutChart);
