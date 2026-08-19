import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Church,
  PartyPopper,
  Image as ImageIcon,
  Save,
  Heart,
  Palette,
  MessageCircle,
  BellRing,
  Info,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { EventType, Invitation, Modify } from "@/types";
import { InvitationsService } from "@/services/invitationsService";
import { Timestamp } from "firebase/firestore";

type FormDataState = Modify<
  Invitation,
  {
    fecha: string;
  }
>;

interface CreateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  invitationToEdit?: Invitation | null;
}

const CreateInvitationModal: React.FC<CreateInvitationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invitationToEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial limpio y seguro
  const initialState: FormDataState = {
    id: "",
    nombre: "",
    tipo: "boda",
    fecha: "",
    imagenPortada: "",
    padresNovia: { mama: "", papa: "" },
    padresNovio: { mama: "", papa: "" },
    ceremonia: { nombreTemplo: "", hora: "", direccion: "", enlaceMaps: "" },
    recepcion: { nombreSalon: "", hora: "", direccion: "", enlaceMaps: "" },
    configuracionVisual: {
      temaGlobal: "default",
      fondos: { app: "bg-texture", contenedorCentral: "bg-[#606954]" },
      secciones: {
        quote: { mostrar: true },
        padresYPadrinos: { mostrar: true },
        galeria: { mostrar: true, variante: "carrusel" },
        mesaRegalos: { mostrar: true, showCash: true },
      },
      estilosComponentes: {
        contador: {
          textClassName: "text-[#e8e6d9]",
          btnClassName: "bg-button-dark",
        },
        calendario: {
          bgClassName: "bg-[#606954]",
          textClassName: "text-[#e8e6d9]",
          heartClassName: "text-[#e8e6d9]",
        },
      },
    },
    mensajeInicial: "",
    mensajeRecordatorio: "",
  };

  const [formData, setFormData] = useState<FormDataState>(initialState);

  useEffect(() => {
    if (invitationToEdit && isOpen) {
      let formattedDate = "";
      if (invitationToEdit.fecha) {
        // Manejo seguro de la fecha viniendo de Firestore
        const dateObj =
          typeof invitationToEdit.fecha.toDate === "function"
            ? invitationToEdit.fecha.toDate()
            : new Date(invitationToEdit.fecha as unknown as string);
        formattedDate = dateObj.toISOString().split("T")[0];
      }

      setFormData({
        id: invitationToEdit.id || "",
        nombre: invitationToEdit.nombre || "",
        tipo: invitationToEdit.tipo || "boda",
        fecha: formattedDate,
        imagenPortada: invitationToEdit.imagenPortada || "",
        padresNovia: invitationToEdit.padresNovia || { mama: "", papa: "" },
        padresNovio: invitationToEdit.padresNovio || { mama: "", papa: "" },
        ceremonia: invitationToEdit.ceremonia || initialState.ceremonia,
        recepcion: invitationToEdit.recepcion || initialState.recepcion,
        configuracionVisual:
          invitationToEdit.configuracionVisual ||
          initialState.configuracionVisual,
        mensajeInicial: invitationToEdit.mensajeInicial || "",
        mensajeRecordatorio: invitationToEdit.mensajeRecordatorio || "",
      });
    } else if (!isOpen) {
      setFormData(initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Tipado estricto del payload omitiendo el ID si es actualización
      const payload: Omit<Invitation, "id"> & {
        id?: string;
      } = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        ubicacion: formData.recepcion.nombreSalon || "",
        fecha: Timestamp.fromDate(new Date(`${formData.fecha}T12:00:00`)),
        imagenPortada: formData.imagenPortada,
        padresNovia: formData.padresNovia,
        padresNovio: formData.padresNovio,
        ceremonia: formData.ceremonia,
        recepcion: formData.recepcion,
        configuracionVisual: formData.configuracionVisual,
        mensajeInicial: formData.mensajeInicial || "",
        mensajeRecordatorio: formData.mensajeRecordatorio || "",
      };

      if (invitationToEdit?.id) {
        await InvitationsService.updateInvitation(invitationToEdit.id, payload);
      } else {
        payload.id = formData.id; // Solo enviamos el ID manual en creación
        await InvitationsService.createInvitation(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error guardando invitación:", error);
      alert("Hubo un error al guardar la invitación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers con tipado estricto (Cero 'any') ---

  const handleChange = <K extends keyof FormDataState>(
    field: K,
    value: FormDataState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = <
    P extends "ceremonia" | "recepcion" | "padresNovia" | "padresNovio",
    K extends keyof FormDataState[P],
  >(
    parent: P,
    field: K,
    value: FormDataState[P][K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  // Handlers específicos para la configuración visual profunda
  const handleFondoChange = (
    field: "app" | "contenedorCentral",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      configuracionVisual: {
        ...prev.configuracionVisual,
        fondos: { ...(prev.configuracionVisual?.fondos || {}), [field]: value },
      },
    }));
  };

  const handleSeccionChange = (
    seccion: "quote" | "padresYPadrinos" | "galeria" | "mesaRegalos",
    field: "mostrar" | "variante" | "showCash",
    value: boolean | string,
  ) => {
    setFormData((prev) => {
      const config = prev.configuracionVisual || {};
      const secciones = config.secciones || {};
      const targetSection =
        (secciones[seccion] as Record<string, unknown>) || {};

      return {
        ...prev,
        configuracionVisual: {
          ...config,
          secciones: {
            ...secciones,
            [seccion]: { ...targetSection, [field]: value },
          },
        },
      };
    });
  };

  const handleEstilosChange = (
    componente: "contador" | "calendario",
    field: string,
    value: string,
  ) => {
    setFormData((prev) => {
      const config = prev.configuracionVisual || {};
      const estilos = config.estilosComponentes || {};
      const targetComponent =
        (estilos[componente] as Record<string, string>) || {};

      return {
        ...prev,
        configuracionVisual: {
          ...config,
          estilosComponentes: {
            ...estilos,
            [componente]: { ...targetComponent, [field]: value },
          },
        },
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose} maxWidth="max-w-6xl">
      <div className="px-6 md:px-8 py-5 border-b border-sand-200 flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-xl font-serif font-bold text-charcoal-800">
            {invitationToEdit ? "Editar Invitación" : "Crear Nueva Invitación"}
          </h2>
          <p className="text-xs text-[#A8A29E] mt-1 tracking-wide uppercase font-bold">
            Modo Administrador Root
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-[#A8A29E] hover:text-[#E17676] bg-[#FDFBF7] rounded-full border border-sand-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden min-h-0 bg-paper"
      >
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
              {/* SECCIÓN 1: GENERAL */}
              <section className="space-y-5 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                <h4 className="font-serif text-gold-500 text-lg border-b border-sand-200 pb-2 flex items-center gap-2">
                  <Calendar size={18} /> Datos Generales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      ID Único (Para la URL) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. andrea-y-solis"
                      disabled={!!invitationToEdit}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      value={formData.id}
                      onChange={(e) =>
                        handleChange(
                          "id",
                          e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Nombre del Evento *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm"
                      value={formData.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Tipo *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm"
                      value={formData.tipo}
                      onChange={(e) =>
                        handleChange("tipo", e.target.value as EventType)
                      }
                    >
                      <option value="boda">Boda</option>
                      <option value="xv_anos">XV Años</option>
                      <option value="bautizo">Bautizo</option>
                      <option value="cumpleanos">Cumpleaños</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Fecha *
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm"
                      value={formData.fecha}
                      onChange={(e) => handleChange("fecha", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Ruta Imagen Portada *
                    </label>
                    <div className="relative">
                      <ImageIcon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]"
                      />
                      <input
                        required
                        type="text"
                        placeholder="/img/portada.png"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm"
                        value={formData.imagenPortada}
                        onChange={(e) =>
                          handleChange("imagenPortada", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 2: CONFIGURACIÓN VISUAL ROBUSTA */}
              <section className="space-y-6 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                <h4 className="font-serif text-gold-500 text-lg border-b border-sand-200 pb-2 flex items-center gap-2">
                  <Palette size={18} /> Configuración Visual Avanzada
                </h4>

                {/* Fondos */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-charcoal-800 uppercase tracking-widest border-b border-sand-100 pb-1">
                    Colores y Fondos
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Fondo App (Clase CSS)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. bg-texture o bg-[#fafafa]"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={formData.configuracionVisual?.fondos?.app || ""}
                        onChange={(e) =>
                          handleFondoChange("app", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Fondo Contenedor Central
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. bg-[#606954]"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={
                          formData.configuracionVisual?.fondos
                            ?.contenedorCentral || ""
                        }
                        onChange={(e) =>
                          handleFondoChange("contenedorCentral", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Estilos Componentes */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-charcoal-800 uppercase tracking-widest border-b border-sand-100 pb-1">
                    Estilos de Componentes
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contador */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Color Texto Contador
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. text-[#e8e6d9]"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={
                          formData.configuracionVisual?.estilosComponentes
                            ?.contador?.textClassName || ""
                        }
                        onChange={(e) =>
                          handleEstilosChange(
                            "contador",
                            "textClassName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Color Botón Calendario
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. bg-[#4a5240] text-white"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={
                          formData.configuracionVisual?.estilosComponentes
                            ?.contador?.btnClassName || ""
                        }
                        onChange={(e) =>
                          handleEstilosChange(
                            "contador",
                            "btnClassName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    {/* Calendario */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Fondo Widget Calendario
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. bg-[#606954]"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={
                          formData.configuracionVisual?.estilosComponentes
                            ?.calendario?.bgClassName || ""
                        }
                        onChange={(e) =>
                          handleEstilosChange(
                            "calendario",
                            "bgClassName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                        Corazón Calendario
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. text-[#e8e6d9]"
                        className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] text-sm outline-none"
                        value={
                          formData.configuracionVisual?.estilosComponentes
                            ?.calendario?.heartClassName || ""
                        }
                        onChange={(e) =>
                          handleEstilosChange(
                            "calendario",
                            "heartClassName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Secciones (Toggles) */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-charcoal-800 uppercase tracking-widest border-b border-sand-100 pb-1">
                    Mostrar / Ocultar Secciones
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-charcoal-800 bg-[#FDFBF7] p-2 rounded-lg border border-sand-200">
                      <input
                        type="checkbox"
                        className="accent-gold-500 w-4 h-4"
                        checked={
                          formData.configuracionVisual?.secciones?.quote
                            ?.mostrar ?? true
                        }
                        onChange={(e) =>
                          handleSeccionChange(
                            "quote",
                            "mostrar",
                            e.target.checked,
                          )
                        }
                      />
                      Frase Inicial
                    </label>
                    <label className="flex items-center gap-2 text-sm text-charcoal-800 bg-[#FDFBF7] p-2 rounded-lg border border-sand-200">
                      <input
                        type="checkbox"
                        className="accent-gold-500 w-4 h-4"
                        checked={
                          formData.configuracionVisual?.secciones
                            ?.padresYPadrinos?.mostrar ?? true
                        }
                        onChange={(e) =>
                          handleSeccionChange(
                            "padresYPadrinos",
                            "mostrar",
                            e.target.checked,
                          )
                        }
                      />
                      Padres y Padrinos
                    </label>
                    <label className="flex items-center gap-2 text-sm text-charcoal-800 bg-[#FDFBF7] p-2 rounded-lg border border-sand-200">
                      <input
                        type="checkbox"
                        className="accent-gold-500 w-4 h-4"
                        checked={
                          formData.configuracionVisual?.secciones?.galeria
                            ?.mostrar ?? true
                        }
                        onChange={(e) =>
                          handleSeccionChange(
                            "galeria",
                            "mostrar",
                            e.target.checked,
                          )
                        }
                      />
                      Galería de Fotos
                    </label>
                    <label className="flex items-center gap-2 text-sm text-charcoal-800 bg-[#FDFBF7] p-2 rounded-lg border border-sand-200">
                      <input
                        type="checkbox"
                        className="accent-gold-500 w-4 h-4"
                        checked={
                          formData.configuracionVisual?.secciones?.mesaRegalos
                            ?.mostrar ?? true
                        }
                        onChange={(e) =>
                          handleSeccionChange(
                            "mesaRegalos",
                            "mostrar",
                            e.target.checked,
                          )
                        }
                      />
                      Mesa de Regalos
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-8">
              {/* PADRES DE LOS NOVIOS (Mantenido intacto) */}
              {formData.tipo === "boda" && (
                <section className="space-y-5 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                  <h4 className="font-serif text-gold-500 text-lg border-b border-sand-200 pb-2 flex items-center gap-2">
                    <Heart size={18} /> Papás de los Novios
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Familia Novia */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-charcoal-800 text-[11px] uppercase tracking-widest border-b border-sand-100 pb-1">
                        Familia de la Novia
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                            Mamá
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] outline-none"
                            value={formData.padresNovia.mama}
                            onChange={(e) =>
                              handleNestedChange(
                                "padresNovia",
                                "mama",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                            Papá
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] outline-none"
                            value={formData.padresNovia.papa}
                            onChange={(e) =>
                              handleNestedChange(
                                "padresNovia",
                                "papa",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {/* Familia Novio */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-charcoal-800 text-[11px] uppercase tracking-widest border-b border-sand-100 pb-1">
                        Familia del Novio
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                            Mamá
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] outline-none"
                            value={formData.padresNovio.mama}
                            onChange={(e) =>
                              handleNestedChange(
                                "padresNovio",
                                "mama",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A5A5A] uppercase mb-1">
                            Papá
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-[#FDFBF7] outline-none"
                            value={formData.padresNovio.papa}
                            onChange={(e) =>
                              handleNestedChange(
                                "padresNovio",
                                "papa",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* CEREMONIA */}
              <section className="space-y-5 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                <h4 className="font-serif text-gold-500 text-lg border-b border-sand-200 pb-2 flex items-center gap-2">
                  <Church size={18} /> Ceremonia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Lugar (Templo/Juzgado)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.ceremonia.nombreTemplo}
                      onChange={(e) =>
                        handleNestedChange(
                          "ceremonia",
                          "nombreTemplo",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.ceremonia.direccion}
                      onChange={(e) =>
                        handleNestedChange(
                          "ceremonia",
                          "direccion",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Maps (URL)
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.ceremonia.enlaceMaps}
                      onChange={(e) =>
                        handleNestedChange(
                          "ceremonia",
                          "enlaceMaps",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.ceremonia.hora}
                      onChange={(e) =>
                        handleNestedChange("ceremonia", "hora", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              {/* RECEPCIÓN */}
              <section className="space-y-5 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                <h4 className="font-serif text-gold-500 text-lg border-b border-sand-200 pb-2 flex items-center gap-2">
                  <PartyPopper size={18} /> Recepción
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Lugar (Salón/Hacienda)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.recepcion.nombreSalon}
                      onChange={(e) =>
                        handleNestedChange(
                          "recepcion",
                          "nombreSalon",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.recepcion.direccion}
                      onChange={(e) =>
                        handleNestedChange(
                          "recepcion",
                          "direccion",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Maps (URL)
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.recepcion.enlaceMaps}
                      onChange={(e) =>
                        handleNestedChange(
                          "recepcion",
                          "enlaceMaps",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5 ml-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] outline-none"
                      value={formData.recepcion.hora}
                      onChange={(e) =>
                        handleNestedChange("recepcion", "hora", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              {/* MENSAJES DE WHATSAPP */}
              <section className="space-y-5 bg-white p-6 rounded-[20px] border border-sand-200 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-sand-200 pb-3">
                  <h4 className="font-serif text-gold-500 text-lg flex items-center gap-2">
                    <MessageCircle size={18} /> Mensajes de WhatsApp
                  </h4>
                  <div className="relative group/tooltip flex items-center justify-center cursor-help shrink-0 p-1">
                    <Info
                      size={18}
                      className="text-gold-500 hover:text-[#B39358] transition-colors"
                    />
                    <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-white border border-sand-200 shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-2xl text-xs text-[#5A5A5A] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                      <p className="leading-relaxed mb-2">
                        Si dejas el campo vacío, se usa el mensaje por defecto
                        del sistema. Puedes usar las siguientes variables, que
                        se reemplazan al enviar:
                      </p>
                      <ul className="space-y-1 font-mono text-[11px] text-charcoal-800">
                        <li>
                          <b>{"{nombreFamilia}"}</b> — nombre de la familia
                        </li>
                        <li>
                          <b>{"{numInvitados}"}</b> — solo el número de
                          cupos
                        </li>
                        <li>
                          <b>{"{totalLugares}"}</b> — 1 lugar / N lugares
                          (auto)
                        </li>
                        <li>
                          <b>{"{link}"}</b> — URL de la invitación
                        </li>
                        <li>
                          <b>{"{fechaLimite}"}</b> — fecha límite
                          formateada
                        </li>
                      </ul>
                      <p className="leading-relaxed mt-2">
                        Para <b>negritas</b> en WhatsApp usa{" "}
                        <code className="bg-sand-100 px-1 rounded">*texto*</code>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5A5A5A] leading-relaxed">
                  Personaliza el mensaje inicial y de recordatorio que se envía
                  por WhatsApp a cada familia. Déjalo vacío para usar el
                  mensaje por defecto.
                </p>

                {/* Mensaje inicial */}
                <div>
                  <label className="text-[10px] font-bold text-[#5A5A5A] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <MessageCircle size={12} /> Mensaje Inicial
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Ej: ¡Hola {nombreFamilia}! Les enviamos..."
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm text-sm resize-y leading-relaxed"
                    value={formData.mensajeInicial}
                    onChange={(e) =>
                      handleChange("mensajeInicial", e.target.value)
                    }
                  />
                </div>

                {/* Mensaje recordatorio */}
                <div>
                  <label className="text-[10px] font-bold text-[#5A5A5A] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <BellRing size={12} /> Mensaje de Recordatorio
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Ej: ✨ Queridos {nombreFamilia}, aún no hemos..."
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-[#FDFBF7] focus:border-gold-500 outline-none transition-all shadow-sm text-sm resize-y leading-relaxed"
                    value={formData.mensajeRecordatorio}
                    onChange={(e) =>
                      handleChange("mensajeRecordatorio", e.target.value)
                    }
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER BOTONES */}
        <div className="p-5 md:p-6 border-t border-sand-200 bg-white flex gap-4 shrink-0 z-10 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#FDFBF7] text-charcoal-800 border border-sand-200 rounded-xl hover:bg-white transition-all font-bold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gold-500 text-white rounded-xl hover:bg-[#B39358] transition-all font-bold flex justify-center items-center gap-2 shadow-lg shadow-gold-500/20 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <>
                <Save size={18} />{" "}
                {invitationToEdit ? "Guardar Cambios" : "Guardar Invitación"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvitationModal;
