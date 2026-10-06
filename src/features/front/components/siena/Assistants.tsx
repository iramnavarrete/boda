import assistanceSchema from "@/validation/yupSchema";
import { Formik, FormikProps } from "formik";
import { FC, useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Separator from "@/icons/separator";
import { Family, FamilyFormData, Invitation } from "@/types";
import {
  Plus,
  Minus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import { useFamilyContext } from "../FamilyContext";
import AnimatedEntrance from "../AnimatedEntrance";
import { useToast } from "@/features/shared/components/Toast";
import { cn } from "@heroui/theme";
import html2canvas from "html2canvas";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import { ReactQRCode } from "@lglab/react-qr-code";
import {
  defaultFamily,
  isDefaultId,
  useFamilyRSVP,
} from "@/features/front/hooks/useFamilyRSVP";

/* ============================================================================
 * VARIANT: "wedding" (default) | "xv"
 * ============================================================================
 * El mismo formulario, estado y flujo de Firestore, con DOS diseños
 * visuales. DRY: bodas y XV Años comparten la lógica de carga, validación
 * y persistencia — sólo cambia el look & feel.
 * ========================================================================== */
export type AssistantsVariant = "wedding" | "xv";

type Props = {
  /** Variante de diseño. Default: "wedding". */
  variant?: AssistantsVariant;
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  btnClassName?: string;
  activeConfirmBtnClassName?: string;
  activeDeclineBtnClassName?: string;
  inactiveConfirmBtnClassName?: string;
  inactiveDeclineBtnClassName?: string;
  sendFormBtnClassName?: string;
  sealImage?: string;
};

interface StateCardProps {
  familyData: { nombre: string; confirmados: number | null; id: string };
  invitationData?: Invitation | null;
  textClassName?: string;
  svgsColor?: string;
  variant: AssistantsVariant;
  /** Ref externo que se ata al wrapper del card — el orquestador lo
   *  usa para hacer scroll suave al inicio del card tras el submit. */
  outerRef?: React.RefObject<HTMLDivElement>;
}

/* ============================================================================
 * TicketCard — pase digital con QR descargable
 * Diseño cambia según variant (wedding: cream + flores / xv: dark + diamantes)
 * ========================================================================== */
const TicketCard: FC<StateCardProps> = ({
  familyData,
  invitationData,
  textClassName,
  variant,
  outerRef,
}) => {
  const { toast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const confirmados = familyData.confirmados || 0;

  const handleDownloadImage = async () => {
    if (ticketRef.current === null) return;
    try {
      setIsDownloading(true);
      toast("Generando tu pase en alta calidad...", "info");
      await new Promise((resolve) => setTimeout(resolve, 150));
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      // Convertir a Blob en vez de dataURL. Safari tiene un límite
      // histórico de longitud para href de `<a>` (data URLs >2MB fallan);
      // los Blob URLs no tienen ese límite. Chrome funciona con ambos.
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) throw new Error("No se pudo convertir el canvas a Blob");

      // Blob URL temporal — hay que revocarlo después para no leakear memoria.
      const objectUrl = URL.createObjectURL(blob);
      const safeName = familyData.nombre.replace(/\s+/g, "-");
      const fileName = `Pase-${safeName}.png`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.style.display = "none";
      // Safari requiere que el `<a>` esté en el DOM (aunque sea
      // invisible) para que `click()` dispare la descarga. Chrome
      // es más permisivo pero appendar es safe para ambos.
      document.body.appendChild(link);
      link.click();
      // Cleanup en el siguiente tick para que Safari tenga tiempo de
      // procesar la descarga antes de remover el link.
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }, 0);

      toast("¡Pase descargado con éxito!", "success");
    } catch {
      toast("Hubo un error al descargar el pase.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const dateObj = new Date(invitationData?.fechaISO || Date.now());
  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(dateObj)
    .replace(/,/g, " •");

  const isWedding = variant === "wedding";

  return (
    <motion.div
      ref={outerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-[400px] mx-auto flex flex-col items-center gap-6",
      )}
    >
      <div
        ref={ticketRef}
        className={cn(
          "w-full rounded-xl shadow-2xl relative overflow-hidden",
          isWedding
            ? "bg-[#FDFBF7] border border-[#EBE5DA]"
            : "bg-xv-bg-deepest border border-xv-accent-soft/30 p-7",
          !isWedding && "p-0",
          textClassName,
        )}
      >
        {isWedding ? (
          <WeddingTicketBody
            familyData={familyData}
            invitationData={invitationData}
            formattedDate={formattedDate}
            dateObj={dateObj}
            confirmados={confirmados}
          />
        ) : (
          <XvTicketBody
            familyData={familyData}
            invitationData={invitationData}
            formattedDate={formattedDate}
            dateObj={dateObj}
            confirmados={confirmados}
          />
        )}
      </div>

      {/* Botón de descarga (común) */}
      <div className="w-full space-y-3 pt-2">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className={cn(
            "w-full rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 border disabled:opacity-50",
            isWedding
              ? "bg-[#1A1A1A] text-white hover:bg-black border-[#1A1A1A]"
              : "bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark border-transparent",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a-2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span className="font-semibold text-[11px] tracking-widest uppercase">
            {isDownloading ? "Generando Imagen..." : "Descargar Pase Digital"}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

/* ───── Wedding ticket body (cream / Flores) ───── */
const WeddingTicketBody: FC<{
  familyData: StateCardProps["familyData"];
  invitationData: Invitation | null | undefined;
  formattedDate: string;
  dateObj: Date;
  confirmados: number;
}> = ({ familyData, invitationData, formattedDate, dateObj, confirmados }) => {
  return (
    <>
      <div className="w-full flex justify-center mt-6" />
      <div className="pt-4 pb-5 px-8 flex flex-col items-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-4 border border-current opacity-50 px-5 py-1.5 rounded-full bg-white shadow-sm">
          ✦ Pase de Acceso ✦
        </p>
        <p className="font-serif text-2xl text-center leading-tight mb-2">
          {invitationData?.nombre || "Nuestra Boda"}
        </p>
        <p className="text-[9px] text-current opacity-70 uppercase tracking-[0.2em] text-center">
          {formattedDate}
        </p>
      </div>

      <div className="relative h-8 flex items-center justify-center">
        <div className="absolute -left-4 w-8 h-8 bg-accent rounded-full shadow-inner border-r border-[#EBE5DA]" />
        <div className="w-full border-t border-dashed border-stone-300 mx-6 opacity-60" />
        <div className="absolute -right-4 w-8 h-8 bg-accent rounded-full shadow-inner border-l border-[#EBE5DA]" />
      </div>

      <div className="pt-6 pb-6 px-4 flex flex-col items-center">
        <p className="text-[9px] font-bold text-current opacity-50 uppercase tracking-[0.25em] mb-3">
          Invitado
        </p>
        <p className="text-2xl md:text-3xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.05)] font-newIconScript text-center mb-4">
          {familyData.nombre}
        </p>
        <p className="text-[10px] font-bold text-current opacity-50 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
          {confirmados} Pase{confirmados > 1 ? "s" : ""} Confirmado
          {confirmados > 1 ? "s" : ""}
        </p>

        <div className="mx-auto w-36 h-36 bg-white rounded-xl shadow-sm border border-current/20 flex items-center justify-center mt-8 mb-4 relative transition-transform hover:scale-[1.02] duration-300">
          <div className="w-full h-full flex items-center justify-center opacity-100">
            <ReactQRCode
              value={familyData.id || "QRCode"}
              size={256}
              dataModulesSettings={{ style: "rounded" }}
              finderPatternInnerSettings={{ style: "rounded" }}
              finderPatternOuterSettings={{ style: "rounded" }}
            />
          </div>
        </div>
        <p className="text-[9px] text-current opacity-50 uppercase tracking-[0.25em] text-center mb-8 max-w-[40ch]">
          Escanea en la entrada del evento para agilizar tu acceso.
        </p>
        <div className="w-full flex justify-center mb-6">
          <FlowersCoverDown className="w-[85%] h-auto text-current opacity-30" />
        </div>
        <div className="w-full border-t border-dashed border-stone-300/60 pt-4 flex flex-col items-center">
          <p className="text-[9px] text-current opacity-50 uppercase tracking-[0.2em] text-center mb-1">
            {invitationData?.recepcion?.nombreSalon || "Recepción"} •{" "}
            {dateObj.getFullYear()}
          </p>
          <p className="text-[8px] text-stone-400 uppercase tracking-[0.2em] text-center opacity-70">
            Generado por JN Invitaciones
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[linear-gradient(to_right,#EBE5DA_2px,transparent_2px)] bg-[size:6px_100%] opacity-60" />
    </>
  );
};

/* ───── XV ticket body (dark / diamantes) ───── */
const XvTicketBody: FC<{
  familyData: StateCardProps["familyData"];
  invitationData: Invitation | null | undefined;
  formattedDate: string;
  dateObj: Date;
  confirmados: number;
}> = ({ familyData, invitationData, formattedDate, dateObj, confirmados }) => {
  const venueName = invitationData?.recepcion?.nombreSalon || "Recepción";
  const year = dateObj.getFullYear();
  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex flex-col items-center mb-5">
        <div className="flex items-center gap-2 mb-2 px-4 py-1 rounded-full bg-xv-accent-soft/15 border border-xv-accent-soft/30">
          <span className="text-xv-accent-soft text-[10px]">✦</span>
          <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold">
            Pase de Acceso
          </span>
          <span className="text-xv-accent-soft text-[10px]">✦</span>
        </div>
        <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft/90 font-medium mt-2">
          {invitationData?.nombre ? `XV · ${invitationData.nombre}` : "Mis XV Años"}
        </p>
        <p className="font-montserrat text-[9px] tracking-[0.25em] uppercase text-xv-accent-soft/80 mt-0.5">
          {formattedDate}
        </p>
      </div>

      {/* Separador con diamantes */}
      <div className="flex items-center justify-center gap-3 my-4">
        <span className="text-xv-accent-soft text-xs">✦</span>
        <span className="h-px flex-1 bg-xv-accent-soft/30" />
        <span className="text-xv-accent-soft text-xs">✦</span>
        <span className="h-px flex-1 bg-xv-accent-soft/30" />
        <span className="text-xv-accent-soft text-xs">✦</span>
      </div>

      {/* Invitado */}
      <div className="flex flex-col items-center text-center">
        <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft/70 font-semibold mb-2">
          Invitado
        </span>
        <p className="font-cormorant text-3xl text-xv-accent-soft italic mb-2">
          {familyData.nombre}
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-xv-accent-soft/15 border border-xv-accent-soft/30 text-xv-accent-soft font-montserrat text-[10px] tracking-[0.2em] uppercase font-semibold">
          {confirmados} {confirmados === 1 ? "Pase" : "Pases"} confirmado
          {confirmados === 1 ? "" : "s"}
        </span>
      </div>

      {/* QR */}
      <div className="my-6 mx-auto w-44 h-44 bg-white rounded-2xl shadow-md flex items-center justify-center border border-xv-accent-soft/20">
        <ReactQRCode
          value={familyData.id || "QRCode"}
          size={256}
          dataModulesSettings={{ style: "rounded" }}
          finderPatternInnerSettings={{ style: "rounded" }}
          finderPatternOuterSettings={{ style: "rounded" }}
        />
      </div>

      <p className="font-montserrat text-[9px] tracking-[0.25em] uppercase text-xv-accent-soft/70 text-center max-w-[40ch] mx-auto">
        Escanea en la entrada del evento para agilizar tu acceso.
      </p>

      {/* Footer con venue + línea punteada */}
      <div className="mt-6 pt-6 border-t border-dashed border-xv-accent-soft/30 flex flex-col items-center gap-2">
        <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft/80 text-center">
          {venueName} · {year}
        </p>
      </div>
    </div>
  );
};

/* ============================================================================
 * DeclineCard
 * ========================================================================== */
const DeclineCard: FC<StateCardProps> = ({
  familyData,
  textClassName,
  variant,
  outerRef,
}) => {
  const isWedding = variant === "wedding";
  return (
    <motion.div
      ref={outerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-[400px] mx-auto rounded-xl shadow-xl relative overflow-hidden p-10 flex flex-col items-center text-center",
        isWedding
          ? "bg-white border border-stone-200"
          : "bg-xv-bg-deepest border border-xv-accent-soft/30 p-8",
        !isWedding && "p-8",
        textClassName,
      )}
    >
      {isWedding ? (
        <>
          <p
            className={cn(
              "text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-4 opacity-60",
              textClassName,
            )}
          >
            Lamentamos tu ausencia
          </p>
          <p
            className={cn(
              "text-3xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.05)] font-newIconScript text-charcoal text-center mb-4",
              textClassName,
            )}
          >
            {familyData.nombre}
          </p>
          <div className="w-16 h-px bg-stone-300 mb-6" />
          <p className="text-stone-500 text-sm leading-relaxed mb-8 italic">
            &quot;Tal vez no puedan acompañarnos físicamente, pero los
            llevaremos en el alma de nuestra fiesta y en nuestros
            corazones.&quot;
          </p>
          <p className="font-newIconScript text-2xl text-stone-500 drop-shadow-sm mt-2">
            ¡Nos vemos pronto!
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 text-xv-accent-soft">
            <span className="h-px w-12 bg-xv-accent-soft/40" />
            <XCircle size={20} strokeWidth={1.5} />
            <span className="h-px w-12 bg-xv-accent-soft/40" />
          </div>
          <p className="font-cormorant italic text-2xl text-xv-accent-soft/90 mb-4">
            Lamentamos tu ausencia
          </p>
          <p className="font-cormorant text-3xl text-white italic mb-3">
            {familyData.nombre}
          </p>
          <div className="h-px w-16 bg-xv-accent-soft/30 mx-auto my-4" />
          <p className="font-cormorant italic text-base text-xv-accent-soft/70 leading-relaxed">
            “Tal vez no puedan acompañarnos físicamente, pero los llevaremos en
            el alma de nuestra fiesta y en nuestros corazones.”
          </p>
          <p className="font-cormorant text-2xl text-xv-accent-soft mt-4 italic">
            ¡Nos vemos pronto!
          </p>
        </>
      )}
    </motion.div>
  );
};

/* ============================================================================
 * ClosedCard
 * ========================================================================== */
const ClosedCard: FC<StateCardProps> = ({ textClassName, variant, outerRef }) => {
  const isWedding = variant === "wedding";
  return (
    <motion.div
      ref={outerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-[400px] mx-auto rounded-xl shadow-xl relative overflow-hidden p-10 flex flex-col items-center text-center",
        isWedding
          ? "bg-white border border-stone-200"
          : "bg-xv-bg-deepest border border-xv-accent-soft/30 p-8",
        !isWedding && "p-8",
      )}
    >
      {isWedding ? (
        <p className={cn("text-lg font-medium text-stone-600", textClassName)}>
          El registro de asistencia ha sido cerrado.
        </p>
      ) : (
        <p className="font-cormorant text-xl text-xv-accent-soft/90 italic">
          El registro de asistencia ha sido cerrado.
        </p>
      )}
    </motion.div>
  );
};

/* ============================================================================
 * COMPONENTE PRINCIPAL
 * ========================================================================== */

const Assistants: FC<Props> = ({
  variant = "wedding",
  containerClassName = "",
  textClassName = "",
  svgsColor,
  sendFormBtnClassName = "",
}) => {
  const isWedding = variant === "wedding";
  // Web RSVP es SIEMPRE público (visitantes sin auth). El flag `isPublic`
  // de `useFamilyRSVP` ahora defaulta a `true` y se omite aquí para
  // forzar el comportamiento correcto: la rama admin de `saveFamily` (que
  // escribe campos no permitidos por las security rules de Firestore) debe
  // quedar reservada al admin UI, no al form público de XV/bodas.
  const rsvp = useFamilyRSVP();
  const {
    familyData,
    isFormSubmitted,
    isDisabled,
    isFormLocked,
    formattedDeadline,
    handleSubmit,
    handleModify,
    invitationData,
  } = rsvp;

  const formikRef = useRef<FormikProps<FamilyFormData>>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  /** Ref al card post-submit (TicketCard / DeclineCard / ClosedCard).
   *  El scroll suave apunta ACÁ, no al inicio de la sección — así el
   *  usuario ve el pase / decline card desde el top del viewport. */
  const postSubmitCardRef = useRef<HTMLDivElement>(null);
  const { setFamily } = useFamilyContext();

  /**
   * Al confirmar/declinar el RSVP, hacemos un scroll suave al inicio
   * del CARD post-submit (pase de acceso / decline / closed) para que
   * el usuario lo vea DESDE ARRIBA, no desde donde estaba el botón
   * de submit. Se dispara en cada transición a `isFormSubmitted ===
   * true` (incluye el caso de re-submit tras "Modificar").
   *
   * Usa `requestAnimationFrame` para esperar al siguiente frame después
   * del re-render — así el nuevo card ya está en el DOM antes de
   * calcular la posición del scroll.
   */
  const wasSubmittedRef = useRef(false);
  useEffect(() => {
    if (!isFormSubmitted || wasSubmittedRef.current) return;
    wasSubmittedRef.current = true;
    requestAnimationFrame(() => {
      postSubmitCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [isFormSubmitted]);

  /** Si el usuario hace "Modificar mi respuesta", reseteamos el flag
   *  para que el próximo submit vuelva a hacer scroll. */
  useEffect(() => {
    if (!isFormSubmitted) wasSubmittedRef.current = false;
  }, [isFormSubmitted]);

  if (!familyData) {
    return (
      <div
        className={cn(
          "w-full h-24 flex justify-center items-center",
          isWedding ? "bg-accent" : "bg-xv-bg-deepest",
          containerClassName,
        )}
      >
        <p
          className={cn(
            isWedding
              ? "font-newIconScript text-primary"
              : "font-cormorant italic text-xv-accent-soft",
            textClassName,
          )}
        >
          Cargando información...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <hr
        className={cn(
          "w-full",
          isWedding
            ? "border-[color-mix(in_srgb,currentColor_20%,transparent)]"
            : "border-xv-accent-soft/15",
        )}
      />
      <div
        className={cn(
          "flex flex-col items-center justify-center py-20",
          isWedding ? "bg-accent text-primary" : "bg-xv-bg-deepest",
          containerClassName,
        )}
      >
        {/* ─── HEADER ──────────────────────────────────────────── */}
        {isWedding ? (
          <WeddingHeader
            textClassName={textClassName}
            svgsColor={svgsColor}
            familyData={familyData}
            formattedDeadline={formattedDeadline}
            isFormLocked={isFormLocked}
            isFormSubmitted={isFormSubmitted}
          />
        ) : (
          <XvHeader
            familyData={familyData}
            formattedDeadline={formattedDeadline}
            isFormLocked={isFormLocked}
          />
        )}

        <AnimatedEntrance classname="w-full">
          <div className="flex flex-col items-center justify-center px-5 w-full">
            {isFormLocked ? (
              familyData.asistencia === true ? (
                <TicketCard
                  familyData={familyData}
                  invitationData={invitationData}
                  variant={variant}
                  outerRef={
                    postSubmitCardRef as unknown as React.RefObject<HTMLDivElement>
                  }
                />
              ) : familyData.asistencia === false ? (
                <DeclineCard
                  familyData={familyData}
                  variant={variant}
                  outerRef={
                    postSubmitCardRef as unknown as React.RefObject<HTMLDivElement>
                  }
                />
              ) : (
                <ClosedCard
                  familyData={familyData}
                  variant={variant}
                  outerRef={
                    postSubmitCardRef as unknown as React.RefObject<HTMLDivElement>
                  }
                />
              )
            ) : !isFormSubmitted ? (
              <div
                className={cn(
                  "w-full max-w-[400px] relative z-0",
                  textClassName,
                )}
                ref={formContainerRef}
              >
                <div
                  className={cn(
                    "rounded-xl shadow-xl px-6 py-12 pt-9 relative z-0",
                    isWedding
                      ? "bg-white border border-[color-mix(in_srgb,currentColor_10%,transparent)]"
                      : "bg-xv-bg-mid/40 border border-xv-accent-soft/25",
                  )}
                >
                  <AnimatePresence>
                    <div className="flex items-center justify-center gap-3 mb-6 opacity-60 w-full">
                      <div
                        className={cn(
                          "w-12 h-px",
                          isWedding
                            ? "bg-[color-mix(in_srgb,currentColor_30%,transparent)]"
                            : "bg-xv-accent-soft/30",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-[0.4em]",
                          isWedding
                            ? "text-current/60"
                            : "text-xv-accent-soft/60",
                        )}
                      >
                        {isWedding ? "Pase de" : "· Pase de ·"}
                      </span>
                      <div
                        className={cn(
                          "w-12 h-px",
                          isWedding
                            ? "bg-[color-mix(in_srgb,currentColor_30%,transparent)]"
                            : "bg-xv-accent-soft/30",
                        )}
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex flex-col items-center",
                        textClassName,
                      )}
                      key="assistance-form"
                    >
                      <p
                        className={cn(
                          "text-4xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)] text-center mb-4 leading-none",
                          isWedding
                            ? "font-newIconScript"
                            : "font-cormorant italic text-white",
                          textClassName,
                        )}
                      >
                        {familyData.nombre}
                      </p>

                      {familyData.notaAnfitrion && (
                        <p
                          className={cn(
                            "px-4 text-center text-sm italic opacity-70 mb-8 leading-relaxed",
                            isWedding
                              ? "font-serif"
                              : "text-white/85 font-serif",
                          )}
                        >
                          &quot;{familyData.notaAnfitrion}&quot;
                        </p>
                      )}

                      {familyData.ninosPermitidos === false && (
                        <NoKidsBox variant={variant} />
                      )}

                      <Formik
                        innerRef={formikRef}
                        validationSchema={assistanceSchema(
                          Number(familyData.invitados),
                        )}
                        initialValues={{ ...familyData, telefono: null }}
                        onSubmit={handleSubmit}
                        enableReinitialize
                      >
                        {({ values, handleSubmit, setFieldValue }) => {
                          const hasSelectedOption =
                            values.asistencia !== null &&
                            values.asistencia !== undefined;
                          const isAttending = values.asistencia === true;
                          const confirmados = values.confirmados || 0;

                          return (
                            <form
                              onSubmit={handleSubmit}
                              className="w-full flex flex-col items-center"
                            >
                              <p
                                className={cn(
                                  "text-[11px] font-nourdMedium uppercase tracking-[0.2em] mb-5 text-center",
                                  isWedding
                                    ? "opacity-80"
                                    : "text-xv-accent-soft font-semibold",
                                )}
                              >
                                ¿Confirmas tu asistencia?
                              </p>

                              <YesNoButtons
                                variant={variant}
                                values={values}
                                setFieldValue={setFieldValue}
                                familyData={familyData}
                              />

                              <AnimatePresence>
                                {hasSelectedOption && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeInOut",
                                    }}
                                    className="w-full overflow-hidden"
                                  >
                                    <div className="w-full flex flex-col items-center transform-gpu">
                                      <AnimatePresence initial={false}>
                                        {isAttending && (
                                          <PasesStepper
                                            variant={variant}
                                            confirmados={confirmados}
                                            setFieldValue={setFieldValue}
                                            familyData={familyData}
                                          />
                                        )}
                                      </AnimatePresence>

                                      <MessageTextarea
                                        variant={variant}
                                        values={values}
                                        setFieldValue={setFieldValue}
                                      />

                                      <SubmitButton
                                        variant={variant}
                                        isDisabled={isDisabled}
                                        sendFormBtnClassName={
                                          sendFormBtnClassName
                                        }
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </form>
                          );
                        }}
                      </Formik>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : familyData.asistencia === true ? (
              <TicketCard
                familyData={familyData}
                invitationData={invitationData}
                variant={variant}
                textClassName={textClassName}
                outerRef={
                  postSubmitCardRef as unknown as React.RefObject<HTMLDivElement>
                }
              />
            ) : (
              <DeclineCard
                familyData={familyData}
                variant={variant}
                textClassName={textClassName}
                outerRef={
                  postSubmitCardRef as unknown as React.RefObject<HTMLDivElement>
                }
              />
            )}

            {/* Modify button + deadline */}
            <ModifyAndDeadline
              variant={variant}
              isFormLocked={isFormLocked}
              isFormSubmitted={isFormSubmitted}
              familyData={familyData}
              formattedDeadline={formattedDeadline}
              onModify={() => {
                handleModify();
                setTimeout(() => {
                  formContainerRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 100);
              }}
              textClassName={textClassName}
            />
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

/* ============================================================================
 * Sub-componentes del header
 * ========================================================================== */

const WeddingHeader: FC<{
  textClassName: string;
  svgsColor?: string;
  familyData: Family;
  formattedDeadline: string;
  isFormLocked: boolean;
  isFormSubmitted: boolean;
}> = ({
  textClassName,
  svgsColor,
  familyData,
  formattedDeadline,
  isFormLocked,
  isFormSubmitted,
}) => (
  <AnimatedEntrance>
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 pb-8",
        textClassName,
      )}
    >
      <Separator className="mx-10" color={svgsColor} />
      <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript px-5 text-center">
        Confirmación de asistencia
      </p>
      {!isFormLocked && !isFormSubmitted && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-nourdLight text-sm text-center px-10 max-w-sm opacity-80">
            Tu lugar te espera. Por favor, confirma tu asistencia a
            continuación.
          </p>
          {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
            <DeadlinePill
              variant="wedding"
              formattedDeadline={formattedDeadline}
            />
          )}
        </div>
      )}
    </div>
  </AnimatedEntrance>
);

const XvHeader: FC<{
  familyData: Family;
  formattedDeadline: string;
  isFormLocked: boolean;
}> = ({ familyData, formattedDeadline, isFormLocked }) => (
  <div className="flex flex-col items-center text-center mb-6 max-w-md">
    {!isFormLocked && (
      <>
        {/* Icono de sobre */}
        <div className="w-10 h-10 rounded-full bg-xv-bg-mid border border-xv-accent-soft/30 flex items-center justify-center mb-3 text-xv-accent-soft">
          <Mail className="w-5 h-5" />
        </div>
        <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-bold mb-2">
          R. S. V. P.
        </span>
        <h2 className="font-cormorant text-4xl text-white italic mb-3">
          Confirma tu Asistencia
        </h2>
        <p className="font-cormorant italic text-base text-xv-accent-soft/85 leading-relaxed mb-3">
          Bajo la bóveda celeste, cada persona presente iluminará mi historia.
          Tu compañía es mi más preciado regalo.
        </p>
        {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
          <DeadlinePill variant="xv" formattedDeadline={formattedDeadline} />
        )}
      </>
    )}
  </div>
);

const DeadlinePill: FC<{
  variant: AssistantsVariant;
  formattedDeadline: string;
}> = ({ variant, formattedDeadline }) => {
  const text = formattedDeadline.replace(" a las ", " — ");
  if (variant === "wedding") {
    return (
      <div className="flex items-center gap-1.5 mx-6 px-4 py-1.5 bg-[color-mix(in_srgb,currentColor_3%,transparent)] border border-[color-mix(in_srgb,currentColor_15%,transparent)] rounded-full mt-2">
        <Clock size={12} className="opacity-60 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-center opacity-70">
          Tienes hasta el {formattedDeadline} para confirmar
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-xv-bg-mid border border-xv-accent-soft/30 text-xv-accent-soft font-montserrat text-[10px] tracking-[0.2em] uppercase font-semibold">
      Favor de confirmar antes del {text}
    </div>
  );
};

/* ============================================================================
 * Sub-componentes del form
 * ========================================================================== */

const NoKidsBox: FC<{ variant: AssistantsVariant }> = ({ variant }) => {
  if (variant === "wedding") {
    return (
      <div className="w-full flex justify-center mb-8 px-0.5">
        <div className="bg-[color-mix(in_srgb,currentColor_3%,transparent)] border border-[color-mix(in_srgb,currentColor_15%,transparent)] px-5 py-4 rounded-xl flex flex-col items-center text-center w-full">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5 opacity-60">
            Evento Solo Adultos
          </span>
          <span className="text-[12px] font-serif italic leading-relaxed opacity-80">
            &quot;Agradecemos de corazón tu comprensión al respetar nuestro
            deseo de tener una boda solo para adultos.&quot;
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full mb-6 px-0.5">
      <div className="bg-xv-bg-mid/60 border border-xv-accent-soft/30 px-5 py-4 rounded-xl text-center">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5 opacity-60 text-xv-accent-soft block">
          Evento Solo Adultos
        </span>
        <span className="text-[12px] font-serif italic leading-relaxed opacity-85 text-xv-accent-soft">
          “Te agradezco de corazón tu comprensión al respetar mi deseo de
          tener un evento sin niños.”
        </span>
      </div>
    </div>
  );
};

const YesNoButtons: FC<{
  variant: AssistantsVariant;
  values: FamilyFormData;
  setFieldValue: (field: string, value: unknown) => void;
  familyData: Family;
}> = ({ variant, values, setFieldValue, familyData }) => {
  const isWedding = variant === "wedding";
  if (isWedding) {
    return (
      <div className="flex gap-4 w-full px-2 mb-8">
        <button
          type="button"
          onClick={() => {
            setFieldValue("asistencia", true);
            if (!values.confirmados)
              setFieldValue("confirmados", Number(familyData.invitados));
          }}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl transition-all duration-300 font-nourdMedium text-[10px] tracking-widest uppercase border",
            values.asistencia === true
              ? "bg-[color-mix(in_srgb,currentColor_5%,transparent)] border-current shadow-sm scale-[1.02]"
              : "bg-transparent border-[color-mix(in_srgb,currentColor_20%,transparent)] opacity-60 hover:opacity-100",
          )}
        >
          <CheckCircle2 size={16} strokeWidth={1.5} />
          Si, asistiré
        </button>
        <button
          type="button"
          onClick={() => {
            setFieldValue("asistencia", false);
            setFieldValue("confirmados", 0);
          }}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl transition-all duration-300 font-nourdMedium text-[10px] tracking-widest uppercase border",
            values.asistencia === false
              ? "bg-[color-mix(in_srgb,currentColor_5%,transparent)] border-current shadow-sm scale-[1.02]"
              : "bg-transparent border-[color-mix(in_srgb,currentColor_20%,transparent)] opacity-60 hover:opacity-100",
          )}
        >
          <XCircle size={16} strokeWidth={1.5} />
          No podré ir
        </button>
      </div>
    );
  }
  return (
    <div className="flex gap-3 w-full mb-5">
      <button
        type="button"
        onClick={() => {
          setFieldValue("asistencia", true);
          if (!values.confirmados)
            setFieldValue("confirmados", Number(familyData.invitados));
        }}
        className={cn(
          "flex-1 flex items-center justify-center gap-1 py-3 rounded-full font-montserrat text-[10px] font-semibold tracking-[0.2em] uppercase transition-all border",
          values.asistencia === true
            ? "bg-xv-accent-primary text-xv-accent-dark border-xv-accent-primary shadow-md"
            : "bg-transparent text-xv-accent-soft/70 border border-xv-accent-soft/30 hover:text-xv-accent-soft",
        )}
      >
        <CheckCircle2 size={14} strokeWidth={2} />
        Sí, asistiré
      </button>
      <button
        type="button"
        onClick={() => {
          setFieldValue("asistencia", false);
          setFieldValue("confirmados", 0);
        }}
        className={cn(
          "flex-1 flex items-center justify-center gap-1 py-3 rounded-full font-montserrat text-[10px] font-semibold tracking-[0.2em] uppercase transition-all border",
          values.asistencia === false
            ? "bg-xv-accent-primary text-xv-accent-dark border-xv-accent-primary shadow-md"
            : "bg-transparent text-xv-accent-soft/70 border border-xv-accent-soft/30 hover:text-xv-accent-soft",
        )}
      >
        <XCircle size={14} strokeWidth={2} />
        No podré ir
      </button>
    </div>
  );
};

const PasesStepper: FC<{
  variant: AssistantsVariant;
  confirmados: number;
  setFieldValue: (field: string, value: unknown) => void;
  familyData: Family;
}> = ({ variant, confirmados, setFieldValue, familyData }) => {
  const isWedding = variant === "wedding";
  if (isWedding) {
    return (
      <motion.div
        key="confirmados-stepper"
        initial={{ gridTemplateRows: "0fr", opacity: 0 }}
        animate={{ gridTemplateRows: "1fr", opacity: 1 }}
        exit={{ gridTemplateRows: "0fr", opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ display: "grid" }}
      >
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div className="w-full flex flex-col items-center mb-10">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-6 text-center mt-2">
              Número de pases
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <button
                type="button"
                onClick={() => {
                  if (confirmados > 1)
                    setFieldValue("confirmados", confirmados - 1);
                }}
                disabled={confirmados <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[color-mix(in_srgb,currentColor_30%,transparent)] opacity-70 disabled:opacity-20 transition-all active:scale-95 hover:opacity-100 hover:border-current"
              >
                <Minus size={18} strokeWidth={2} />
              </button>
              <div className="flex flex-col items-center justify-center min-w-[4rem]">
                <span className="font-serif text-5xl font-bold leading-none">
                  {confirmados}
                </span>
                <span className="text-[9px] opacity-60 font-bold uppercase tracking-[0.2em] mt-2">
                  Pase(s)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirmados < Number(familyData.invitados))
                    setFieldValue("confirmados", confirmados + 1);
                }}
                disabled={confirmados >= Number(familyData.invitados)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[color-mix(in_srgb,currentColor_30%,transparent)] opacity-70 disabled:opacity-20 transition-all active:scale-95 hover:opacity-100 hover:border-current"
              >
                <Plus size={18} strokeWidth={2} />
              </button>
            </div>
            {familyData.invitados > 1 && (
              <p className="text-[10px] opacity-60 mt-5 font-medium italic">
                Límite asignado: {familyData.invitados} pases
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full mb-5">
        <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft/70 text-center font-bold">
          Número de pases
        </p>
        <div className="flex items-center justify-center gap-6 mt-2">
          <button
            type="button"
            onClick={() => {
              if (confirmados > 1)
                setFieldValue("confirmados", confirmados - 1);
            }}
            disabled={confirmados <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-xv-accent-soft/30 text-xv-accent-soft/70 disabled:opacity-20 transition-all active:scale-95 hover:text-xv-accent-soft hover:border-xv-accent-soft"
          >
            <span className="text-lg">−</span>
          </button>
          <div className="flex flex-col items-center justify-center min-w-[4rem]">
            <span className="font-cormorant text-5xl font-bold text-xv-accent-soft leading-none">
              {confirmados}
            </span>
            <span className="font-montserrat text-[9px] tracking-[0.2em] uppercase text-xv-accent-soft/70 mt-1 font-bold">
              Pase(s)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmados < Number(familyData.invitados))
                setFieldValue("confirmados", confirmados + 1);
            }}
            disabled={confirmados >= Number(familyData.invitados)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-xv-accent-soft/30 text-xv-accent-soft/70 disabled:opacity-20 transition-all active:scale-95 hover:text-xv-accent-soft hover:border-xv-accent-soft"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
        {familyData.invitados > 1 && (
          <p className="font-montserrat text-[10px] text-xv-accent-soft/60 mt-2 italic text-center">
            Límite asignado: {familyData.invitados} pases
          </p>
        )}
      </div>
    </motion.div>
  );
};

const MessageTextarea: FC<{
  variant: AssistantsVariant;
  values: FamilyFormData;
  setFieldValue: (field: string, value: unknown) => void;
}> = ({ variant, values, setFieldValue }) => {
  const isWedding = variant === "wedding";
  return (
    <div
      className={cn(
        "w-full mb-10 text-left",
        isWedding ? "mb-10 mt-2" : "mb-5",
      )}
    >
      <label
        className={cn(
          "block text-[10px] font-bold opacity-60 uppercase tracking-[0.15em] mb-3",
          !isWedding && "text-xv-accent-soft/70 opacity-100 font-bold",
        )}
      >
        Envía una felicitación
        <span className="font-normal italic tracking-normal opacity-70">
          (opcional)
        </span>
      </label>
      <textarea
        name="notaInvitado"
        value={values.notaInvitado || ""}
        onChange={(e) => setFieldValue("notaInvitado", e.target.value)}
        className={cn(
          "w-full bg-transparent border-b py-2 text-sm placeholder:opacity-40 focus:border-current outline-none resize-none transition-colors placeholder:text-current",
          isWedding
            ? "border-[color-mix(in_srgb,currentColor_30%,transparent)]"
            : "border-xv-accent-soft/30 text-white placeholder:text-white/40 focus:border-xv-accent-soft font-montserrat",
        )}
        rows={1}
        style={{ fieldSizing: "content" }}
        placeholder="Escribe aquí tu mensaje..."
      />
    </div>
  );
};

const SubmitButton: FC<{
  variant: AssistantsVariant;
  isDisabled: boolean;
  sendFormBtnClassName: string;
}> = ({ variant, isDisabled, sendFormBtnClassName }) => {
  const isWedding = variant === "wedding";
  if (isWedding) {
    return (
      <button
        type="submit"
        disabled={isDisabled}
        className={cn(
          "flex items-center gap-2 text-xs font-nourdMedium uppercase tracking-[0.2em] border-b border-current pb-1 mt-2 hover:opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed",
          sendFormBtnClassName,
        )}
      >
        Enviar Respuesta
        <ArrowRight
          size={14}
          className="opacity-70 group-hover:translate-x-1 transition-transform"
        />
      </button>
    );
  }
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark font-montserrat text-[11px] font-bold uppercase tracking-[0.25em] py-4 rounded-full inline-flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
    >
      Enviar respuesta
      <ArrowRight size={14} strokeWidth={2.5} />
    </button>
  );
};

const ModifyAndDeadline: FC<{
  variant: AssistantsVariant;
  isFormLocked: boolean;
  isFormSubmitted: boolean;
  familyData: Family;
  formattedDeadline: string;
  onModify: () => void;
  textClassName: string;
}> = ({
  variant,
  isFormLocked,
  isFormSubmitted,
  familyData,
  formattedDeadline,
  onModify,
  textClassName,
}) => {
  // Guard común: sólo se muestra el bloque cuando el form se submiteó
  // con una respuesta y NO está bloqueado por cambiosPermitidos / fecha.
  if (isFormLocked || !isFormSubmitted || familyData.asistencia === null) {
    return null;
  }

  // XV: motion.button simple + deadline como <p> inferior.
  if (variant === "xv") {
    return (
      <>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onModify}
          className="mt-6 font-montserrat text-xs font-medium text-xv-accent-soft/70 uppercase tracking-[0.2em] border-b border-xv-accent-soft/40 hover:text-xv-accent-soft transition-all pb-0.5"
        >
          Modificar respuesta
        </motion.button>
        {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
          <p className="mt-3 font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft/60 text-center">
            Puedes ajustar hasta el {formattedDeadline}
          </p>
        )}
      </>
    );
  }

  // Boda (default): motion.div con botón bordered + pill del deadline.
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn("mt-12 flex flex-col items-center gap-6", textClassName)}
    >
      <button
        onClick={onModify}
        className="font-medium text-xs uppercase tracking-widest border-b border-[color-mix(in_srgb,currentColor_60%,transparent)] hover:border-current hover:opacity-100 transition-all pb-0.5 opacity-60 text-current"
      >
        Modificar mi respuesta
      </button>
      {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
        <div className="flex items-center gap-1.5 mx-6 px-3 py-1.5 bg-[color-mix(in_srgb,currentColor_3%,transparent)] border border-[color-mix(in_srgb,currentColor_15%,transparent)] rounded-full">
          <Clock size={12} className="opacity-60 shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-center opacity-70">
            Puedes ajustar hasta el {formattedDeadline}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default Assistants;
