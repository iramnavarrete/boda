import { useFormikContext } from "formik";
import { GuestFormData, GuestFormDataKeys } from "@/types";

type Props = {
  inputType?: "text" | "number" | "textarea";
  title: string;
  name: GuestFormDataKeys;
  placeholder?: string;
};

function Input({ title, name, inputType, placeholder = '' }: Props) {
  const { handleChange, values, errors, touched } =
    useFormikContext<GuestFormData>();
  return (
    <div className="w-full flex flex-col items-start gap-1">
      <p className="font-nourdLight px-1">{title}</p>
      {inputType === "textarea" ? (
        <textarea
          name={name}
          onChange={handleChange}
          value={name !== "asistencia" ? values[name]?.toString() : ""}
          className={`w-full h-28 px-3 py-2 bg-white border border-primary rounded-md text-sm shadow-sm
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none`}
            placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          onChange={handleChange}
          value={name !== "asistencia" ? values[name]?.toString() : ""}
          className={`w-full px-3 py-2 bg-white border border-primary rounded-md text-sm shadow-sm
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
          type={inputType || "text"}
          placeholder={placeholder}
        />
      )}
      {touched[name] && (
        <p className="text-sm px-1 text-red-500">{errors[name]}</p>
      )}
    </div>
  );
}

export default Input;
