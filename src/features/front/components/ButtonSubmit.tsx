import { cn } from "@heroui/theme";
import { useFormikContext } from "formik";

type Props = {
  isDisabled: boolean;
  className?: string;
};

function ButtonSubmit({ isDisabled, className = '' }: Props) {
  const { handleSubmit } = useFormikContext();
  return (
    <div className="flex flex-row items-center self-center">
      <button
        disabled={isDisabled}
        className={cn("border-primary border-1 mt-4 py-3 px-8 rounded-2xl bg-button-dark", className)}
        type="submit"
        onClick={() => {
          handleSubmit();
        }}
      >
        {isDisabled ? "Cargando" : "Enviar"}
      </button>
    </div>
  );
}

export default ButtonSubmit;
