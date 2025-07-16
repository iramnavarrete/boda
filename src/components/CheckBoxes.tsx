import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { FormObject } from "../../types/types";

export default function CheckBoxes({ asistencia }: { asistencia?: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { setFieldValue, touched, errors } = useFormikContext<FormObject>();

  useEffect(() => {
    if (asistencia) {
      if (asistencia === "TRUE") {
        setSelected(["si"]);
      }
      if(asistencia === 'FALSE'){
        setSelected(['no'])
      }
    }
  }, [asistencia]);

  return (
    <div className="">
      <CheckboxGroup
        orientation="horizontal"
        value={selected}
        onChange={(value) => {
          if (value.length > 0) {
            const newArray: string[] = [];
            newArray.push(value.at(-1) as string);
            setSelected(newArray);
            setFieldValue("asistencia", newArray.at(0) === "si");
          } else {
            setSelected([]);
            setFieldValue("asistencia", "");
          }
        }}
        className="p-2 items-center"
      >
        <Checkbox value="si">Sí</Checkbox>
        <div className="w-1" />
        <Checkbox value="no">No</Checkbox>
      </CheckboxGroup>
      {touched.asistencia && errors.asistencia && (
        <p className="mt-[-4px] text-sm text-red-500">{errors.asistencia}</p>
      )}
    </div>
  );
}
