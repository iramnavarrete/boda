import { FormObject, SheetData } from "../../types/types";

export const getGuestData = async ({
  id,
}: {
  id: string;
}): Promise<SheetData> => {
  const res = await fetch(`/api/guest/${id}`);
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Error al obtener datos del invitado.");
  }
  return await res.json();
};

export const updateGuestData = async ({
  id,
  data,
}: {
  id: string;
  data: FormObject;
}) => {
  const res = await fetch("/api/guest/confirm", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      data,
    }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Error al obtener datos del invitado.");
  }
};
