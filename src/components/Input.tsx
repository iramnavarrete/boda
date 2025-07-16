import { useFormikContext } from "formik";
import { FormObject, FormObjectKeys } from "../../types/types";

type Props = {
  inputType?: "text" | "number" | "textarea";
  title: string;
  name: FormObjectKeys;
};

function Input({ title, name, inputType }: Props) {
  const { handleChange, values, errors, touched } =
    useFormikContext<FormObject>();
  return (
    <div className="w-full flex flex-col items-start gap-1">
      <p className="font-nourdLight px-1">{title}</p>
      {inputType === "textarea" ? (
        <textarea
          name={name}
          onChange={handleChange}
          value={name !== "asistencia" ? values[name] : ""}
          className={`w-full h-28 px-3 py-2 bg-white border border-primary rounded-md text-sm shadow-sm
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none`}
        />
      ) : (
        <input
          name={name}
          onChange={handleChange}
          value={name !== "asistencia" ? values[name] : ""}
          className={`w-full px-3 py-2 bg-white border border-primary rounded-md text-sm shadow-sm
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
          type={inputType || "text"}
        />
      )}
      {touched[name] && (
        <p className="text-sm px-1 text-red-500">{errors[name]}</p>
      )}
    </div>
  );
}

export default Input;
