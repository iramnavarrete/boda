import AnimatedEntrance from "@/components/AnimatedEntrance";
import ButtonSubmit from "@/components/ButtonSubmit";
import CheckBoxes from "@/components/CheckBoxes";
import Input from "@/components/Input";
import { sendFormData } from "@/controllers/formAssistance";
import assistanceSchema from "@/validation/yupSchema";
import { Formik } from "formik";
import { useRef, useState } from "react";
import Lottie, { Options as LottieOptions } from "react-lottie";
import animationData from "../../lottie/heart.json";
import { AnimatePresence, motion } from "framer-motion";
import { FormObject } from "../../../types/types";

function Assistants() {
  const defaultOptions: LottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };
  const lottieRef = useRef<Lottie>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);

  return (
    <div>
      <hr className="w-full border-primary" />
      <div className="bg-white flex flex-col items-center justify-center py-20">
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="font-sacramento text-4xl text-center">Confirmación</p>
            <p className="font-handlee text-medium text-center px-10">
              Es muy importante para nosotros contar con tu confirmación lo
              antes posible
            </p>
            <p className="font-handlee text-medium text-center px-10">
              (No niños)
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="border-primary border-1 m-5 w-11/12 relative">
              <div className="">
                {!isFormSubmitted ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-7 py-6 bg-white font-handlee flex flex-col text-center items-center"
                    >
                      <p>¿Asistirás?</p>
                      <Formik
                        validationSchema={assistanceSchema}
                        onSubmit={(data: FormObject) => {
                          setIsDisabled(true);
                          sendFormData(data)
                            .then(() => {
                              setIsFormSubmitted(true);
                              console.log(data.asistencia, "ASISTENCIA");
                              setIsAssistant(data.asistencia as boolean);
                            })
                            .catch(() => {
                              setIsDisabled(false);
                            });
                        }}
                        initialValues={{
                          asistencia: "",
                          nombres: "",
                          personas: "",
                          felicitacion: "",
                        }}
                      >
                        <>
                          <CheckBoxes />
                          <div className="flex flex-col items-start w-full gap-2">
                            <Input name="nombres" title="Nombre" />
                            <Input
                              name="personas"
                              title="Personas confirmadas"
                              inputType="number"
                            />
                            <Input
                              name="felicitacion"
                              title="¡Envía una felicitación!"
                              inputType="textarea"
                            />
                            <ButtonSubmit isDisabled={isDisabled} />
                          </div>
                        </>
                      </Formik>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="px-7 py-6 bg-white font-handlee text-center w-full h-full flex flex-col justify-center items-center">
                      <Lottie
                        ref={lottieRef}
                        options={defaultOptions}
                        height={150}
                        width={150}
                      />
                      <div className="text-center font-handlee">
                        {isAssistant ? (
                          <p>
                            Muchas gracias por tu confirmación
                            <br />
                            ¡Te esperamos el gran día!
                          </p>
                        ) : (
                          <p>
                            Lamentamos que no puedas acompañarnos
                            <br />
                            ¡Nos vemos en otra ocasión!
                          </p>
                        )}
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
