import { useFormikContext } from "formik";
import { useEffect } from "react";

type Props = {
  isDisabled: boolean;
};

function ButtonSubmit({ isDisabled }: Props) {
  const { handleSubmit } = useFormikContext();
  return (
    <div className="flex flex-row items-center self-center">
      <button
        disabled={isDisabled}
        className="border-primary border-1 mt-4 py-3 px-8 rounded-2xl bg-button-dark"
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
