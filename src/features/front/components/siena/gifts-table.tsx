import AmazonIcon from "@/icons/amazon-icon";
import { animate, useInView, motion } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import { giftSequence } from "@/constants/animationSequences";
import { cn } from "@heroui/theme";
import { ArrowRight, ChevronDown, Copy, Check } from "lucide-react";
import BbvaIcon from "@/icons/siena/banks/bbva";
import CitiBanamexIcon from "@/icons/siena/banks/citibanamex";
import RegaloIcon from "@/icons/siena/regalo";
import SantanderIcon from "@/icons/siena/banks/santander";
import HsbcIcon from "@/icons/siena/banks/hsbc";
import NuIcon from "@/icons/siena/banks/nu";

type StoreGift = {
  type: "amazon" | "liverpool" | "other";
  link: string;
  label?: string;
  icon?: React.ReactNode;
};

type BankTransfer = {
  bank: "bbva" | "santander" | "hsbc" | "citibanamex" | "nu";
  cardNumber: string;
  beneficiary: string;
};

type Props = {
  containerClassName?: string;
  btnsClassName?: string;
  stores?: StoreGift[];
  showCash?: boolean;
  transfer?: BankTransfer;
  customTitle?: string;
  titleClassName?: string;
  customQuote?: string;
};

// --- Iconos por tienda ---
const STORE_ICONS: Record<string, React.ReactNode> = {
  amazon: <AmazonIcon className="h-8 animated-gift" />,
  // liverpool: <LiverpoolIcon className="h-8 animated-gift" />,
};

// --- Iconos por banco ---
const BANK_ICONS: Record<string, React.ReactNode> = {
  bbva: <BbvaIcon className="h-10 w-16 stroke-1 stroke-current" />,
  citibanamex: (
    <CitiBanamexIcon className="h-16 w-16 stroke-[0.5] stroke-current" />
  ),
  santander: (
    <SantanderIcon className="h-16 w-16 stroke-[0.5] stroke-current" />
  ),
  hsbc: <HsbcIcon className="h-16 w-16 stroke-[0.5] stroke-current" />,
  nu: <NuIcon className="h-16 w-16 stroke-[0.5] stroke-current" />,
};

const BANK_LABELS: Record<string, string> = {
  bbva: "BBVA",
  banamex: "Banamex",
  santander: "Santander",
  hsbc: "HSBC",
  citibanamex: "CitiBanamex",
};

