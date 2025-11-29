import {
  CheckSquare,
  Square,
  Edit2,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { Guest } from "../../../../types/types";

interface GuestsCardsProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  viewMode: "list" | "table";
  onSelectGuest: (id: string) => void;
  onSelectAll: (guests: Guest[]) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
}

export default function GuestsCards({
  guests,
  selectedGuests,
  viewMode,
  onSelectGuest,
  onSelectAll,
  onEdit,
  onDelete,
  onSendWhatsApp,
}: GuestsCardsProps) {
  return (
    <div
      className={`${
        viewMode === "table" ? "md:hidden" : ""
      } grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
    >
      <div className="col-span-full flex justify-end">
        <button
          onClick={() => onSelectAll(guests)}
          className="text-xs font-medium text-stone-500 flex items-center gap-1 mb-2"
        >
          {selectedGuests.size === guests.length
            ? "Deseleccionar todos"
            : "Seleccionar todos"}{" "}
          {selectedGuests.size === guests.length ? (
            <CheckSquare size={14} />
          ) : (
            <Square size={14} />
          )}
        </button>
      </div>
      {guests.map((g) => (
        <div
          key={g.id}
          className={`bg-white rounded-xl shadow-sm border p-5 ${
            selectedGuests.has(g.id)
              ? "border-yellow-400 ring-1 ring-yellow-400"
              : "border-stone-200"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectGuest(g.id)}
                className={
                  selectedGuests.has(g.id)
                    ? "text-yellow-600"
                    : "text-stone-300"
                }
              >
                {selectedGuests.has(g.id) ? (
                  <CheckSquare size={24} />
                ) : (
                  <Square size={24} />
                )}
              </button>
              <div>
                <h3 className="font-semibold text-stone-800">{g.nombre}</h3>
                <p className="text-xs text-stone-500 font-mono">ID: {g.id}</p>
              </div>
            </div>
            <div className="text-xs font-bold bg-stone-100 px-2 py-1 rounded">
              {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-stone-100">
            <div className="text-xs text-stone-400">
              {g.cambiosPermitidos ? "Editable" : "Bloqueado"}
            </div>
            <div className="flex gap-2">
              {g.telefono && g.telefono !== "" && (
                <button
                  title="Enviar Whatsapp"
                  onClick={() => onSendWhatsApp(g)}
                  className="bg-green-50 text-green-600 p-2 rounded-lg flex justify-center items-center relative"
                >
                  <MessageCircle size={18} />
                  <Phone
                    size={9}
                    className="absolute top-[13px] left-[12px] z-10"
                  />
                </button>
              )}
              <button
                onClick={() => onEdit(g)}
                className="bg-stone-50 text-stone-600 p-2 rounded-lg"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(g)}
                className="bg-red-50 text-red-500 p-2 rounded-lg"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
