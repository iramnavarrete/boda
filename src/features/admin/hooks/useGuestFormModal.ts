import { useState, useCallback } from "react";
import { GuestFormData } from "@/types";

// Helper puro (fuera del hook para evitar recreaciones en memoria)
const parsePhoneData = (telefono?: string | null) => {
  if (!telefono) return { code: "52", num: "" };

  let parsedCode = "52";
  let parsedNum = telefono;
  const codes = ["52", "1", "34", "57", "54", "56"];

  for (const code of codes) {
    if (parsedNum.startsWith(code) && parsedNum.length > code.length) {
      parsedCode = code;
      parsedNum = parsedNum.substring(code.length);
      break;
    }
  }
  return { code: parsedCode, num: parsedNum };
};

export const useGuestFormModal = (
  isOpen: boolean,
  initialData: GuestFormData,
  onSubmitParent: (data: GuestFormData) => void,
) => {
  // 1. Estados iniciales
  const [formData, setFormData] = useState<GuestFormData>(initialData);
  const [countryCode, setCountryCode] = useState(
    () => parsePhoneData(initialData.telefono).code,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    () => parsePhoneData(initialData.telefono).num,
  );

  // 2. PATRÓN REACT 18: Derived State (Reemplazo total del useEffect)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen); // Sincronizamos la memoria

    // Solo reseteamos los datos si el modal se está ABRIENDO
    if (isOpen) {
      setFormData(initialData);
      const { code, num } = parsePhoneData(initialData.telefono);
      setCountryCode(code);
      setPhoneNumber(num);
    }
  }

  // --- HANDLERS ---
  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      setCountryCode(code);
      setFormData((prev) => ({
        ...prev,
        telefono: phoneNumber ? code + phoneNumber : "",
      }));
    },
    [phoneNumber],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = e.target.value.replace(/\D/g, "");
      setPhoneNumber(num);
      setFormData((prev) => ({
        ...prev,
        telefono: num ? countryCode + num : "",
      }));
    },
    [countryCode],
  );

  const handleNumberChange = useCallback(
    (field: keyof GuestFormData, value: string) => {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      const finalValue = isNaN(numValue) ? 0 : numValue;
      const updates: Partial<GuestFormData> = { [field]: finalValue };

      if (field === "confirmados") {
        updates.asistencia = true;
        if (finalValue <= 0) {
          updates.asistencia = false;
        }
      }

      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleAsistenciaToggle = useCallback((estado: boolean | null) => {
    setFormData((prev) => {
      const nuevoEstado = prev.asistencia === estado ? null : estado;
      return {
        ...prev,
        asistencia: nuevoEstado,
        confirmados: nuevoEstado === false ? 0 : prev.confirmados,
      };
    });
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      etiqueta: prev.etiqueta === tag ? null : tag,
    }));
  }, []);

  const handleTextChange = useCallback(
    (field: keyof GuestFormData, value: string | boolean | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitParent(formData);
  };

  return {
    formData,
    countryCode,
    phoneNumber,
    handleCountryChange,
    handlePhoneChange,
    handleNumberChange,
    handleAsistenciaToggle,
    handleTagToggle,
    handleTextChange,
    handleSubmit,
  };
};
