import axios from "axios";
import qs from "qs";
import { FormObject } from "../../types/types";

export const sendFormData = async (data: FormObject): Promise<void> => {
  try {
    axios.post(
      "https://script.google.com/macros/s/AKfycbxF5VE1Ih1qeYHjp3gn9AdzZ5IsSq91pQZe1sWM9SNEbI-MXXiCMLW9nn4Gcc83ZbA3/exec",
      qs.stringify({
        ...data,
        asistencia: data.asistencia === true ? "Si" : "No",
      })
    );
  } catch (error) {
    throw new Error("Error al guardar los datos: " + error);
  }
};
