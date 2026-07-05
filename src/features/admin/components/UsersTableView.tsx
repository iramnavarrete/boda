import React from "react";
import { Edit2, Trash2, ShieldCheck, Building } from "lucide-react";
import { UserDoc } from "@/types";
import { auth } from "@/lib/firebase/config";

interface UsersTableViewProps {
  users: UserDoc[];
  onEdit: (user: UserDoc) => void;
  onDelete: (uid: string) => void;
}

const UserAvatar = ({ email }: { email: string }) => {
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  return <span className="font-serif font-bold text-lg">{initial}</span>;
};

export const UsersTableView: React.FC<UsersTableViewProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  const currentUid = auth.currentUser?.uid;

  if (users.length === 0) {
    return (
      <div className="p-16 text-center text-[#A8A29E] bg-white rounded-3xl border border-[#EBE5DA]">
        No se encontraron usuarios.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#EBE5DA] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDFBF7] border-b border-[#EBE5DA]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
                Usuario
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
                Nivel de Acceso
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
                Eventos Asignados
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE5DA]/60">
            {users.map((user) => {
              const assignedCount = Object.keys(
                user.invitationsMap || {},
              ).length;
              const isCurrentUser = user.uid === currentUid;

              return (
                <tr
                  key={user.uid}
                  className="hover:bg-[#FDFBF7]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EBE5DA]/30 border border-[#EBE5DA] flex items-center justify-center text-[#C5A669]">
                        <UserAvatar email={user.email} />
                      </div>
                      <div>
                        <p className="font-bold text-[#2C2C29] text-sm">
                          {user.email}
                        </p>
                        <p className="text-[10px] font-mono text-[#A8A29E]">
                          UID: {user.uid}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isRootAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2C2C29] text-[#C5A669] text-[10px] font-bold uppercase tracking-widest border border-[#C5A669]/30">
                        <ShieldCheck size={12} /> Root Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-widest border border-stone-200">
                        Usuario Estándar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isRootAdmin ? (
                      <span className="text-xs text-stone-500 italic">
                        Acceso Total
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-[#C5A669]" />
                        <span className="text-sm font-bold text-[#2C2C29]">
                          {assignedCount}
                        </span>
                        <span className="text-xs text-stone-500">
                          invitaciones
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-[#A8A29E] hover:text-[#C5A669] hover:bg-[#FDFBF7] border border-transparent hover:border-[#EBE5DA] rounded-lg transition-all"
                        title="Editar Usuario"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(user.uid)}
                        disabled={isCurrentUser}
                        className="p-2 text-[#A8A29E] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all disabled:opacity-30"
                        title="Eliminar Usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
