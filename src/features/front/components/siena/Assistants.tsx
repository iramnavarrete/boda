import assistanceSchema from "@/validation/yupSchema";
import { Formik, FormikProps } from "formik";
import { FC, useRef, useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Separator from "@/icons/separator";
import { useSearchParams } from "next/navigation";
import AnimatedEntrance from "../AnimatedEntrance";
import { Family, FamilyFormData, Invitation } from "@/types";
import { Plus, Minus, ArrowRight, Clock } from "lucide-react";
import { FamiliesService } from "@/services/familiesService";
import { useInvitationStore } from "../../stores/invitationStore";
import { FamilyQuotesService } from "@/services/familyQuotesService";
import { ActivityService } from "@/services/activityService";
import { useToast } from "@/features/shared/components/Toast";
import { cn } from "@heroui/theme";
import html2canvas from "html2canvas";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import { ReactQRCode } from "@lglab/react-qr-code";
import { useFamilyContext } from "../FamilyContext";

const defaultFamily: Family = {
  asistencia: null,
  confirmados: 1,
  id: "_",
  notaInvitado: "",
  nombre: "Invitado genérico",
  invitados: 1,
  cambiosPermitidos: true,
  fechaCreacion: null,
  notaAnfitrion: "",
  tieneTelefono: false,
  ultimaModificacion: null,
  ninosPermitidos: null,
};

const isDefaultId = (id?: string) => id === "_";

type Props = {
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
  familyData: Family;
  invitationData?: Invitation | null;
  textClassName?: string;
  svgsColor?: string;
}

const TicketCard: FC<StateCardProps> = ({
  familyData,
  invitationData,
  textClassName,
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

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `Pase-${familyData.nombre.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();

      toast("¡Pase descargado con éxito!", "success");
    } catch (err) {
      console.error("Error al generar la imagen", err);
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
  }).format(dateObj);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-6"
    >
      <div
        ref={ticketRef}
        className="w-full bg-[#FDFBF7] rounded-xl shadow-2xl relative overflow-hidden border border-[#EBE5DA]"
      >
        <div className="w-full flex justify-center mt-6"></div>
        <div className="pt-4 pb-5 px-8 flex flex-col items-center">
          <p className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.3em] mb-4 border border-stone-200 px-5 py-1.5 rounded-full bg-white shadow-sm">
            ✦ Pase de Acceso ✦
          </p>
          <p
            className={cn(
              "font-serif text-3xl text-charcoal text-center leading-tight mb-2",
              textClassName,
            )}
          >
            {invitationData?.nombre || "Nuestra Boda"}
          </p>
          <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] text-center">
            {formattedDate.replace(/,/g, " •")}
          </p>
        </div>

        <div className="relative h-8 flex items-center justify-center">
          <div className="absolute -left-4 w-8 h-8 bg-accent rounded-full shadow-inner border-r border-[#EBE5DA]" />
          <div className="w-full border-t border-dashed border-stone-300 mx-6 opacity-60" />
          <div className="absolute -right-4 w-8 h-8 bg-accent rounded-full shadow-inner border-l border-[#EBE5DA]" />
        </div>

        <div className="pt-6 pb-6 px-8 flex flex-col items-center">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-3">
            Invitado
          </p>
          <p
            className={cn(
              "text-3xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.05)] font-newIconScript text-charcoal text-center mb-4",
              textClassName,
            )}
          >
            {familyData.nombre}
          </p>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
            {confirmados} Pase{confirmados > 1 ? "s" : ""} Confirmado
            {confirmados > 1 ? "s" : ""}
          </p>

          <div className="mx-auto w-36 h-36 bg-white rounded-xl shadow-sm border border-stone-200 flex items-center justify-center mt-8 mb-4 relative transition-transform hover:scale-[1.02] duration-300">
            <div className="w-full h-full flex items-center justify-center">
              <ReactQRCode
                value={familyData.id || "QRCode"}
                size={256}
                dataModulesSettings={{ style: "rounded" }}
                finderPatternInnerSettings={{ style: "rounded" }}
                finderPatternOuterSettings={{ style: "rounded" }}
              />
            </div>
          </div>
          <p className="text-[9px] text-stone-400 uppercase tracking-[0.25em] text-center mb-8 max-w-[40ch]">
            Escanea en la entrada del evento para agilizar tu acceso.
          </p>
          <div className="w-full flex justify-center mb-6">
            <FlowersCoverDown className="w-[85%] h-auto text-stone-300 opacity-80" />
          </div>
          <div className="w-full border-t border-dashed border-stone-300/60 pt-4 flex flex-col items-center">
            <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] text-center mb-1">
              {invitationData?.recepcion?.nombreSalon || "Recepción"} •{" "}
              {dateObj.getFullYear()}
            </p>
            <p className="text-[8px] text-stone-400 uppercase tracking-[0.2em] text-center opacity-70">
              Generado por JN Invitaciones
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[linear-gradient(to_right,#EBE5DA_2px,transparent_2px)] bg-[size:6px_100%] opacity-60" />
      </div>

      <div className="w-full space-y-3 pt-2">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 flex items-center justify-center gap-3 hover:bg-black transition-all shadow-md active:scale-95 border border-[#1A1A1A] disabled:opacity-50"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
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

const DeclineCard: FC<StateCardProps> = ({ familyData, textClassName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto bg-white rounded-xl shadow-xl relative overflow-hidden border border-stone-200 p-10 flex flex-col items-center text-center"
    >
      <p
        className={cn(
          "text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-4",
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
        &quot;Tal vez no puedan acompañarnos físicamente, pero los llevaremos en
        el alma de nuestra fiesta y en nuestros corazones.&quot;
      </p>
      <p className="font-newIconScript text-2xl text-stone-500 drop-shadow-sm mt-2">
        ¡Nos vemos pronto!
      </p>
    </motion.div>
  );
};

const ClosedCard: FC<StateCardProps> = ({ textClassName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto bg-white rounded-xl shadow-xl relative overflow-hidden border border-stone-200 p-10 flex flex-col items-center text-center"
    >
      <p className={cn("text-lg font-medium text-stone-600", textClassName)}>
        El registro de asistencia ha sido cerrado.
      </p>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Assistants: FC<Props> = ({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  sendFormBtnClassName = "",
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [familyData, setFamilyData] = useState<Family>(defaultFamily);

  const invitationData = useInvitationStore((state) => state.invitationData);
  const { family, isLoadingFamily, setFamily } = useFamilyContext();

  const formikRef = useRef<FormikProps<FamilyFormData>>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const id = searchParams?.get("family");

  const isExpiredLocal = () => {
    if (!familyData?.fechaLimiteConfirmacion) return false;
    const dateFormatted = new Date().toLocaleDateString("en-CA");
    return familyData.fechaLimiteConfirmacion < dateFormatted;
  };

  const isFormLocked =
    familyData.cambiosPermitidos === false || isExpiredLocal();

  const deadlineString = familyData?.fechaLimiteConfirmacion
    ? familyData.fechaLimiteConfirmacion.includes("T")
      ? familyData.fechaLimiteConfirmacion
      : `${familyData.fechaLimiteConfirmacion}T23:59:59`
    : undefined;

  const formattedDeadline = useMemo(() => {
    if (!deadlineString) return "";
    const d = new Date(deadlineString);
    const datePart = new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${datePart} a las ${timePart}`;
  }, [deadlineString]);

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!id || isDefaultId(id) || !invitationData) return;

      // Candado vital: Si ya cargamos a esta familia, NO la sobreescribas.
      // Esto evita que el panel colapse si el usuario está tipeando un mensaje y el contexto de Cover dice "ya te vi".
      if (familyData.id === id) return;

      if (family && family.id === id) {
        const { result, error } = await FamilyQuotesService.getFamilyQuote(
          invitationData.id,
          id,
        );
        const familyDataCopy = { ...family };

        if (!error && result !== null) {
          familyDataCopy.notaInvitado = result.mensaje;
        }

        setFamilyData(familyDataCopy);
        formikRef.current?.setValues({ ...familyDataCopy, telefono: null });

        if (familyDataCopy.asistencia !== null) {
          setIsFormSubmitted(true);
        }
      } else if (!isLoadingFamily) {
        setFamilyData(defaultFamily);
      }
    };

    fetchFamilyData();
  }, [id, invitationData, family, isLoadingFamily, familyData.id]);

  if (!familyData) {
    return (
      <div
        className={cn(
          "w-full h-24 bg-accent flex justify-center",
          containerClassName,
        )}
      >
        <p className={cn("text-primary font-newIconScript", textClassName)}>
          Cargando información...
        </p>
      </div>
    );
  }

  return (
    <div>
      <hr className="w-full border-sand/50" />
      <div
        className={cn(
          "bg-accent flex flex-col items-center justify-center py-20",
          containerClassName,
        )}
      >
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center gap-4 pb-8">
            <Separator className="mx-10" color={svgsColor} />
            <p
              className={cn(
                "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary px-5 text-center",
                textClassName,
              )}
            >
              Confirmación de asistencia
            </p>
            {!isFormLocked && !isFormSubmitted && (
              <div className="flex flex-col items-center gap-3">
                <p className="font-nourdLight text-sm text-center px-10 max-w-sm text-stone-600">
                  Tu lugar te espera. Por favor, confirma tu asistencia a
                  continuación.
                </p>
                {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
                  <div className="flex items-center gap-1.5 mx-6 px-4 py-1.5 bg-white/60 border border-[#EBE5DA] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <Clock size={12} className="text-[#C5A669] shrink-0" />
                    <span className="text-[10px] font-bold text-[#5A5A5A] uppercase tracking-widest text-center">
                      Tienes hasta el {formattedDeadline} para confirmar
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance classname="w-full">
          <div className="flex flex-col items-center justify-center px-5 w-full">
            {isFormLocked ? (
              familyData.asistencia === true ? (
                <TicketCard
                  familyData={familyData}
                  invitationData={invitationData}
                  textClassName={textClassName}
                />
              ) : familyData.asistencia === false ? (
                <DeclineCard
                  familyData={familyData}
                  textClassName={textClassName}
                />
              ) : (
                <ClosedCard
                  familyData={familyData}
                  textClassName={textClassName}
                />
              )
            ) : !isFormSubmitted ? (
              <div
                className="w-full max-w-[400px] relative z-0"
                ref={formContainerRef}
              >
                <div className="rounded-xl bg-white shadow-xl px-6 py-12 pt-9 relative z-0 border border-stone-200">
                  <AnimatePresence>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 text-center">
                      Invitación para:
                    </p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex flex-col items-center text-primary",
                        textClassName,
                      )}
                      key="assistance-form"
                    >
                      <p
                        className={cn(
                          "text-3xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.05)] font-newIconScript text-charcoal text-center mb-4",
                          textClassName,
                        )}
                      >
                        {familyData.nombre}
                      </p>
                      <div className="flex items-center justify-center gap-4 mb-6 opacity-60">
                        <div className="w-12 h-px bg-stone-400" />
                      </div>

                      {familyData.notaAnfitrion && (
                        <p className="px-4 text-center text-sm italic text-stone-500 mb-8 font-serif leading-relaxed">
                          &quot;{familyData.notaAnfitrion}&quot;
                        </p>
                      )}

                      {familyData.ninosPermitidos === false && (
                        <div className="w-full flex justify-center mb-8 px-2">
                          <div className="bg-[#FDFBF7] border border-[#EBE5DA] px-5 py-4 rounded-2xl flex flex-col items-center text-center shadow-sm w-full">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-1.5">
                              Evento Solo Adultos
                            </span>
                            <span className="text-[13px] text-stone-500 font-serif italic leading-relaxed">
                              &quot;Agradecemos de corazón tu comprensión al
                              respetar nuestro deseo de tener una boda solo para
                              adultos.&quot;
                            </span>
                          </div>
                        </div>
                      )}

                      <Formik
                        innerRef={formikRef}
                        validationSchema={assistanceSchema(
                          Number(familyData.invitados),
                        )}
                        initialValues={{ ...familyData, telefono: null }}
                        onSubmit={(data: FamilyFormData) => {
                          setIsDisabled(true);
                          if (!isDefaultId(data.id) && invitationData) {
                            FamiliesService.saveFamily(
                              invitationData.id,
                              familyData!,
                              data,
                              false,
                              true,
                            )
                              .then(() => {
                                setIsFormSubmitted(true);
                                if (data.notaInvitado && data.notaInvitado.trim() !== "") {
                                  FamilyQuotesService.saveFamilyQuote(
                                    invitationData.id,
                                    data.id!,
                                    {
                                      autor: data.nombre,
                                      mensaje: data.notaInvitado || "",
                                      asistencia: data.asistencia,
                                    },
                                  );
                                }

                                ActivityService.logActivity(invitationData.id, {
                                  action:
                                    data.asistencia === true
                                      ? "confirm"
                                      : "decline",
                                  familyId: data.id!,
                                  familyName: data.nombre,
                                  confirmedGuests:
                                    data.asistencia === true &&
                                    data.confirmados &&
                                    data.confirmados > 0
                                      ? data.confirmados
                                      : null,
                                });

                                const newFamilyLocal = {
                                  ...data,
                                  id: data.id!,
                                  tieneTelefono: false,
                                  fechaCreacion: null,
                                  ultimaModificacion: null,
                                };

                                setFamilyData(newFamilyLocal);
                                setFamily(newFamilyLocal);
                              })
                              .catch(() => setIsDisabled(false));
                          } else {
                            setIsFormSubmitted(true);
                            setFamilyData({
                              ...defaultFamily,
                              asistencia: data.asistencia,
                              confirmados: data.confirmados,
                              notaInvitado: data.notaInvitado,
                            });
                            setIsDisabled(false);
                          }
                        }}
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
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 text-center mt-2">
                                ¿Confirmas tu asistencia?
                              </p>
                              <div className="flex flex-row gap-2 w-full mb-8">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFieldValue("asistencia", true);
                                    if (!values.confirmados)
                                      setFieldValue(
                                        "confirmados",
                                        Number(familyData.invitados),
                                      );
                                  }}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-1 py-3.5 rounded-full transition-all duration-300 font-medium text-sm border",
                                    values.asistencia === true
                                      ? "bg-[#2C2C29] border-[#2C2C29] text-white shadow-md"
                                      : "bg-transparent border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-600",
                                  )}
                                >
                                  <span className="text-md">🥂</span> Sí, ahí
                                  estaré
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFieldValue("asistencia", false);
                                    setFieldValue("confirmados", 0);
                                  }}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-1 py-3.5 rounded-full transition-all duration-300 font-medium text-sm border",
                                    values.asistencia === false
                                      ? "bg-[#2C2C29] border-[#2C2C29] text-white shadow-md"
                                      : "bg-transparent border-stone-300 text-stone-500 hover:border-stone-300 hover:text-stone-600",
                                  )}
                                >
                                  <span className="text-md opacity-80 grayscale">
                                    🤍
                                  </span>{" "}
                                  No podré ir
                                </button>
                              </div>

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
                                    <div className="w-full flex flex-col items-center">
                                      <AnimatePresence initial={false}>
                                        {isAttending && (
                                          <motion.div
                                            key="confirmados-stepper"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                              opacity: 1,
                                              height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full overflow-hidden"
                                          >
                                            <div className="w-full flex flex-col items-center mb-10">
                                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 text-center mt-2">
                                                Número de pases
                                              </p>
                                              <div className="flex items-center justify-center gap-8 md:gap-12">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (confirmados > 1)
                                                      setFieldValue(
                                                        "confirmados",
                                                        confirmados - 1,
                                                      );
                                                  }}
                                                  disabled={confirmados <= 1}
                                                  className="w-12 h-12 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 disabled:border-stone-300 disabled:text-stone-300 transition-all active:scale-95 hover:bg-stone-100 hover:text-charcoal hover:border-charcoal"
                                                >
                                                  <Minus
                                                    size={18}
                                                    strokeWidth={2}
                                                  />
                                                </button>
                                                <div className="flex flex-col items-center justify-center min-w-[4rem]">
                                                  <span className="font-serif text-5xl text-charcoal font-bold leading-none">
                                                    {confirmados}
                                                  </span>
                                                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">
                                                    Pase(s)
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (
                                                      confirmados <
                                                      Number(
                                                        familyData.invitados,
                                                      )
                                                    )
                                                      setFieldValue(
                                                        "confirmados",
                                                        confirmados + 1,
                                                      );
                                                  }}
                                                  disabled={
                                                    confirmados >=
                                                    Number(familyData.invitados)
                                                  }
                                                  className="w-12 h-12 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 disabled:border-stone-300 disabled:text-stone-300 transition-all active:scale-95 hover:bg-stone-100 hover:text-charcoal hover:border-charcoal"
                                                >
                                                  <Plus
                                                    size={18}
                                                    strokeWidth={2}
                                                  />
                                                </button>
                                              </div>
                                              {familyData.invitados > 1 && (
                                                <p className="text-[10px] text-stone-400 mt-5 font-medium italic">
                                                  Límite asignado:{" "}
                                                  {familyData.invitados} pases
                                                </p>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>

                                      <div className="w-full mb-10 mt-2 text-left">
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">
                                          {values.asistencia === true
                                            ? "Envía una felicitación"
                                            : "Mensaje para los novios"}{" "}
                                          <span className="font-normal italic tracking-normal opacity-80">
                                            (opcional)
                                          </span>
                                        </label>
                                        <textarea
                                          name="notaInvitado"
                                          value={values.notaInvitado || ""}
                                          onChange={(e) =>
                                            setFieldValue(
                                              "notaInvitado",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full bg-transparent border-b border-sand py-2 text-sm text-[#2C2C29] placeholder:text-stone-300 focus:border-stone-500 outline-none resize-none transition-colors"
                                          rows={1}
                                          style={{ fieldSizing: "content" }}
                                          placeholder="Escribe aquí tu mensaje..."
                                        />
                                      </div>

                                      <button
                                        type="submit"
                                        disabled={isDisabled}
                                        className={cn(
                                          "w-full bg-[#2C2C29] text-white py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a18] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                                          sendFormBtnClassName,
                                        )}
                                      >
                                        Confirmar Asistencia{" "}
                                        <ArrowRight size={16} />
                                      </button>
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
                textClassName={textClassName}
              />
            ) : (
              <DeclineCard
                familyData={familyData}
                textClassName={textClassName}
              />
            )}

            {!isFormLocked &&
              isFormSubmitted &&
              familyData.asistencia !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex flex-col items-center gap-6"
                >
                  <button
                    onClick={() => {
                      setIsFormSubmitted(false);
                      setIsDisabled(false);
                      setTimeout(() => {
                        formContainerRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 100);
                    }}
                    className="text-stone-500 font-medium text-xs uppercase tracking-widest border-b border-stone-300 hover:border-charcoal hover:text-charcoal transition-all pb-0.5"
                  >
                    Modificar mi respuesta
                  </button>
                  {familyData?.fechaLimiteConfirmacion && formattedDeadline && (
                    <div className="flex items-center gap-1.5 mx-6 px-2 py-1.5 bg-white/40 border border-[#EBE5DA] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      <Clock size={12} className="text-[#A8A29E] shrink-0" />
                      <span className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-widest text-center">
                        Puedes ajustar hasta el {formattedDeadline}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default Assistants;
