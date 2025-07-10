import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { useFormikContext } from "formik";
import { useState } from "react";
import { FormObject } from "../../types/types";

export default function CheckBoxes() {
  const [selected, setSelected] = useState<string[]>([]);
  const { setFieldValue, touched, errors } = useFormikContext<FormObject>();
  return (
    <div>
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
        className="p-2"
      >
        <Checkbox value="si">Sí</Checkbox>
        <div className="w-1" />
        <Checkbox value="no">No</Checkbox>
      </CheckboxGroup>
      {touched.asistencia && (
        <p className="mt-[-4px] text-sm text-red-500">{errors.asistencia}</p>
      )}
    </div>
  );
}