const GiftsTable: FC<Props> = ({
  containerClassName = "",
  btnsClassName = "",
  stores = [],
  showCash = false,
  transfer,
  customTitle,
  titleClassName = "",
  customQuote,
}) => {
  const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      animate(giftSequence);
    }
  }, [isInView]);

  const handleCopy = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
        return;
      } catch (err) {
        console.warn(
          "API Clipboard bloqueada, usando método alternativo...",
          err,
        );
      }
    }

    // Fallback seguro
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Fallo al copiar texto", err);
    }

    document.body.removeChild(textArea);
  };

  // 🔥 Animación base para los íconos (Efecto "Pop" con rebote)
  const iconAnimationProps = {
    initial: { opacity: 0, scale: 0.3, y: 20 },
    whileInView: { opacity: 1, scale: 1, y: 0 },
    viewport: { once: true, amount: 0.5 },
  };

  return (
    <div
      className={cn(
        "px-5 bg-primary w-full py-24 relative overflow-hidden transform-gpu",
        containerClassName,
      )}
    >
      <div className="flex flex-col gap-12 justify-center items-center relative z-10 text-accent">
        <AnimatedEntrance classname="flex flex-col items-center w-full will-change-transform">
          {/* Overline Editorial */}
          <p className="text-[10px] font-nourdMedium text-current/60 uppercase tracking-[0.4em] mb-4 text-center">
            — Detalles —
          </p>

          {/* Título Script */}
          <p
            className={cn(
              "text-4xl md:text-6xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)] font-newIconScript text-current mb-6 text-center",
              titleClassName,
            )}
          >
            {customTitle || "Mesa de regalos"}
          </p>

          {/* Divisor minimalista */}
          <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
            <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
            <span className="text-current/50 text-xs">✦</span>
            <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
          </div>

          {/* Texto de introducción */}
          <p className="text-current/80 text-center leading-relaxed text-sm md:text-base font-nourdLight px-6 max-w-md italic">
            &quot;
            {customQuote ||
              "Tu presencia es el mejor regalo, pero si deseas tener un detalle con nosotros, puedes contribuir a hacer nuestra luna de miel aún más especial."}
            &quot;
          </p>
        </AnimatedEntrance>

        <AnimatedEntrance classname="w-full will-change-transform">
          <div className="flex flex-col items-center gap-16 w-full mt-8">
            {/* --- TIENDAS ONLINE --- */}
            {stores.map((store, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center z-10 py-2"
              >
                <motion.div
                  ref={idx === 0 ? ref : undefined}
                  className="mb-4"
                  {...iconAnimationProps}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: idx * 0.15,
                  }} // Animación en cascada
                >
                  {store.type === "other"
                    ? store.icon
                    : STORE_ICONS[store.type]}
                </motion.div>

                <a
                  className={cn(
                    "group flex items-center gap-2 text-[10px] font-nourdMedium text-current uppercase tracking-[0.2em] border-b border-[color-mix(in_srgb,currentColor_20%,transparent)] pb-1 hover:border-current transition-all",
                    btnsClassName,
                  )}
                  href={store.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {store.label ?? "Ver mesa"}{" "}
                  <ArrowRight
                    size={12}
                    className="opacity-70 group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            ))}

            {/* --- EFECTIVO --- */}
            {showCash && (
              <div className="flex flex-col items-center text-center z-10 py-2 text-current">
                <motion.div
                  className="mb-4"
                  {...iconAnimationProps}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  <RegaloIcon className="w-20 h-20 stroke-[0.5] stroke-current -ml-2" />
                </motion.div>
                <p className="font-nourdMedium text-lg mb-2 tracking-widest uppercase text-[11px]">
                  Lluvia de Sobres
                </p>
                <div className="text-current/70 text-center text-xs font-nourdLight">
                  <p>En efectivo el día de la boda</p>
                </div>
              </div>
            )}

            {/* --- TRANSFERENCIA --- */}
            {transfer && (
              <div className="flex flex-col items-center text-center z-10 py-2 w-full">
                <motion.div
                  className="mb-4"
                  {...iconAnimationProps}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  {BANK_ICONS[transfer.bank]}
                </motion.div>

                <p className="font-nourdMedium text-lg mb-3 tracking-widest uppercase text-[11px]">
                  Transferencia
                </p>

                <button
                  className={cn(
                    "group flex items-center gap-2 text-[10px] font-nourdMedium uppercase tracking-[0.2em] border-b border-[color-mix(in_srgb,currentColor_20%,transparent)] pb-1 hover:border-current transition-all",
                    btnsClassName,
                  )}
                  onClick={() => setIsCardInfoVisible(!isCardInfoVisible)}
                >
                  {isCardInfoVisible ? "Ocultar datos" : "Ver datos bancarios"}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "opacity-70 transition-transform duration-300",
                      isCardInfoVisible
                        ? "rotate-180"
                        : "group-hover:translate-y-0.5",
                    )}
                  />
                </button>

                {/* CONTENEDOR EXPANDIBLE (CSS GRID OPTIMIZADO) */}
                <div
                  className={cn(
                    "w-full max-w-[280px] grid transition-all duration-500 ease-in-out",
                    isCardInfoVisible
                      ? "grid-rows-[1fr] opacity-100 mt-6"
                      : "grid-rows-[0fr] opacity-0 mt-0",
                  )}
                >
                  <div className="overflow-hidden flex flex-col items-center w-full">
                    <div className="w-full py-6 border-y border-[color-mix(in_srgb,currentColor_20%,transparent)] flex flex-col items-center gap-5">
                      <div className="text-current/90 text-center font-nourdLight text-sm">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-current/50 mb-1 font-nourdMedium">
                          Banco
                        </span>
                        {BANK_LABELS[transfer.bank]}
                      </div>

                      <div className="text-current/90 text-center font-nourdLight text-sm flex flex-col items-center">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-current/50 mb-1 font-nourdMedium">
                          Número de tarjeta
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          <span>{transfer.cardNumber}</span>
                          <button
                            onClick={() => handleCopy(transfer.cardNumber)}
                            className="p-1 rounded-md text-current/50 hover:text-current hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)] transition-colors"
                            title="Copiar número"
                          >
                            {copiedText === transfer.cardNumber ? (
                              <div className="flex gap-1 items-center">
                                <Check size={12} />
                                <span className="text-xs">Copiado</span>
                              </div>
                            ) : (
                              <div className="flex gap-1 items-center">
                                <Copy size={12} />
                                <span className="text-xs">Copiar</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-current/90 text-center font-nourdLight text-sm flex flex-col items-center">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-current/50 mb-1 font-nourdMedium">
                          Beneficiario
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          <span>{transfer.beneficiary}</span>
                          <button
                            onClick={() => handleCopy(transfer.beneficiary)}
                            className="p-1 rounded-md text-current/50 hover:text-current hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)] transition-colors"
                            title="Copiar beneficiario"
                          >
                            {copiedText === transfer.beneficiary ? (
                              <div className="flex gap-1 items-center">
                                <Check size={12} />
                                <span className="text-xs">Copiado</span>
                              </div>
                            ) : (
                              <div className="flex gap-1 items-center">
                                <Copy size={12} />
                                <span className="text-xs">Copiar</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default GiftsTable;
