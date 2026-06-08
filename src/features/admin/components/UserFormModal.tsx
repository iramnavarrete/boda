import React, { useState, useEffect } from "react";
import Modal from "@/features/shared/components/Modal";
import { RoleType, UserDoc } from "@/types";
import { cn } from "@heroui/theme";
import {
  Check,
  Key,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Save,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Asegúrate de que esta ruta apunte a tu config de cliente

interface InvitationOption {
  id: string;
  nombre: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserDoc & { password?: string }) => void | Promise<void>;
  initialData: UserDoc | null;
  isSaving: boolean; // Recibimos el estado de carga desde el padre
}

function UserFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: UserFormModalProps) {
  // --- ESTADOS DEL FORMULARIO ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRootAdmin, setIsRootAdmin] = useState(false);
  const [invitationsMap, setInvitationsMap] = useState<
    Record<string, RoleType>
  >({});
  const [changePasswordMode, setChangePasswordMode] = useState(true);

  const [selectedInvId, setSelectedInvId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("guardia");

  // --- ESTADOS PARA INVITACIONES DINÁMICAS ---
  const [availableInvitations, setAvailableInvitations] = useState<
    InvitationOption[]
  >([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEmail(initialData.email);
        setIsRootAdmin(initialData.isRootAdmin || false);
        setInvitationsMap(initialData.invitationsMap || {});
        setPassword("");
        setChangePasswordMode(false);
      } else {
        setEmail("");
        setPassword("");
        setIsRootAdmin(false);
        setInvitationsMap({});
        setChangePasswordMode(true);
      }
      setSelectedInvId("");
      setSelectedRole("guardia");

      // Cargar la lista real de invitaciones
      fetchInvitations();
    }
  }, [isOpen, initialData]);

  // Función para obtener invitaciones reales desde Firestore
  const fetchInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      const querySnapshot = await getDocs(collection(db, "invitations"));
      const invs: InvitationOption[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invs.push({
          id: doc.id,
          nombre: data.nombre || `Invitación (${doc.id})`,
        });
      });
      setAvailableInvitations(invs);
    } catch (error) {
      console.error("Error al cargar invitaciones:", error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const handleAddAccess = () => {
    if (!selectedInvId) return;
    setInvitationsMap((prev) => ({ ...prev, [selectedInvId]: selectedRole }));
    setSelectedInvId("");
  };

  const handleRemoveAccess = (invId: string) => {
    setInvitationsMap((prev) => {
      const copy = { ...prev };
      delete copy[invId];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const payload: Partial<UserDoc> & { password?: string } = {
      uid: initialData?.uid || "",
      email,
      isRootAdmin,
      invitationsMap,
    };

    if (password && changePasswordMode) {
      payload.password = password;
    }

    // Pasamos el payload al padre (UsersDashboard), que es el que maneja isSaving
    await onSave(payload as UserDoc & { password?: string });
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
      <div className="px-6 py-5 border-b border-[#EBE5DA] flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C2C29]">
            {initialData ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Configura los datos de acceso y roles.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="p-2 text-[#A8A29E] hover:text-[#2C2C29] bg-[#FDFBF7] rounded-full border border-[#EBE5DA] disabled:opacity-50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden bg-[#F9F7F2]/50"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CREDENCIALES */}
          <section className="bg-white p-5 rounded-2xl border border-[#EBE5DA] shadow-sm">
            <h3 className="text-sm font-bold text-[#2C2C29] mb-4 flex items-center gap-2">
              <Key size={16} className="text-[#C5A669]" /> Credenciales de
              Acceso
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1.5 ml-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSaving}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#2C2C29] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm text-sm disabled:opacity-60"
                    placeholder="usuario@correo.com"
                  />
                </div>
              </div>
              {initialData && !changePasswordMode ? (
                <button
                  type="button"
                  onClick={() => setChangePasswordMode(true)}
                  disabled={isSaving}
                  className="text-xs font-bold text-[#C5A669] hover:text-[#B39358] uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
                >
                  <KeyRound size={12} /> Modificar Contraseña
                </button>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1.5 ml-1">
                    Contraseña {initialData ? "(Nueva)" : "*"}
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      required={!initialData}
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSaving}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] focus:bg-white text-[#2C2C29] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm text-sm disabled:opacity-60"
                      placeholder="Ingresa la contraseña"
                    />
                  </div>
                  {initialData && (
                    <button
                      type="button"
                      onClick={() => {
                        setChangePasswordMode(false);
                        setPassword("");
                      }}
                      disabled={isSaving}
                      className="mt-2 text-[10px] text-stone-400 hover:text-stone-600 underline disabled:opacity-50"
                    >
                      Cancelar cambio de contraseña
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ACCESO ROOT */}
          <section className="bg-white p-5 rounded-2xl border border-[#EBE5DA] shadow-sm">
            <button
              type="button"
              onClick={() => setIsRootAdmin(!isRootAdmin)}
              disabled={isSaving}
              className="flex items-center gap-3 w-full text-left group disabled:opacity-60"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                  isRootAdmin
                    ? "bg-[#2C2C29] border-[#2C2C29] text-[#C5A669]"
                    : "bg-[#FDFBF7] border-[#EBE5DA] text-transparent group-hover:border-[#C5A669]",
                )}
              >
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <span
                  className={cn(
                    "block text-sm font-bold transition-colors",
                    isRootAdmin ? "text-[#2C2C29]" : "text-[#5A5A5A]",
                  )}
                >
                  Acceso Total (Root Admin)
                </span>
                <span className="text-xs text-[#A8A29E] block mt-0.5">
                  Si marcas esta opción, el usuario tendrá control absoluto
                  sobre <b>todas</b> las invitaciones.
                </span>
              </div>
            </button>
          </section>

          {/* ASIGNACIÓN DE EVENTOS */}
          {!isRootAdmin && (
            <section className="bg-white p-5 rounded-2xl border border-[#EBE5DA] shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-sm font-bold text-[#2C2C29] mb-4 flex items-center gap-2">
                <Shield size={16} className="text-[#C5A669]" /> Eventos
                Asignados
              </h3>

              <div className="flex flex-col md:flex-row gap-3 items-end mb-4 p-3 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1.5 ml-1">
                    Evento
                  </label>
                  <select
                    value={selectedInvId}
                    onChange={(e) => setSelectedInvId(e.target.value)}
                    disabled={isSaving || isLoadingInvitations}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#EBE5DA] bg-white focus:outline-none focus:border-[#C5A669] text-sm text-[#2C2C29] disabled:opacity-60"
                  >
                    <option value="">
                      {isLoadingInvitations
                        ? "Cargando..."
                        : "-- Selecciona un evento --"}
                    </option>
                    {availableInvitations.map((inv) => (
                      <option
                        key={inv.id}
                        value={inv.id}
                        disabled={!!invitationsMap[inv.id]}
                      >
                        {inv.nombre}{" "}
                        {invitationsMap[inv.id] ? "(Ya asignado)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32 shrink-0">
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1.5 ml-1">
                    Rol
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as RoleType)
                    }
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#EBE5DA] bg-white focus:outline-none focus:border-[#C5A669] text-sm text-[#2C2C29] disabled:opacity-60"
                  >
                    <option value="guardia">Guardia</option>
                    <option value="host">Anfitrión</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddAccess}
                  disabled={!selectedInvId || isSaving}
                  className="w-full md:w-auto h-[42px] px-4 bg-[#2C2C29] hover:bg-[#1F1F1D] text-[#C5A669] rounded-lg font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Añadir
                </button>
              </div>

              {Object.keys(invitationsMap).length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-sm italic border border-dashed border-[#EBE5DA] rounded-xl">
                  Este usuario no tiene acceso a ningún evento.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(invitationsMap).map(([invId, role]) => {
                    const invName =
                      availableInvitations.find((i) => i.id === invId)
                        ?.nombre || invId;

                    return (
                      <div
                        key={invId}
                        className="flex items-center justify-between p-3 bg-white border border-[#EBE5DA] rounded-xl shadow-sm hover:border-[#C5A669]/30 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#2C2C29]">
                            {invName}
                          </p>
                          <p className="text-[10px] text-[#A8A29E] font-mono">
                            ID: {invId}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A669] bg-[#FDFBF7] px-2 py-1 rounded-md border border-[#EBE5DA]">
                            {role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAccess(invId)}
                            disabled={isSaving}
                            className="p-1.5 text-[#A8A29E] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 md:p-6 border-t border-[#EBE5DA] bg-white flex gap-3 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl text-[#5A5A5A] font-bold text-sm bg-[#FDFBF7] border border-[#EBE5DA] hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-[#C5A669] text-white font-bold text-sm shadow-lg shadow-[#C5A669]/20 hover:bg-[#B39358] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            {initialData ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
