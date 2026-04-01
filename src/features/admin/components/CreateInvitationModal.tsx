import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Calendar,
  Church,
  PartyPopper,
  Image as ImageIcon,
  Users,
  Save,
  Clock,
  Heart,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { EventLocation, EventType, Invitation, Modify, Padres } from "@/types";
import { InvitationsService } from "@/services/invitationsService";

type FormDataState  = Modify<Invitation , {
  fecha: string;
  usuariosPermitidos: string;
}>

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

  // Aplicamos el tipado al estado del formulario
  const [formData, setFormData] = useState<FormDataState>({
    id: "",
    nombre: "",
    tipo: "boda",
    fecha: "",
    imagenPortada: "",
    padresNovia: { mama: "", papa: "" },
    padresNovio: { mama: "", papa: "" },
    ceremonia: { nombreTemplo: "", hora: "", direccion: "", enlaceMaps: "" },
    recepcion: { nombreSalon: "", hora: "", direccion: "", enlaceMaps: "" },
    usuariosPermitidos: "",
  });

  // Rellenar el formulario si estamos en modo edición
  useEffect(() => {
    if (invitationToEdit && isOpen) {
      let formattedDate = "";
      if (invitationToEdit.fecha) {
        const dateObj = invitationToEdit.fecha.toDate()
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
        ceremonia: invitationToEdit.ceremonia || {
          nombreTemplo: "",
          hora: "",
          direccion: "",
          enlaceMaps: "",
        },
        recepcion: invitationToEdit.recepcion || {
          nombreSalon: "",
          hora: "",
          direccion: "",
          enlaceMaps: "",
        },
        usuariosPermitidos: invitationToEdit.usuariosPermitidos
          ? invitationToEdit.usuariosPermitidos.join(", ")
          : "",
      });
    } else if (!isOpen) {
      // Limpiar formulario al cerrar
      setFormData({
        id: "",
        nombre: "",
        tipo: "boda",
        fecha: "",
        imagenPortada: "",
        padresNovia: { mama: "", papa: "" },
        padresNovio: { mama: "", papa: "" },
        ceremonia: {
          nombreTemplo: "",
          hora: "",
          direccion: "",
          enlaceMaps: "",
        },
        recepcion: { nombreSalon: "", hora: "", direccion: "", enlaceMaps: "" },
        usuariosPermitidos: "",
      });
    }
  }, [invitationToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        id: formData.id,
        nombre: formData.nombre,
        tipo: formData.tipo,
        ubicacion: formData.recepcion.nombreSalon,
        fecha: new Date(`${formData.fecha}T12:00:00`),
        imagenPortada: formData.imagenPortada,
        padresNovia: formData.padresNovia,
        padresNovio: formData.padresNovio,
        ceremonia: formData.ceremonia,
        recepcion: formData.recepcion,
        usuariosPermitidos: formData.usuariosPermitidos
          .split(",")
          .map((uid) => uid.trim())
          .filter((uid) => uid.length > 0),
      };

      if (invitationToEdit?.id) {
        await InvitationsService.updateInvitation(invitationToEdit.id, payload);
      } else {
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

  const handleCeremoniaChange = (field: keyof EventLocation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ceremonia: { ...prev.ceremonia, [field]: value },
    }));
  };

  const handleRecepcionChange = (field: keyof EventLocation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      recepcion: { ...prev.recepcion, [field]: value },
    }));
  };

  const handlePadresNoviaChange = (field: keyof Padres, value: string) => {
    setFormData((prev) => ({
      ...prev,
      padresNovia: { ...prev.padresNovia, [field]: value },
    }));
  };

  const handlePadresNovioChange = (field: keyof Padres, value: string) => {
    setFormData((prev) => ({
      ...prev,
      padresNovio: { ...prev.padresNovio, [field]: value },
    }));
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
      <div className="px-6 md:px-8 py-5 border-b border-[#EBE5DA] flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C2C29]">
            {invitationToEdit ? "Editar Invitación" : "Crear Nueva Invitación"}
          </h2>
          <p className="text-xs text-[#A8A29E] mt-1 tracking-wide uppercase font-bold">
            Modo Administrador Root
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-[#A8A29E] hover:text-[#E17676] bg-[#FDFBF7] hover:bg-red-50 rounded-full transition-all border border-[#EBE5DA] hover:border-red-100"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden min-h-0 bg-[#F9F7F2]"
      >
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          {/* SECCIÓN 1: GENERAL */}
          <section className="space-y-5 bg-white p-6 rounded-[20px] border border-[#EBE5DA] shadow-sm">
            <h4 className="font-serif text-[#C5A669] text-lg border-b border-[#EBE5DA] pb-2 flex items-center gap-2">
              <Calendar size={18} /> Datos Generales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  ID Único (Para la URL) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. andrea-y-solis"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  disabled={!!invitationToEdit} // Deshabilita el campo si estamos editando
                />
                {!invitationToEdit && (
                  <p className="text-[10px] text-[#A8A29E] mt-1 ml-1">
                    Este será el enlace: bodajy.info/i/
                    <strong>{formData.id || "..."}</strong>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Nombre del Evento *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Andrea & Solís"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Tipo *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm appearance-none"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo: e.target.value as EventType,
                    })
                  }
                >
                  <option value="boda">Boda</option>
                  <option value="xv_anos">XV Años</option>
                  <option value="bautizo">Bautizo</option>
                  <option value="cumpleanos">Cumpleaños</option>
                </select>
              </div>

              {/* SELECTOR DE FECHA NATIVO */}
              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Fecha *
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A669] pointer-events-none"
                  />
                  <input
                    required
                    type="date"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm [color-scheme:light]"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Ruta Imagen Portada (Local) *
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm"
                    value={formData.imagenPortada}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        imagenPortada: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 1.5: PADRES DE LOS NOVIOS */}
          <section
            className={`space-y-5 bg-white p-6 rounded-[20px] border border-[#EBE5DA] shadow-sm ${formData.tipo !== "boda" ? "hidden" : ""}`}
          >
            <h4 className="font-serif text-[#C5A669] text-lg border-b border-[#EBE5DA] pb-2 flex items-center gap-2">
              <Heart size={18} /> Papás de los Novios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-5">
              {/* Papás de la Novia */}
              <div className="space-y-4">
                <h5 className="font-bold text-[#2C2C29] text-[11px] uppercase tracking-widest border-b border-[#EBE5DA] pb-1.5">
                  Familia de la Novia
                </h5>
                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1.5 ml-1">
                    Nombre de la Mamá
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. María Pérez"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                    value={formData.padresNovia.mama}
                    onChange={(e) =>
                      handlePadresNoviaChange("mama", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1.5 ml-1">
                    Nombre del Papá
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Gómez"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                    value={formData.padresNovia.papa}
                    onChange={(e) =>
                      handlePadresNoviaChange("papa", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Papás del Novio */}
              <div className="space-y-4">
                <h5 className="font-bold text-[#2C2C29] text-[11px] uppercase tracking-widest border-b border-[#EBE5DA] pb-1.5">
                  Familia del Novio
                </h5>
                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1.5 ml-1">
                    Nombre de la Mamá
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carmen López"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                    value={formData.padresNovio.mama}
                    onChange={(e) =>
                      handlePadresNovioChange("mama", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A5A] uppercase tracking-wider mb-1.5 ml-1">
                    Nombre del Papá
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Roberto Ruiz"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                    value={formData.padresNovio.papa}
                    onChange={(e) =>
                      handlePadresNovioChange("papa", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: CEREMONIA */}
          <section className="space-y-5 bg-white p-6 rounded-[20px] border border-[#EBE5DA] shadow-sm">
            <h4 className="font-serif text-[#C5A669] text-lg border-b border-[#EBE5DA] pb-2 flex items-center gap-2">
              <Church size={18} /> Ceremonia
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Lugar (Templo/Juzgado)
                </label>
                <input
                  type="text"
                  placeholder="Parroquia San Juan Bautista"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.ceremonia.nombreTemplo}
                  onChange={(e) =>
                    handleCeremoniaChange("nombreTemplo", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Calle, Colonia, Ciudad"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.ceremonia.direccion}
                  onChange={(e) =>
                    handleCeremoniaChange("direccion", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Enlace Google Maps
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.ceremonia.enlaceMaps}
                  onChange={(e) =>
                    handleCeremoniaChange("enlaceMaps", e.target.value)
                  }
                />
              </div>

              {/* CAMPO DE HORA NATIVO */}
              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Hora de Inicio
                </label>
                <div className="relative">
                  <Clock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A669] pointer-events-none"
                  />
                  <input
                    required
                    type="time"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm [color-scheme:light]"
                    value={formData.ceremonia.hora}
                    onChange={(e) =>
                      handleCeremoniaChange("hora", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: RECEPCIÓN */}
          <section className="space-y-5 bg-white p-6 rounded-[20px] border border-[#EBE5DA] shadow-sm">
            <h4 className="font-serif text-[#C5A669] text-lg border-b border-[#EBE5DA] pb-2 flex items-center gap-2">
              <PartyPopper size={18} /> Recepción
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Lugar (Salón/Hacienda)
                </label>
                <input
                  type="text"
                  placeholder="Hacienda el refugio"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.recepcion.nombreSalon}
                  onChange={(e) =>
                    handleRecepcionChange("nombreSalon", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Calle, Colonia, Ciudad"
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.recepcion.direccion}
                  onChange={(e) =>
                    handleRecepcionChange("direccion", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Enlace Google Maps
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] outline-none focus:border-[#C5A669] transition-all shadow-sm"
                  value={formData.recepcion.enlaceMaps}
                  onChange={(e) =>
                    handleRecepcionChange("enlaceMaps", e.target.value)
                  }
                />
              </div>

              {/* CAMPO DE HORA NATIVO */}
              <div>
                <label className="block text-xs font-bold text-[#2C2C29] uppercase tracking-wider mb-1.5 ml-1">
                  Hora de Inicio
                </label>
                <div className="relative">
                  <Clock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A669] pointer-events-none"
                  />
                  <input
                    required
                    type="time"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm [color-scheme:light]"
                    value={formData.recepcion.hora}
                    onChange={(e) =>
                      handleRecepcionChange("hora", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: PERMISOS (Asignación) */}
          <section className="space-y-5 bg-[#2C2C29] p-6 rounded-[20px] shadow-lg border border-[#2C2C29] text-[#FDFBF7]">
            <h4 className="font-serif text-[#C5A669] text-lg border-b border-white/10 pb-2 flex items-center gap-2">
              <Users size={18} /> Asignación de Usuarios
            </h4>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 ml-1">
                IDs de Firebase (Separados por coma) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="O6iMFY7zm0UazUmwhYhUftNcQ9u1, cVW297wGelVPMGFwE5Ya..."
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/30 text-white focus:ring-2 focus:ring-[#C5A669]/50 focus:border-[#C5A669] outline-none transition-all shadow-inner resize-none placeholder:text-white/20 font-mono text-sm"
                value={formData.usuariosPermitidos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usuariosPermitidos: e.target.value,
                  })
                }
              />
              <p className="text-[10px] text-white/50 mt-2 ml-1">
                Estos usuarios serán los únicos que verán esta invitación en su
                panel.
              </p>
            </div>
          </section>
        </div>

        {/* Botones de Acción */}
        <div className="p-5 md:p-6 border-t border-[#EBE5DA] bg-white flex gap-4 shrink-0 z-10 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#FDFBF7] text-[#2C2C29] border border-[#EBE5DA] rounded-xl hover:bg-white hover:border-[#C5A669]/50 hover:text-[#C5A669] font-bold text-sm tracking-wide transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#C5A669] text-white rounded-xl hover:bg-[#B39358] font-bold text-sm tracking-wide shadow-lg shadow-[#C5A669]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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