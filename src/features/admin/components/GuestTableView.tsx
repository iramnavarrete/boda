import React, { MouseEvent } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  Unlock,
  Lock,
  Eye,
  Trash2,
  Tag,
} from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Guest } from "@/types";
import { useRouter } from "next/router";

interface GuestsTableViewProps {
  filteredGuests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

const GuestsTableView: React.FC<GuestsTableViewProps> = ({
  filteredGuests: guests = [],
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
}) => {
  const safeSelectedGuests = selectedGuests || new Set();
  const isOneOrMoreSelected = safeSelectedGuests.size > 0;

  const router = useRouter();

  const { invitationId } = router.query;

  const handleActionButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    callback: () => void,
  ) => {
    event.stopPropagation();
    callback();
  };

  const getStatusStyles = (asistencia: boolean | null) => {
    if (asistencia === true) {
      return "bg-[#E7F3EF] text-[#2D5B4F] border-[#CFE5DD]";
    } else if (asistencia === false) {
      return "bg-[#F9EAE9] text-[#853935] border-[#EED7D6]";
    } else {
      return "bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]";
    }
  };

  if (!Array.isArray(guests)) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-white border border-[#EBE5DA] shadow-sm">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#FDFBF7] border-b border-[#EBE5DA] text-[10px] uppercase tracking-widest text-[#A8A29E] select-none">
            <th className="p-3 w-14 text-center"></th>
            <th className="p-3 font-bold text-[#5A5A5A]">Invitado</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Etiqueta</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Asistencia</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Edición</th>
            <th className="p-3 font-bold text-[#5A5A5A] text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {guests.map((g) => {
            const isSelected = safeSelectedGuests.has(g.id);
            return (
              <tr
                key={g.id}
                onClick={() => {
                  if (isOneOrMoreSelected) {
                    onSelectGuest(g.id);
                  } else {
                    onEdit(g);
                  }
                }}
                className={`
                  border-b last:border-b-0 border-[#EBE5DA] transition-colors cursor-pointer group
                  ${isSelected ? "bg-[#FDFBF7]" : "hover:bg-[#F9F7F2]/50 bg-white"}
                `}
              >
                {/* 1. CHECKBOX */}
                <td className="p-4 text-center align-middle">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleActionButtonClick(e, () => onSelectGuest(g.id))
                    }
                    className={`
                      p-1 rounded-lg transition-colors
                      ${isSelected ? "text-[#2C2C29]" : "text-[#A8A29E] group-hover:text-[#2C2C29]"}
                    `}
                  >
                    {isSelected ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </td>

                {/* 2. INFO PRINCIPAL */}
                <td className="p-2 align-middle">
                  <div>
                    <h3
                      className={`font-serif text-base font-bold leading-snug mb-1 transition-colors ${isSelected ? "text-[#C5A669]" : "text-[#2C2C29]"}`}
                    >
                      {g.nombre}
                    </h3>
                  </div>
                </td>

                {/* Etiqueta */}
                <td className="p-2 align-middle">
                  {g.etiqueta && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#EBE5DA] bg-[#FDFBF7] text-[#C5A669]">
                      <Tag size={10} />
                      {g.etiqueta}
                    </span>
                  )}
                </td>

                {/* 3. ASISTENCIA (BADGE) */}
                <td className="p-2 align-middle">
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                      ${getStatusStyles(g.asistencia)}
                    `}
                  >
                    {g.asistencia === null ? (
                      <Clock size={12} />
                    ) : g.asistencia === true ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    <span>
                      {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
                    </span>
                  </span>
                </td>

                {/* 4. PERMISOS DE EDICIÓN */}
                <td className="p-2 align-middle">
                  <button
                    type="button"
                    disabled={isOneOrMoreSelected}
                    onClick={(e) =>
                      handleActionButtonClick(e, () => onLockToggle(g))
                    }
                    className={`
                      inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none
                      ${
                        g.cambiosPermitidos
                          ? "text-[#2D5B4F] bg-[#E7F3EF] hover:bg-[#D4EBE4]"
                          : "text-[#853935] bg-[#F9EAE9] hover:bg-[#F3DCD9]"
                      }
                    `}
                    title={
                      g.cambiosPermitidos
                        ? "Bloquear edición"
                        : "Permitir edición"
                    }
                  >
                    {g.cambiosPermitidos ? (
                      <Unlock size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    <span>
                      Cambios{" "}
                      {g.cambiosPermitidos ? "permitidos" : "bloqueados"}
                    </span>
                  </button>
                </td>

                {/* 5. BOTONES DE ACCIÓN */}
                <td className="p-2 align-middle text-right">
                  <fieldset
                    disabled={isOneOrMoreSelected}
                    className="transition-opacity duration-300 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón WhatsApp */}
                      {g.tieneTelefono && (
                        <>
                          <button
                            title="Enviar Whatsapp"
                            onClick={(e) =>
                              handleActionButtonClick(e, () =>
                                onSendWhatsApp(g),
                              )
                            }
                            className="p-2 rounded-xl text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-300 border border-sand hover:border-green-600 relative"
                          >
                            <IconBrandWhatsapp className="w-4 h-4" />
                            {g.whatsappEnviado === true ? (
                              <div
                                title="Whatsapp enviado"
                                className="absolute bottom-[6px] right-[3px] bg-white rounded-full p-[1px] shadow-sm cursor-help"
                              >
                                <CheckCircle2
                                  size={10}
                                  className="text-green-500 bg-green-50 rounded-full"
                                />
                              </div>
                            ) : (
                              <div
                                title="Whatsapp pendiente de enviar"
                                className="absolute bottom-[6px] right-[3px] bg-white rounded-full p-[1px] shadow-sm cursor-help"
                              >
                                <Clock
                                  size={10}
                                  className="text-sand-400 bg-green-50 rounded-full"
                                />
                              </div>
                            )}
                          </button>
                        </>
                      )}

                      {/* Botón Preview */}
                      <button
                        type="button"
                        disabled={isOneOrMoreSelected}
                        onClick={(e) =>
                          handleActionButtonClick(e, () =>
                            window.open(
                              `/i/${invitationId}?guest=${g.id}&preview=1&token=AQWOLdldspWRKDOSAKkwqppals`,
                              "_blank",
                            ),
                          )
                        }
                        className="p-2 rounded-lg text-[#5A5A5A] bg-[#FDFBF7] hover:bg-white hover:text-[#2C2C29] transition-all border border-[#EBE5DA] disabled:opacity-30 disabled:pointer-events-none"
                        title="Vista previa / Editar"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        type="button"
                        disabled={isOneOrMoreSelected}
                        onClick={(e) =>
                          handleActionButtonClick(e, () => onDelete(g))
                        }
                        className="p-2 rounded-lg text-[#853935] bg-white border border-[#EBE5DA] hover:bg-[#F9EAE9] hover:text-[#B71C1C] hover:border-[#EED7D6] transition-all disabled:opacity-30 disabled:pointer-events-none"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </fieldset>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GuestsTableView;
