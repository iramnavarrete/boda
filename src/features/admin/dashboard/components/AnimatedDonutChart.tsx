import React, { useRef, useEffect } from "react";
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

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default React.memo(AnimatedDonutChart);
