import AmazonIcon from "@/icons/amazon-icon";
// import LiverpoolIcon from "@/icons/liverpool-icon";
import BbvaIcon from "@/icons/bbva-icon";
// import BanamexIcon from "@/icons/banamex-icon";
// import SantanderIcon from "@/icons/santander-icon";
// import HsbcIcon from "@/icons/hsbc-icon";
import GiftIcon from "@/icons/gift-icon";
import { animate, useInView, motion } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import { giftSequence } from "@/constants/animationSequences";
import { cn } from "@heroui/theme";
import { ArrowRight, ChevronDown } from "lucide-react";

type StoreGift = {
  type: "amazon" | "liverpool" | "other";
  link: string;
  label?: string;
  icon?: React.ReactNode;
};

type BankTransfer = {
  bank: "bbva" | "banamex" | "santander" | "hsbc";
  cardNumber: string;
  beneficiary: string;
};

type Props = {
  containerClassName?: string;
  btnsClassName?: string;
  stores?: StoreGift[];
  showCash?: boolean;
  transfer?: BankTransfer;
};

// --- Iconos por tienda ---
const STORE_ICONS: Record<string, React.ReactNode> = {
  amazon: <AmazonIcon className="h-8 animated-gift" />,
  // liverpool: <LiverpoolIcon className="h-8 animated-gift" />,
};

// --- Iconos por banco ---
const BANK_ICONS: Record<string, React.ReactNode> = {
  bbva: <BbvaIcon className="h-10 animated-gift" />,
  // banamex: <BanamexIcon className="h-10 animated-gift" />,
  // santander: <SantanderIcon className="h-10 animated-gift" />,
  // hsbc: <HsbcIcon className="h-10 animated-gift" />,
};

const BANK_LABELS: Record<string, string> = {
  bbva: "BBVA",
  banamex: "Banamex",
  santander: "Santander",
  hsbc: "HSBC",
};

const GiftsTable: FC<Props> = ({
  containerClassName = "",
  btnsClassName = "",
  stores = [],
  showCash = false,
  transfer,
}) => {
  const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      animate(giftSequence);
    }
  }, [isInView]);

  return (
    <div
      className={cn(
        "px-5 bg-primary w-full py-24 relative overflow-hidden",
        containerClassName,
      )}
    >

      <div className="flex flex-col gap-12 justify-center items-center relative z-10">
        <AnimatedEntrance classname="flex flex-col items-center w-full">
          {/* Overline Editorial */}
          <p className="text-[10px] font-nourdMedium text-accent/60 uppercase tracking-[0.4em] mb-4 text-center">
            — Detalles —
          </p>

          {/* Título Script */}
          <p className="text-4xl md:text-6xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)] font-newIconScript text-accent mb-6 text-center">
            Mesa de regalos
          </p>

          {/* Divisor minimalista */}
          <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
            <div className="w-8 h-px bg-accent/30" />
            <span className="text-accent/50 text-xs">✦</span>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          {/* Texto de introducción */}
          <p className="text-accent/80 text-center leading-relaxed text-sm md:text-base font-nourdLight px-6 max-w-md italic">
            &quot;Tu presencia es el mejor regalo, pero si deseas tener un
            detalle con nosotros, puedes contribuir a hacer nuestra luna de miel
            aún más especial.&quot;
          </p>
        </AnimatedEntrance>

        <AnimatedEntrance classname="w-full">
          <div className="flex flex-col items-center gap-16 w-full mt-8">
            {/* --- TIENDAS ONLINE --- */}
            {stores.map((store, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center bg-primary z-10 py-2"
              >
                <motion.div ref={idx === 0 ? ref : undefined} className="mb-4">
                  {store.type === "other"
                    ? store.icon
                    : STORE_ICONS[store.type]}
                </motion.div>

                {/* <p className="font-nourdMedium text-lg text-accent mb-3 tracking-widest uppercase text-[11px]">
                  {store.type === "amazon"
                    ? "Amazon"
                    : store.type === "liverpool"
                      ? "Liverpool"
                      : "Mesa de Regalos"}
                </p> */}

                <a
                  className={cn(
                    "group flex items-center gap-2 text-[10px] font-nourdMedium text-accent uppercase tracking-[0.2em] border-b border-accent/20 pb-1 hover:border-accent transition-all",
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
              <div className="flex flex-col items-center text-center bg-primary z-10 py-2">
                <div className="mb-4">
                  <GiftIcon className="w-10 h-10 overflow-visible animated-gift text-accent" />
                </div>
                <p className="font-nourdMedium text-lg text-accent mb-2 tracking-widest uppercase text-[11px]">
                  Lluvia de Sobres
                </p>
                <div className="text-accent/70 text-center text-xs font-nourdLight">
                  <p>En efectivo el día de la boda</p>
                </div>
              </div>
            )}

            {/* --- TRANSFERENCIA --- */}
            {transfer && (
              <div className="flex flex-col items-center text-center bg-primary z-10 py-2 w-full">
                <div className="mb-4">{BANK_ICONS[transfer.bank]}</div>

                <p className="font-nourdMedium text-lg text-accent mb-3 tracking-widest uppercase text-[11px]">
                  Transferencia
                </p>

                <button
                  className={cn(
                    "group flex items-center gap-2 text-[10px] font-nourdMedium text-accent uppercase tracking-[0.2em] border-b border-accent/20 pb-1 hover:border-accent transition-all",
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
                    <div className="w-full py-6 border-y border-accent/20 flex flex-col items-center gap-5">
                      <div className="text-accent/90 text-center font-nourdLight text-sm">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-accent/50 mb-1 font-nourdMedium">
                          Banco
                        </span>
                        {BANK_LABELS[transfer.bank]}
                      </div>

                      <div className="text-accent/90 text-center font-nourdLight text-sm">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-accent/50 mb-1 font-nourdMedium">
                          Número de tarjeta
                        </span>
                        {transfer.cardNumber}
                      </div>

                      <div className="text-accent/90 text-center font-nourdLight text-sm">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-accent/50 mb-1 font-nourdMedium">
                          Beneficiario
                        </span>
                        {transfer.beneficiary}
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
