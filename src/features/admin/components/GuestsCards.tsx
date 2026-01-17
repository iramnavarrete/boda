import {
  CheckSquare,
  Square,
  Trash2,
  Unlock,
  Lock,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Guest } from "@/types";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MouseEvent } from "react";

interface GuestsCardsProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

export default function GuestsCards({
  guests,
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
}: GuestsCardsProps) {
  const isOneOrMoreSelected = selectedGuests.size > 0;

  const handleActionButtonClick = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    callback: () => void,
  ) => {
    event.stopPropagation();
    callback();
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
    >
      {guests.map((g) => (
        <div
          key={g.id}
          onClick={() => {
            // Si hay algún elemento seleccionado, al hacer click se seleccionará
            if (isOneOrMoreSelected) {
              onSelectGuest(g.id);
              return;
            }
            onEdit(g);
          }}
          className={`flex flex-col bg-white rounded-xl shadow-sm border p-4 cursor-default ${
            selectedGuests.has(g.id)
              ? "border-yellow-400 ring-1 ring-yellow-400"
              : "border-stone-200 hover:border-stone-300 hover:ring-1 hover:ring-stone-300"
          }`}
        >
          <div className="flex flex-1 justify-between items-start mb-4 gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) =>
                  handleActionButtonClick(e, () => onSelectGuest(g.id))
                }
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
                <h3 className="font-semibold text-stone-800 leading-4 mb-0.5 line-clamp-3">{g.nombre}</h3>
                <p className="text-xs text-stone-500 font-mono">ID: {g.id}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p
                className={`inline-flex text-xs font-bold p-1 gap-0.5 rounded items-center justify-center ${
                  g.asistencia === null
                    ? "text-yellow-600 bg-yellow-100"
                    : g.asistencia === true
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100"
                }`}
              >
                <span>
                  {g.asistencia === null ? (
                    <Clock size={12} />
                  ) : g.asistencia === true ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                </span>
                {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
              </p>
            </div>
          </div>
          <fieldset
            disabled={isOneOrMoreSelected}
            className="flex justify-between items-center pt-2 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="text-xs text-stone-400 font-medium">
              <button
                className="flex gap-1"
                onClick={(e) =>
                  handleActionButtonClick(e, () => onLockToggle(g))
                }
              >
                {g.cambiosPermitidos ? (
                  <Unlock size={16} className="text-green-600" />
                ) : (
                  <Lock size={16} className="text-red-600" />
                )}
                <span>Edición</span>
              </button>
            </div>
            <div className="flex gap-2">
              {g.tieneTelefono && (
                <button
                  title="Enviar Whatsapp"
                  onClick={(e) =>
                    handleActionButtonClick(e, () => onSendWhatsApp(g))
                  }
                  className="bg-green-50 text-green-600 p-2 rounded-lg flex justify-center items-center"
                >
                  <IconBrandWhatsapp width={18} height={18} />
                </button>
              )}
              <button
                className="bg-stone-50 text-stone-600 p-2 rounded-lg"
                title="Vista previa"
              >
                <Eye size={20} className="text-stone-600" />
              </button>
              <button
                onClick={(e) => handleActionButtonClick(e, () => onDelete(g))}
                className="bg-red-50 text-red-500 p-2 rounded-lg"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </fieldset>
        </div>
      ))}
    </div>
  );
}
