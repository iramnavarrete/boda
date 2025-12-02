import {
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  Unlock,
  Lock,
} from "lucide-react";
import { Guest } from "../../../../types/types";
import { IconBrandWhatsapp } from "@tabler/icons-react";

interface GuestsTableProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  viewMode: "list" | "table";
  onSelectGuest: (id: string) => void;
  onSelectAll: (guests: Guest[]) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
}

export default function GuestsTable({
  guests,
  selectedGuests,
  viewMode,
  onSelectGuest,
  onSelectAll,
  onEdit,
  onDelete,
  onSendWhatsApp,
}: GuestsTableProps) {
  return (
    <div
      className={`hidden ${
        viewMode === "table" ? "md:block" : ""
      } bg-white shadow-sm rounded-xl border border-stone-200 overflow-hidden`}
    >
      <table className="min-w-full divide-y divide-stone-200">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-6 py-3 text-left flex">
              <button
                onClick={() => onSelectAll(guests)}
                className="text-stone-400 hover:text-stone-600"
              >
                {selectedGuests.size === guests.length ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">
              Invitado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
              Edición
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
              Cupos
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
              Estado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-200">
          {guests.map((g) => (
            <tr
              key={g.id}
              className={`hover:bg-stone-50 ${
                selectedGuests.has(g.id) ? "bg-yellow-50/50" : ""
              }`}
            >
              <td className="px-6 py-4">
                <button
                  onClick={() => onSelectGuest(g.id)}
                  className={
                    selectedGuests.has(g.id)
                      ? "text-yellow-600"
                      : "text-stone-300"
                  }
                >
                  {selectedGuests.has(g.id) ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-stone-900">{g.nombre}</div>
                <div className="text-xs text-stone-500 font-mono">
                  ID: {g.id}
                </div>
              </td>
              <td className="px-6 py-4 text-left">
                <div className="text-xs text-stone-400 flex justify-center">
                  {g.cambiosPermitidos ? (
                    <Unlock size={16} className="text-green-600" />
                  ) : (
                    <Lock size={16} className="text-red-600" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center font-bold">
                {g.asistencia === true ? g.confirmados : 0} /{" "}
                <span className="text-stone-400">{g.invitados}</span>
              </td>
              <td className="px-6 py-4 text-center">
                {g.asistencia === null ? (
                  <span className="text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded-full">
                    Pendiente
                  </span>
                ) : g.asistencia === false ? (
                  <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full">
                    No asistirá
                  </span>
                ) : (
                  <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                    Confirmado
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  {g.telefono && g.telefono !== "" && (
                    <button
                      title="Enviar Whatsapp"
                      onClick={() => onSendWhatsApp(g)}
                      className="text-green-600 flex justify-center items-center relative"
                    >
                      <IconBrandWhatsapp size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(g)}
                    className="text-yellow-600"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(g)}
                    className="text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
