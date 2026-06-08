import { useState } from "react";
import { Users, Search, Plus } from "lucide-react";
import { UserDoc } from "@/types";
import { UsersTableView } from "./UsersTableView";
import UserFormModal from "./UserFormModal";
import ConfirmationModal from "./ConfirmationModal"; // Asumo que reutilizas el tuyo
import { useUsersManagement } from "../hooks/useUsersManagement";
import Loader from "@/features/front/components/Loader";

export default function UsersDashboard() {
  const {
    users,
    totalUsers,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    handleDeleteUser,
    handleSaveUser,
  } = useUsersManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDoc | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const openCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEdit = (user: UserDoc) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const onSave = async (data: UserDoc & { password?: string }) => {
    const success = await handleSaveUser(data, !!editingUser);
    if (success) setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <Loader fullscreen />
    );
  }

  return (
    <div className="p-4 md:p-8 w-full relative z-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2C2C29] flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white rounded-xl border border-[#EBE5DA] shadow-sm">
                <Users className="text-[#C5A669]" size={24} />
              </div>
              Gestión de Usuarios
            </h1>
            <p className="text-[#A8A29E] text-sm">
              Controla accesos, credenciales y roles.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#2C2C29] hover:bg-[#1F1F1D] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[#EBE5DA] shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Buscar por correo o UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] transition-all text-[#2C2C29]"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 border-l border-[#EBE5DA]">
            <span className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest">
              Total:
            </span>
            <span className="bg-[#E7F3EF] text-[#2D5B4F] px-2 py-1 rounded-md text-xs font-bold border border-[#CFE5DD]">
              {totalUsers}
            </span>
          </div>
        </div>

        {/* TABLE VIEW */}
        <UsersTableView
          users={users}
          onEdit={openEdit}
          onDelete={setConfirmDeleteUid}
        />
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
          initialData={editingUser}
          isSaving={isSaving}
        />
      )}

      {/* Ajusta esto si tu ConfirmationModal tiene otros props */}
      {confirmDeleteUid && (
        <ConfirmationModal
          isOpen={!!confirmDeleteUid}
          title="¿Eliminar usuario?"
          message="Esta acción es permanente y eliminará todas las credenciales y accesos de este usuario."
          onConfirm={() => {
            handleDeleteUser(confirmDeleteUid);
            setConfirmDeleteUid(null);
          }}
          onClose={() => setConfirmDeleteUid(null)}
          confirmText="Sí, eliminar"
          isDanger
        />
      )}
    </div>
  );
}
