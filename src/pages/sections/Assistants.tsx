import AnimatedEntrance from "@/components/AnimatedEntrance";
import ButtonSubmit from "@/components/ButtonSubmit";
import CheckBoxes from "@/components/CheckBoxes";
import Input from "@/components/Input";
import assistanceSchema from "@/validation/yupSchema";
import { Formik } from "formik";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormObject, SheetData } from "../../../types/types";
import Separator from "@/icons/separator";
import Image from "next/image";
import { useEffect } from "react";
import { getGuestData, updateGuestData } from "@/services/guest";
import dynamic from "next/dynamic";
import animationData from "../../lottie/heart_green.json";
import { useSearchParams } from "next/navigation";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-accent" />,
});

const defaultOptions = {
  loop: true,
  animationData,
  autoplay: true,
};

function Assistants() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [guestData, setGuestData] = useState<SheetData>();
  const [idInvalid, setIdInvalid] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get("guest");

  const handleGetGuestData = useCallback((id: string) => {
    getGuestData({ id })
      .then((el) => {
        setGuestData(el);
        console.log({ el });
        if (el.asistencia !== "") {
          setIsFormSubmitted(true);
          if (el.asistencia === "TRUE") {
            setIsAssistant(true);
          } else if (el.asistencia === "FALSE") {
            setIsAssistant(false);
          }
        }
      })
      .catch(() => {
        setIdInvalid(true);
      });
  }, []);

  useEffect(() => {
    if (id) {
      handleGetGuestData(id);
    }
  }, [id]);

  if (!id || idInvalid) {
    return null;
  }

  return (
    <div>
      <hr className="w-full" />
      <div className="bg-accent flex flex-col items-center justify-center py-20">
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center gap-4 pb-5">
            <Separator className="mx-10" />
            <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary px-5 text-center">
              Confirmación de asistencia
            </p>
            <p className="font-nourdLight text-medium text-center px-10">
              Es muy importante para nosotros contar con tu confirmación lo
              antes posible
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="mx-5 w-11/12 relative">
              <div className="flex justify-center h-12">
                {!isFormSubmitted && guestData && (
                  <div className="w-24 h-24 absolute">
                    <Image
                      alt="Sello de carta"
                      className="w-full h-full"
                      width={0}
                      height={0}
                      sizes="100vw"
                      src={`/img/sello.png`}
                    />
                  </div>
                )}
              </div>
              <div
                className={`mt-${
                  !isFormSubmitted ? "12" : "6"
                } border-primary border-1 rounded-md bg-white`}
              >
                <div className={`pt-12 ${isFormSubmitted ? 'block' : 'hidden'}`}>
                  <Lottie
                    options={{ ...defaultOptions }}
                    height={150}
                    width={150}
                  />
                </div>
                {!isFormSubmitted ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-12 font-nourdLight flex flex-col items-center text-primary"
                      key="assistance-form"
                    >
                      {!guestData ? (
                        <p>Cargando información</p>
                      ) : (
                        <>
                          <p className="py-2 text-2xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary text-center">
                            {guestData.nombre}
                          </p>
                          <p className="text-sm">
                            Pase para {guestData.pases}{" "}
                            {guestData.pases === "1" ? "persona" : "personas"}
                          </p>
                          <p className="py-6 text-lg font-nourdMedium">
                            ¡NO NIÑOS!
                          </p>
                          <p>¿Asistirás?</p>
                          <Formik
                            validationSchema={assistanceSchema(
                              Number(guestData.pases)
                            )}
                            onSubmit={(data: FormObject) => {
                              setIsDisabled(true);
                              updateGuestData({ id, data })
                                .then(() => {
                                  setIsFormSubmitted(true);
                                  handleGetGuestData(id);
                                  setIsAssistant(!!data.asistencia);
                                })
                                .catch((error) => {
                                  console.log(error, "ERROR");
                                  setIsDisabled(false);
                                });
                            }}
                            initialValues={{
                              id: guestData.id,
                              asistencia: guestData.asistencia,
                              confirmados: guestData.confirmados,
                              mensaje: guestData.mensaje,
                            }}
                          >
                            <>
                              <CheckBoxes asistencia={guestData.asistencia} />
                              <div className="flex flex-col items-start w-full gap-2">
                                <Input
                                  name="confirmados"
                                  title="Personas confirmadas"
                                  inputType="number"
                                />
                                <Input
                                  name="mensaje"
                                  title="¡Envía una felicitación!"
                                  inputType="textarea"
                                />
                                <ButtonSubmit isDisabled={isDisabled} />
                              </div>
                            </>
                          </Formik>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="thanks"
                  >
                    <div className="px-7 pb-12 font-nourdLight text-center w-full h-full flex flex-col justify-center items-center">
                      <div className="text-center font-nourdLight py-2 text-primary">
                        {isAssistant ? (
                          <p>
                            Muchas gracias por tu confirmación <span></span>{" "}
                            {guestData?.nombre}
                            <br />
                            <br />
                            ¡Te esperamos el gran día!
                          </p>
                        ) : (
                          <p>
                            Lamentamos que no puedas acompañarnos{" "}
                            {guestData?.nombre}
                            <br />
                            <br />
                            ¡Nos vemos en otra ocasión!
                          </p>
                        )}
                        <button
                          className="border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
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
              </div>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
}

export default Assistants;
