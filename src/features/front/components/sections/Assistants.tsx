import assistanceSchema from "@/validation/yupSchema";
import { Formik, FormikProps } from "formik";
import { FC, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Separator from "@/icons/separator";
import Image from "next/image";
import { useEffect } from "react";
import animationData from "../../../../lottie/heart_green.json";
import { useSearchParams } from "next/navigation";
import AnimatedEntrance from "../AnimatedEntrance";
import Input from "../Input";
import ButtonSubmit from "../ButtonSubmit";
import { Guest, GuestFormData } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";
import CustomLottie from "@/features/shared/components/CustomLottie";
import { GuestService } from "@/services/guestService";
import { useInvitationStore } from "../../stores/invitationStore";
import { GuestQuotesService } from "@/services/guestQuotesService";
import { ActivityService } from "@/services/activityService";
import { cn } from "@heroui/theme";
import { colorizeLottie } from "@/utils/lottie";

const defaultGuest: Guest = {
  asistencia: null, // Inicializado como null para que no muestre los campos
  confirmados: 1,
  id: "_",
  notaInvitado: "", // Limpiado para que el invitado escriba
  nombre: "Invitado genérico",
  invitados: 1,
  cambiosPermitidos: true,
  fechaCreacion: null,
  notaAnfitrion: "",
  tieneTelefono: false,
  ultimaModificacion: null,
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

const Assistants: FC<Props> = ({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  activeConfirmBtnClassName = "",
  activeDeclineBtnClassName = "",
  inactiveConfirmBtnClassName = "",
  inactiveDeclineBtnClassName = "",
  sendFormBtnClassName = "",
  sealImage,
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [guestData, setGuestData] = useState<Guest>(defaultGuest);

  const invitationData = useInvitationStore((state) => state.invitationData);

  const formikRef = useRef<FormikProps<GuestFormData>>(null);

  const searchParams = useSearchParams();
  const id = searchParams?.get("guest");

  const handleGetGuestData = useCallback(
    (id: string) => {
      if (!isDefaultId(id) && invitationData) {
        GuestService.getGuest(invitationData.id, id).then(
          ({ guest, error }) => {
            if (error || !guest) {
              setGuestData(defaultGuest);
              return;
            }
            GuestQuotesService.getGuestQuote(invitationData.id, id).then(
              ({ result, error }) => {
                const guestData = { ...guest };
                if (!error && result !== null) {
                  guestData.notaInvitado = result.mensaje;
                }
                setGuestData(guestData);
                formikRef.current?.setValues({ ...guestData, telefono: null });

                if (guestData.asistencia !== null) {
                  setIsFormSubmitted(true);
                  if (guestData.asistencia === true) {
                    setIsAssistant(true);
                  } else if (guestData.asistencia === false) {
                    setIsAssistant(false);
                  }
                }
              },
            );
          },
        );
      }
    },
    [invitationData],
  );

  useEffect(() => {
    if (id) {
      handleGetGuestData(id);
    }
  }, [id, handleGetGuestData]);

  if (!guestData) {
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
      <hr className="w-full" />
      <div
        className={cn(
          "bg-accent flex flex-col items-center justify-center py-20",
          containerClassName,
        )}
      >
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center gap-4 pb-5">
            <Separator className="mx-10" color={svgsColor} />
            <p
              className={cn(
                "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary px-5 text-center",
                textClassName,
              )}
            >
              Confirmación de asistencia
            </p>
            <p className="font-nourdLight text-medium text-center px-10">
              Es muy importante para nosotros contar con tu confirmación lo
              antes posible
            </p>
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance classname="w-full">
          <div className="flex items-center justify-center">
            <div className="mx-5 w-11/12 relative">
              <div className="flex justify-center h-12">
                <AnimatePresence>
                  {!isFormSubmitted && guestData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-24 h-24 absolute"
                    >
                      <Image
                        alt="Sello de carta"
                        className="w-full h-full object-contain"
                        width={100}
                        height={100}
                        sizes="100vw"
                        src={sealImage || `/img/sello.png`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="rounded-3xl bg-white shadow-xl px-4 py-8">
                <div
                  className={`pt-12 ${isFormSubmitted || (guestData.cambiosPermitidos === false && guestData.asistencia !== true) ? "block" : "hidden"}`}
                >
                  <CustomLottie
                    className={cn("w-1/2 m-auto pb-4")}
                    loop
                    autoPlay
                    animationData={colorizeLottie(animationData, "heart", {
                      main: svgsColor || "#000",
                      secondary: svgsColor|| '#000',
                      tertiary: svgsColor || '#000',
                      quarterly: svgsColor|| '#000',
                      fiftriary: svgsColor || "#000",
                      sixtriary: svgsColor || '#000',
                    })}
                  />
                </div>

                {guestData.cambiosPermitidos === false ? (
                  <div
                    className={cn(
                      "px-6 pt-8 pb-12 font-nourdLight flex flex-col items-center text-primary text-center",
                      textClassName,
                    )}
                  >
                    <p>
                      El registro de asistencia está cerrado. <br />
                      <br />
                      {guestData.asistencia === true ? (
                        <>
                          Tu asistencia quedó confirmada por{" "}
                          <span className="font-semibold">
                            {guestData.confirmados} personas
                          </span>
                          . <br />
                          Estos lugares estarán reservados especialmente para
                          ti. <br />
                          <br />
                          ¡Estamos felices de que seas parte de este gran día!
                        </>
                      ) : (
                        <>
                          Lamentamos que no puedas acompañarnos en esta ocasión,
                          te llevaremos presente con mucho cariño en nuestro
                          gran día.
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    {!isFormSubmitted ? (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "px-2 py-12 font-nourdLight flex flex-col items-center text-primary",
                            textClassName,
                          )}
                          key="assistance-form"
                        >
                          <>
                            <p
                              className={cn(
                                "py-2 text-2xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary text-center",
                                textClassName,
                              )}
                            >
                              {guestData.nombre}
                            </p>
                            <p className="text-sm">
                              Pase para {guestData.invitados}{" "}
                              {/* VALIDACIÓN ORIGINAL INTACTA */}
                              {guestData.invitados === 1
                                ? "persona"
                                : "personas"}
                            </p>
                            {guestData.notaAnfitrion && (
                              <p className="pt-2 px-2 text-center text-sm">
                                {guestData.notaAnfitrion}
                              </p>
                            )}
                            <p className="py-4 text-lg font-nourdMedium">
                              ¡NO NIÑOS!
                            </p>

                            <p className="font-bold">¿Asistirás?</p>

                            <Formik
                              innerRef={formikRef}
                              validationSchema={assistanceSchema(
                                Number(guestData.invitados),
                              )}
                              onSubmit={(data: GuestFormData) => {
                                setIsDisabled(true);
                                // Si tenemos un id válido hacemos una petición al api para actualizar
                                if (!isDefaultId(data.id) && invitationData) {
                                  GuestService.saveGuest(
                                    invitationData.id,
                                    data.id!,
                                    data,
                                    false,
                                    true,
                                  )
                                    .then(() => {
                                      setIsFormSubmitted(true);
                                      setIsAssistant(data.asistencia === true);
                                      if (data.notaInvitado) {
                                        GuestQuotesService.saveGuestQuote(
                                          invitationData.id,
                                          data.id!,
                                          {
                                            autor: data.nombre,
                                            mensaje: data.notaInvitado || "",
                                          },
                                        );
                                      }
                                      ActivityService.logActivity(
                                        invitationData.id,
                                        {
                                          action:
                                            data.asistencia === true
                                              ? "confirm"
                                              : "decline",
                                          guestId: data.id!,
                                          confirmedGuests:
                                            data.asistencia === true &&
                                            data.confirmados &&
                                            data.confirmados > 0
                                              ? data.confirmados
                                              : null,
                                        },
                                      );
                                      setGuestData({
                                        ...data,
                                        id: data.id!,
                                        tieneTelefono: false,
                                        fechaCreacion: null,
                                        ultimaModificacion: null,
                                      });
                                    })
                                    .catch((error) => {
                                      setIsDisabled(false);
                                    });
                                } else {
                                  setIsFormSubmitted(true);
                                  setIsAssistant(data.asistencia === true);
                                  setGuestData({
                                    ...defaultGuest,
                                    asistencia: data.asistencia,
                                    confirmados: data.confirmados,
                                    notaInvitado: data.notaInvitado,
                                  });
                                  setIsDisabled(false);
                                }
                              }}
                              initialValues={{
                                ...guestData,
                                telefono: null,
                              }}
                            >
                              {({ values, handleSubmit, setFieldValue }) => {
                                // MANTENIENDO TU VALIDACIÓN ORIGINAL PARA OCULTAR INPUTS CON NULL
                                const hasSelectedOption =
                                  values.asistencia !== null &&
                                  values.asistencia !== undefined;
                                const isAttending = values.asistencia === true;

                                return (
                                  <form
                                    onSubmit={handleSubmit}
                                    className="w-full flex flex-col items-center"
                                  >
                                    {/* BOTONES SEGMENTADOS ESTILO IMAGEN */}
                                    <div className="flex gap-3 w-full mb-6 mt-4">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFieldValue("asistencia", true);
                                          if (!values.confirmados)
                                            setFieldValue(
                                              "confirmados",
                                              Number(guestData.invitados),
                                            );
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 font-medium border ${
                                          values.asistencia === true
                                            ? cn(
                                                "bg-sand-200 text-primary border-primary-700/80",
                                                activeConfirmBtnClassName,
                                              )
                                            : cn(
                                                "bg-transparent border-sand-200 text-[#A8A29E] hover:bg-sand-200/50 hover:text-primary-700/80",
                                                inactiveConfirmBtnClassName,
                                              )
                                        }`}
                                      >
                                        <CheckCircle2
                                          size={18}
                                        />
                                        Sí
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFieldValue("asistencia", false);
                                          setFieldValue("confirmados", 0);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 font-medium border ${
                                          values.asistencia === false
                                            ? cn(
                                                "bg-red-200 text-red-700/80 border-red-600/80",
                                                activeDeclineBtnClassName,
                                              )
                                            : cn(
                                                "bg-transparent border-sand-200 text-[#A8A29E] hover:bg-sand-200/50 hover:text-primary-600",
                                                inactiveDeclineBtnClassName,
                                              )
                                        }`}
                                      >
                                        <XCircle
                                          size={18}
                                        />
                                        No
                                      </button>
                                    </div>

                                    <AnimatePresence>
                                      {hasSelectedOption && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="w-full"
                                        >
                                          <div className="flex flex-col items-start w-full mt-2">
                                            <AnimatePresence initial={false}>
                                              {isAttending && (
                                                <motion.div
                                                  key="confirmados-input"
                                                  initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                  }}
                                                  exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                  }}
                                                  transition={{ duration: 0.3 }}
                                                  className="w-full"
                                                >
                                                  <div className="mb-4 w-full">
                                                    <Input
                                                      name="confirmados"
                                                      title="Número de personas confirmadas"
                                                      inputType="number"
                                                    />
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>

                                            <div className="w-full mb-4">
                                              <Input
                                                name="notaInvitado"
                                                title="¡Envía una felicitación! (Opcional)"
                                                inputType="textarea"
                                                placeholder={
                                                  values.asistencia === true
                                                    ? "Estamos ansiosos por que llegue el gran día de verlos juntos caminando hacia el altar \n\n¡Muchas felicidades!"
                                                    : "Lamentamos no poder acompañarlos esta ocasión, aún así les deseamos lo mejor en su matrimonio"
                                                }
                                              />
                                            </div>

                                            <div className="w-full flex justify-center mt-2">
                                              <ButtonSubmit
                                                className={sendFormBtnClassName}
                                                isDisabled={isDisabled}
                                              />
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </form>
                                );
                              }}
                            </Formik>
                          </>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key="thanks"
                      >
                        <div className="px-7 pb-12 font-nourdLight text-center w-full h-full flex flex-col justify-center items-center">
                          <div
                            className={cn(
                              "text-center font-nourdLight py-2 text-primary",
                              textClassName,
                            )}
                          >
                            {isAssistant ? (
                              <p>
                                Muchas gracias por tu confirmación <span></span>{" "}
                                <strong>{guestData?.nombre}</strong>
                                <br />
                                <br />
                                ¡Te esperamos el gran día!
                              </p>
                            ) : (
                              <p>
                                Lamentamos que no puedas acompañarnos{" "}
                                <strong>{guestData?.nombre}</strong>
                                <br />
                                <br />
                                ¡Nos vemos en otra ocasión!
                              </p>
                            )}
                            <button
                              className={cn(
                                "mt-8 px-8 py-3.5 rounded-xl bg-sand-200 text-primary-600 font-medium transition-all hover:opacity-90 w-full md:w-auto",
                                sendFormBtnClassName,
                              )}
                              onClick={() => {
                                setIsFormSubmitted(false);
                                setIsDisabled(false);
                              }}
                            >
                              Cambiar respuesta
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default Assistants;
