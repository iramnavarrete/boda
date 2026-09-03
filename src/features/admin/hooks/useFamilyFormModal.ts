import { useState, useCallback } from "react";
import { FamilyFormData } from "@/types";

/**
 * Códigos de país soportados por el selector de WhatsApp.
 * Mantener sincronizado con las `<option>` del select en
 * `FamilyFormModal` y con `parsePhoneData`.
 */
const COUNTRY_CODES = ["52", "1", "34", "57", "54", "56"] as const;

/**
 * Helper puro: separa un teléfono guardado en el código de país
 * y el número local. Acepta tres formatos para máxima compatibilidad:
 *
 *   1. Canónico nuevo:  "+52 6141234567"   → code="52", num="6141234567"
 *   2. Canónico sin espacio: "+526141234567" → code="52", num="6141234567"
 *   3. Legacy digits-only: "526141234567"  → code="52", num="6141234567"
 *   4. Solo número local: "6141234567"     → code="52" (default), num="6141234567"
 *
 * Si el código detectado no está en la lista de soportados,
 * cae al default "52" para no romper el selector.
 */
const parsePhoneData = (telefono?: string | null) => {
  if (!telefono) return { code: "52", num: "" };

  const codes = COUNTRY_CODES as readonly string[];

  // 1) Formato canónico con espacio: "+<code> <rest>"
  const matchWithSpace = telefono.match(/^\+(\d{1,3})\s+(.+)$/);
  if (matchWithSpace && codes.includes(matchWithSpace[1])) {
    return { code: matchWithSpace[1], num: matchWithSpace[2] };
  }

  // 2) Formato canónico sin espacio: "+<code><rest>"
  const matchNoSpace = telefono.match(/^\+(\d{1,3})(\d+)$/);
  if (matchNoSpace && codes.includes(matchNoSpace[1])) {
    return { code: matchNoSpace[1], num: matchNoSpace[2] };
  }

  // 3/4) Legacy: solo dígitos. Buscamos un código conocido al inicio.
  let parsedCode = "52";
  let parsedNum = telefono;
  for (const code of COUNTRY_CODES) {
    if (parsedNum.startsWith(code) && parsedNum.length > code.length) {
      parsedCode = code;
      parsedNum = parsedNum.substring(code.length);
      break;
    }
  }
  return { code: parsedCode, num: parsedNum };
};

export const useFamilyFormModal = (
  isOpen: boolean,
  initialData: FamilyFormData,
  onSubmitParent: (data: FamilyFormData) => void,
) => {
  // 1. Estados iniciales
  const [formData, setFormData] = useState<FamilyFormData>(initialData);
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
  // Guardamos SIEMPRE en formato canónico `+<código> <dígitos>` para
  // que coincida con lo que produce el import desde Excel y para
  // mantener el país inequívocamente detectable.
  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      setCountryCode(code);
      setFormData((prev) => ({
        ...prev,
        telefono: phoneNumber ? `+${code} ${phoneNumber}` : "",
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
        telefono: num ? `+${countryCode} ${num}` : "",
      }));
    },
    [countryCode],
  );

  const handleNumberChange = useCallback(
    (field: keyof FamilyFormData, value: string) => {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      const finalValue = isNaN(numValue) ? 0 : numValue;
      const updates: Partial<FamilyFormData> = { [field]: finalValue };

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
        confirmados: !nuevoEstado ? 0 : prev.confirmados,
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
    (field: keyof FamilyFormData, value: string | boolean | null) => {
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
