import { cn } from "@heroui/theme";

export type BotanicalVariant = "sprig" | "leaf-cluster" | "olive-branch";

interface BotanicalAccentProps {
  variant?: BotanicalVariant;
  className?: string;
  /**
   * Color del trazo/relleno. Hereda `currentColor` por defecto para poder
   * controlarlo desde Tailwind (text-gold-500, text-primary, etc.).
   */
  color?: string;
}

/**
 * Pequeño acento botánico decorativo para usar en esquinas de cards,
 * headers y empty states. Se renderiza inline (no carga assets externos).
 *
 * Diseñado para verse sutil: baja opacidad, dimensiones pequeñas.
 */
const BotanicalAccent = ({
  variant = "sprig",
  className,
  color,
}: BotanicalAccentProps) => {
  const fillProps = color ? { color } : {};

  if (variant === "leaf-cluster") {
    return (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...fillProps}
        className={cn("pointer-events-none select-none", className)}
      >
        <g opacity="0.55">
          {/* Tallo central */}
          <path
            d="M40 8C40 30 40 55 40 74"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hojas a la izquierda */}
          <ellipse
            cx="26"
            cy="22"
            rx="9"
            ry="4"
            fill="currentColor"
            transform="rotate(-35 26 22)"
          />
          <ellipse
            cx="22"
            cy="42"
            rx="10"
            ry="4"
            fill="currentColor"
            transform="rotate(-30 22 42)"
          />
          <ellipse
            cx="26"
            cy="60"
            rx="8"
            ry="3.5"
            fill="currentColor"
            transform="rotate(-40 26 60)"
          />
          {/* Hojas a la derecha */}
          <ellipse
            cx="54"
            cy="28"
            rx="9"
            ry="4"
            fill="currentColor"
            transform="rotate(35 54 28)"
          />
          <ellipse
            cx="58"
            cy="48"
            rx="10"
            ry="4"
            fill="currentColor"
            transform="rotate(30 58 48)"
          />
          <ellipse
            cx="54"
            cy="66"
            rx="7"
            ry="3"
            fill="currentColor"
            transform="rotate(40 54 66)"
          />
        </g>
      </svg>
    );
  }

  if (variant === "olive-branch") {
    return (
      <svg
        viewBox="0 0 90 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...fillProps}
        className={cn("pointer-events-none select-none", className)}
      >
        <g opacity="0.6">
          <path
            d="M6 30 Q 30 12, 60 28 T 86 24"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="20"
            cy="22"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(-25 20 22)"
          />
          <ellipse
            cx="34"
            cy="16"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(-15 34 16)"
          />
          <ellipse
            cx="50"
            cy="22"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(20 50 22)"
          />
          <ellipse
            cx="66"
            cy="30"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(35 66 30)"
          />
          <ellipse
            cx="26"
            cy="34"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(25 26 34)"
          />
          <ellipse
            cx="42"
            cy="38"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(30 42 38)"
          />
          <ellipse
            cx="58"
            cy="42"
            rx="6"
            ry="3"
            fill="currentColor"
            transform="rotate(40 58 42)"
          />
        </g>
      </svg>
    );
  }

  // "sprig" (default) — una ramita con 3 hojas pequeñas, ideal para esquinas
  return (
    <svg
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...fillProps}
      className={cn("pointer-events-none select-none", className)}
    >
      <g opacity="0.55">
        <path
          d="M30 6 Q 33 30, 30 76"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="22"
          cy="20"
          rx="6"
          ry="3"
          fill="currentColor"
          transform="rotate(-30 22 20)"
        />
        <ellipse
          cx="38"
          cy="30"
          rx="6"
          ry="3"
          fill="currentColor"
          transform="rotate(30 38 30)"
        />
        <ellipse
          cx="22"
          cy="44"
          rx="6"
          ry="3"
          fill="currentColor"
          transform="rotate(-30 22 44)"
        />
        <ellipse
          cx="38"
          cy="54"
          rx="5"
          ry="2.5"
          fill="currentColor"
          transform="rotate(30 38 54)"
        />
        <ellipse
          cx="24"
          cy="66"
          rx="4.5"
          ry="2.2"
          fill="currentColor"
          transform="rotate(-30 24 66)"
        />
      </g>
    </svg>
  );
};

export default BotanicalAccent;
