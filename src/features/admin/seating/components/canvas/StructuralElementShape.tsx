import React from "react";
import { ColumnShape, ElementType } from "@/types/seating";

interface StructuralElementShapeProps {
  type: ElementType;
  width: number;
  height: number;
  alias?: string;
  columnShape?: ColumnShape;
}

/**
 * Renderiza los elementos ESTRUCTURALES del plano (siempre al fondo).
 *
 * Estilo: interpretación elegante de un plano arquitectónico.
 *
 * Tipos soportados: wall, door, window, column, stairs
 *  (aisle fue removido de la paleta, pero se sigue renderizando si existe)
 */
export function StructuralElementShape({
  type,
  width,
  height,
  alias,
  columnShape = "square",
}: StructuralElementShapeProps) {
  switch (type) {
    case "wall":
      return <WallShape width={width} height={height} />;
    case "door":
      return <DoorShape width={width} height={height} alias={alias} />;
    case "window":
      return <WindowShape width={width} height={height} />;
    case "column":
      return (
        <ColumnShapeView
          width={width}
          height={height}
          shape={columnShape}
        />
      );
    case "stairs":
      return <StairsShape width={width} height={height} />;
    case "aisle":
      return <AisleShape width={width} height={height} alias={alias} />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// PALETA COMÚN
// ─────────────────────────────────────────────────────────────
const STROKE = "#5A5A5A";
const FILL = "#EBE5DA";
const BRICK_LINE = "#A8A29E";
const FILL_DARK = "#D6CFC0";
const DOOR_GOLD = "#A78B5C";

// ─────────────────────────────────────────────────────────────
// 1. PARED / MURO — sin label visible
// ─────────────────────────────────────────────────────────────
function WallShape({ width, height }: { width: number; height: number }) {
  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        <rect
          x={3}
          y={3}
          width={width - 6}
          height={height - 6}
          fill="none"
          stroke={FILL_DARK}
          strokeWidth={1}
        />
        {/* Juntas de ladrillo */}
        {(() => {
          const lines: number[] = [];
          for (let y = 8; y < height; y += 8) lines.push(y);
          return lines.map((y, idx) => (
            <line
              key={`h-${idx}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={BRICK_LINE}
              strokeWidth={0.75}
              strokeDasharray="2 1"
              opacity={0.7}
            />
          ));
        })()}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PUERTA — interpretación minimalista del símbolo arquitectónico
// estándar: jamba vertical sólida a la izquierda + arco punteado
// de barrido desde el tope de la jamba hasta la esquina inferior
// derecha. El arco es ELÍPTICO (rx = width, ry = height) para que
// se adapte a cualquier aspect ratio del bounding box y siempre
// conecte los dos puntos (top-left → bottom-right) sin distorsionarse.
// ─────────────────────────────────────────────────────────────
function DoorShape({
  width,
  height,
  alias,
}: {
  width: number;
  height: number;
  alias?: string;
}) {
  // Grosor de la jamba y del arco, en coords del viewBox. Como el
  // SVG usa preserveAspectRatio="none" con viewBox = box del
  // elemento, las líneas conservan su grosor relativo correctamente.
  const jambStroke = Math.max(2, Math.min(width, height) * 0.08);
  const arcStroke = Math.max(1, Math.min(width, height) * 0.02);
  const showLabel = !!(alias && width >= 60 && height >= 60);

  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        {/* Jamba vertical (línea sólida a la izquierda, ocupa todo el alto) */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={height}
          stroke={STROKE}
          strokeWidth={jambStroke}
        />
        {/* Arco de apertura: elíptico desde (0,0) hasta (width,height),
            sweep-flag=1 → bulge hacia la región superior-derecha
            (hacia AFUERA de la jamba, como en planos arquitectónicos). */}
        <path
          d={`M 0 0 A ${width} ${height} 0 0 1 ${width} ${height}`}
          fill="none"
          stroke={DOOR_GOLD}
          strokeWidth={arcStroke}
          strokeDasharray="4 3"
          strokeLinecap="round"
          opacity={0.85}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute left-0 right-0 text-center font-serif text-[1rem] text-[#5A5A5A] leading-none pointer-events-none whitespace-nowrap"
          style={{ bottom: `calc(100% + 5px)` }}
        >
          {alias}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. VENTANA — si es muy pequeña, solo el rectángulo
// ─────────────────────────────────────────────────────────────
function WindowShape({ width, height }: { width: number; height: number }) {
  // Si es muy pequeña, solo el rectángulo (sin líneas internas)
  const isVerySmall = width < 60 || height < 30;

  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          fill="#E0F2FE"
          stroke="#6B8DA8"
          strokeWidth={2}
        />
        {!isVerySmall && (
          <>
            <line
              x1={6}
              y1={height / 2 - 1.5}
              x2={width - 6}
              y2={height / 2 - 1.5}
              stroke="#6B8DA8"
              strokeWidth={1}
            />
            <line
              x1={6}
              y1={height / 2 + 1.5}
              x2={width - 6}
              y2={height / 2 + 1.5}
              stroke="#6B8DA8"
              strokeWidth={1}
            />
          </>
        )}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. COLUMNA / PILAR — cuadrada o circular, CSS puro
// ─────────────────────────────────────────────────────────────
function ColumnShapeView({
  width,
  height,
  shape,
}: {
  width: number;
  height: number;
  shape: ColumnShape;
}) {
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const half = size / 2;

  if (shape === "circle") {
    const r1 = size / 2 - 1;
    return (
      <div className="structural-shape w-full h-full relative">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
        >
          <circle cx={cx} cy={cy} r={r1} fill={FILL} stroke={STROKE} strokeWidth={2} />
          {size > 40 && (
            <>
              <circle cx={cx} cy={cy} r={r1 * 0.7} fill="none" stroke={BRICK_LINE} strokeWidth={1} />
              <circle cx={cx} cy={cy} r={r1 * 0.4} fill="none" stroke={BRICK_LINE} strokeWidth={1} />
            </>
          )}
          <circle cx={cx} cy={cy} r={2.5} fill={STROKE} />
        </svg>
      </div>
    );
  }

  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        <rect
          x={cx - half + 1}
          y={cy - half + 1}
          width={size - 2}
          height={size - 2}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
        />
        {size > 40 && (
          <>
            <circle cx={cx} cy={cy} r={half * 0.7} fill="none" stroke={BRICK_LINE} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={half * 0.4} fill="none" stroke={BRICK_LINE} strokeWidth={1} />
          </>
        )}
        <circle cx={cx} cy={cy} r={2.5} fill={STROKE} />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. ESCALERAS
// ─────────────────────────────────────────────────────────────
function StairsShape({ width, height }: { width: number; height: number }) {
  const stepCount = Math.max(3, Math.floor(height / 8));
  const lines: number[] = [];
  for (let i = 1; i < stepCount; i++) {
    lines.push((i * height) / stepCount);
  }

  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#F5EFE3"
          stroke="#9C7C5A"
          strokeWidth={2}
        />
        {lines.map((y, idx) => (
          <line
            key={`step-${idx}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="#9C7C5A"
            strokeWidth={1}
            opacity={0.85}
          />
        ))}
        {height > 50 && (
          <g opacity={0.9}>
            <line
              x1={width / 2}
              y1={height - 6}
              x2={width / 2}
              y2={6}
              stroke="#9C7C5A"
              strokeWidth={1.5}
            />
            <polyline
              points={`${width / 2 - 4},10 ${width / 2},4 ${width / 2 + 4},10`}
              fill="none"
              stroke="#9C7C5A"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. PASILLO (mantenido por compatibilidad, ya no aparece en paleta)
// ─────────────────────────────────────────────────────────────
function AisleShape({
  width,
  height,
  alias,
}: {
  width: number;
  height: number;
  alias?: string;
}) {
  return (
    <div className="structural-shape w-full h-full relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#F9F7F2"
          stroke="#C5A669"
          strokeWidth={1.5}
        />
        <line
          x1={4}
          y1={0}
          x2={4}
          y2={height}
          stroke="#C5A669"
          strokeWidth={1}
          opacity={0.6}
        />
        <line
          x1={width - 4}
          y1={0}
          x2={width - 4}
          y2={height}
          stroke="#C5A669"
          strokeWidth={1}
          opacity={0.6}
        />
        <line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={height}
          stroke="#C5A669"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.9}
        />
      </svg>
      {alias && width > 80 && height > 30 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-white/85 rounded text-[#8B7340]">
            {alias}
          </span>
        </div>
      )}
    </div>
  );
}

export default StructuralElementShape;
