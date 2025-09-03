import * as yup from "yup";

const assistanceSchema = (maxAssistants: number) =>
  yup.object({
    id: yup.string().required(),
    asistencia: yup.boolean().required("Este campo es requerido"),
    confirmados: yup.number().when("asistencia", {
      is: true, // solo valida si asistencia es true
      then: (schema) =>
        schema
          .required("Este campo es requerido")
          .min(1, "Valor no válido")
          .max(maxAssistants, "El número de asistentes excede los permitidos"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    mensaje: yup.string().notRequired(),
  });

export default assistanceSchema;
