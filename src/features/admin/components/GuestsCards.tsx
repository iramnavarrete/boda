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
import { MouseEvent, useState } from "react";
import DashedSeparator from "./DashedSeparator";
import { cn } from "@heroui/theme";
import { useRouter } from "next/router";
import ConfirmationModal from "./ConfirmationModal";
import { GuestService } from "@/services/guestService";

interface GuestsCardsProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

const GuestsCards: React.FC<GuestsCardsProps> = ({
  guests,
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
}) => {
  const isOneOrMoreSelected = selectedGuests.size > 0;
  const compactMode = false;

  const router = useRouter();

  const { invitationId } = router.query;

  // ESTADOS DEL TUTORIAL DE WHATSAPP
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [pendingWappGuest, setPendingWappGuest] = useState<Guest | null>(null);

  const handleActionButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    callback: () => void,
  ) => {
    event.stopPropagation();
    callback();
  };

  // Función que intercepta el clic en WhatsApp
  const handleWhatsAppClick = (guest: Guest) => {
    // Validamos en el lado del cliente (para evitar errores de SSR)
    const hasSeenTutorial =
      typeof window !== "undefined"
        ? localStorage.getItem("tutorial_whatsapp_shown")
        : false;

    if (!hasSeenTutorial) {
      // Si es la primera vez, abrimos el modal tutorial
      setPendingWappGuest(guest);
      setIsTutorialOpen(true);
    } else {
      // Si ya lo vio, ejecuta la acción normal
      onSendWhatsApp(guest);
      GuestService.markWhastappSent(invitationId as string, guest);
    }
  };

  const confirmWhatsAppTutorial = () => {
    // Marcamos que ya vio el tutorial
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorial_whatsapp_shown", "true");
    }
    setIsTutorialOpen(false);

    // Ejecutamos la acción pendiente
    if (pendingWappGuest) {
      onSendWhatsApp(pendingWappGuest);
      setPendingWappGuest(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 select-none pb-20w">
        {guests.map((g) => (
          <div
            key={g.id}
            onClick={() => {
              if (isOneOrMoreSelected) {
                onSelectGuest(g.id);
                return;
              }
              onEdit(g);
            }}
            className={`
            relative flex flex-col bg-white/90 rounded-2xl p-5 cursor-default transition-all duration-300 border-2
            ${
              selectedGuests.has(g.id)
                ? "border-gold shadow-[0_8px_30px_-5px_rgba(197,166,105,0.3)] ring-0 scale-[1] z-10"
                : "border-sand hover:border-gold/50 hover:shadow-lg hover:shadow-stone-200/50 md:hover:-translate-y-0.5"
            }
          `}
          >
            <div className="flex flex-1 justify-between items-start mb-4 gap-3">
              <div className="flex items-start gap-4">
                {/* Checkbox de Selección */}
                <button
                  onClick={(e) =>
                    handleActionButtonClick(e, () => onSelectGuest(g.id))
                  }
                  className={`
                  mt-1 p-1 rounded-lg transition-all duration-200 shrink-0
                  ${
                    selectedGuests.has(g.id)
                      ? "text-gold bg-paper/30"
                      : "text-stone-400 hover:text-gold hover:bg-paper/30"
                  }
                `}
                >
                  {selectedGuests.has(g.id) ? (
                    <CheckSquare size={22} className="drop-shadow-sm" />
                  ) : (
                    <Square size={22} />
                  )}
                </button>

                {/* Info Principal */}
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal leading-snug line-clamp-2">
                    {g.nombre}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest bg-paper/30 inline-block px-1.5 py-0.5 rounded border border-sand">
                    ID: {g.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Badge de Estado */}
              <div className="flex-shrink-0">
                <span
                  className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                  ${
                    g.asistencia === null
                      ? "bg-paper/30 text-gold border-gold/20"
                      : g.asistencia === true
                        ? "bg-primary-50 text-primary border-primary-100"
                        : "bg-danger-50 text-danger-700 border-danger-100"
                  }
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
              </div>
            </div>
            {/* Footer de Acciones */}
            <div
              className={cn(
                "transition-all duration-200 max-h-20 overflow-hidden opacity-100",
                compactMode ? "max-h-0 opacity-0" : "",
              )}
            >
              <DashedSeparator className="m-0" />
              <fieldset
                disabled={isOneOrMoreSelected}
                className="flex justify-between items-center pt-4 mt-auto transition-opacity duration-300 disabled:opacity-30 disabled:pointer-events-none"
              >
                {/* Estado de Edición */}
                <div className="text-xs font-medium">
                  <button
                    className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors
                  ${
                    g.cambiosPermitidos
                      ? "text-primary bg-primary-50  hover:bg-primary-100"
                      : "text-danger-700 bg-danger-50 hover:bg-danger-100"
                  }
                  `}
                    onClick={(e) =>
                      handleActionButtonClick(e, () => onLockToggle(g))
                    }
                    title={
                      g.cambiosPermitidos
                        ? "Cambios permitidos"
                        : "Cambios bloqueados"
                    }
                  >
                    {g.cambiosPermitidos ? (
                      <Unlock size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    <span className="text-left whitespace-pre-wrap">
                      Cambios{"\n"}
                      {g.cambiosPermitidos ? "permitidos" : "bloqueados"}
                    </span>
                  </button>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2">
                  {g.tieneTelefono && (
                    <>
                      <button
                        title="Enviar Whatsapp"
                        onClick={(e) =>
                          handleActionButtonClick(e, () =>
                            handleWhatsAppClick(g),
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

                  <button
                    onClick={(e) =>
                      handleActionButtonClick(e, () =>
                        window.open(
                          `/i/${invitationId}?guest=${g.id}&preview=1&token=AQWOLdldspWRKDOSAKkwqppals`,
                          "_blank",
                        ),
                      )
                    }
                    className="p-2 rounded-xl text-stone-custom hover:bg-sand-100 hover:text-charcoal hover:border-gold/30 transition-all duration-300 border border-sand shadow-sm"
                    title="Vista previa"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={(e) =>
                      handleActionButtonClick(e, () => onDelete(g))
                    }
                    className="p-2 rounded-xl text-danger-600 border border-sand hover:bg-red-50 hover:text-danger-700 hover:border-red-100 transition-all duration-300"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </fieldset>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setPendingWappGuest(null);
        }}
        onConfirm={confirmWhatsAppTutorial}
        title="Aviso de Envío"
        message="Al hacer clic en este botón, el invitado se marcará automáticamente como 'WhatsApp enviado'. Asegúrate de enviar correctamente el mensaje desde tu aplicación para evitar diferencias en la información de tu lista."
        confirmText="Entendido, continuar"
      />
    </>
  );
};

export default GuestsCards;
