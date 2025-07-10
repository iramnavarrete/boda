import * as yup from "yup";

const assistanceSchema = yup.object({
  asistencia: yup.boolean().required("Este campo es requerido"),
  // defaults also affect the possible output type!
  // schema with default values won't produce `undefined` values. Remember object schema
  // have a default value built in.
  nombres: yup.string().required("Este campo es requerido"),
  personas: yup.number().required("Este campo es requerido"),
  felicitacion: yup.string().notRequired(),
});

export default assistanceSchema;
