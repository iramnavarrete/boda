import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Trash2,
  Unlock,
  Info,
} from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MouseEvent, useCallback, useState } from "react";
import { Guest } from "@/types";
import { cn } from "@heroui/theme";
import { FieldValue, Timestamp } from "firebase/firestore";
import Tooltip from "@/features/shared/components/Tooltip";

interface GuestActionButtonsProps {
  guest: Guest;
  invitationId: string | string[] | undefined;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onPreview?: (guest: Guest) => void;
}

function stopAndRun(e: MouseEvent, fn: () => void) {
  e.stopPropagation();
  fn();
}

export const GuestLockButton = ({
  guest: g,
  onClick,
}: {
  guest: Guest;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={g.cambiosPermitidos ? "Bloquear edición" : "Permitir edición"}
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
      g.cambiosPermitidos
        ? "text-primary bg-primary-50 hover:bg-primary-100"
        : "text-danger-700 bg-danger-50 hover:bg-danger-100",
    )}
  >
    {g.cambiosPermitidos ? <Unlock size={14} /> : <Lock size={14} />}
    <span className="text-left whitespace-pre-wrap">
      Cambios{"\n"}
      {g.cambiosPermitidos ? "permitidos" : "bloqueados"}
    </span>
  </button>
);

// TODO Actualizar este componente para hacer uso del hook de useTimeAgo en lugar de formatear el string aquí

export const GuestActionButtons = ({
  guest: g,
  invitationId,
  onSendWhatsApp,
  onSendReminder,
  onDelete,
}: GuestActionButtonsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappButton = () => (
    <button
      type="button"
      onClick={(e) => {
        stopAndRun(e, () => {
          if (g.whatsappEnviado) {
            setIsMenuOpen(!isMenuOpen);
          } else {
            onSendWhatsApp(g);
          }
        });
      }}
      className={cn(
        "p-2 rounded-xl transition-all border relative z-40",
        (isMenuOpen || g.whatsappEnviado) &&
          "md:group-hover:bg-green-100 md:group-hover:text-green-700 md:group-hover:border-green-600",
        isMenuOpen
          ? "bg-green-100 text-green-700 border-green-600"
          : "text-green-600 hover:bg-green-100 hover:text-green-700 border-sand hover:border-green-600",
      )}
    >
      <IconBrandWhatsapp className="w-4 h-4" />
      <div
        className="absolute bottom-[6px] right-[3px] bg-white rounded-full p-[1px] shadow-sm cursor-help pointer-events-none"
      >
        {g.whatsappEnviado === true ? (
          <CheckCircle2
            size={11}
            className="text-green-500 bg-green-50 rounded-full"
          />
        ) : (
          <Clock size={11} className="text-sand-400 bg-green-50 rounded-full" />
        )}
      </div>
    </button>
  );

  const stringFechaEnviado = useCallback(
    (fecha?: Timestamp | FieldValue | null | undefined) => {
      if (!fecha || !("seconds" in fecha)) return "";
      const timestamp = fecha as Timestamp;
      return (
        " el " +
        new Date(timestamp.seconds * 1000).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
        })
      );
    },
    [],
  );

  return (
    <div className="flex items-center gap-1 justify-end">
      {g.tieneTelefono && (
        <div
          className="relative flex items-center justify-center group"
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          {/* OVERLAY INVISIBLE */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
            />
          )}

          {/* MENÚ DESPLEGABLE */}
          {g.whatsappEnviado && (
            <div
              className={cn(
                "absolute bottom-full -right-4 pb-2 z-50 w-max min-w-[230px] transition-all duration-200 origin-bottom-right",
                isMenuOpen
                  ? "opacity-100 visible pointer-events-auto scale-100"
                  : "opacity-0 invisible pointer-events-none scale-95 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:pointer-events-auto md:group-hover:scale-100",
              )}
            >
              <div className="bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-xl p-1.5 flex flex-col gap-1">
                {/* Opción 1: Reenviar WhatsApp */}
                <button
                  type="button"
                  onClick={(e) =>
                    stopAndRun(e, () => {
                      onSendWhatsApp(g);
                      setIsMenuOpen(false);
                    })
                  }
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-green-700 hover:bg-green-50 transition-colors text-left text-xs font-medium w-full"
                >
                  <IconBrandWhatsapp size={16} className="shrink-0" />
                  <span className="leading-tight flex-1">
                    Volver a enviar WhatsApp
                  </span>

                  {/* 🔥 Icono Info envuelto en Tooltip */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="ml-auto flex items-center justify-center"
                  >
                    <Tooltip
                      text={`Enviado${stringFechaEnviado(g.fechaWhatsappEnviado)}`}
                      position="top"
                      align="right"
                    >
                      <div className="p-1 cursor-help rounded-md hover:bg-green-100 transition-colors">
                        <Info
                          size={15}
                          className="text-stone-400 hover:text-stone-600 transition-colors"
                        />
                      </div>
                    </Tooltip>
                  </div>
                </button>

                <div className="h-px bg-[#EBE5DA]/50 mx-1 my-0.5" />

                {/* Opción 2: Recordatorio */}
                <button
                  type="button"
                  onClick={(e) =>
                    stopAndRun(e, () => {
                      onSendReminder(g);
                      setIsMenuOpen(false);
                    })
                  }
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors text-left text-xs font-medium w-full"
                >
                  <Bell size={16} className="shrink-0" />
                  <span className="leading-tight flex-1">
                    {g.recordatorioEnviado === true
                      ? "Volver a enviar recordatorio"
                      : "Enviar recordatorio"}
                  </span>

                  {/* 🔥 Icono Info envuelto en Tooltip */}
                  {g.recordatorioEnviado === true && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="ml-auto flex items-center justify-center"
                    >
                      <Tooltip
                        text={`Enviado${stringFechaEnviado(g.fechaRecordatorioEnviado)}`}
                        position="top"
                        align="right"
                      >
                        <div className="p-1 cursor-help rounded-md hover:bg-orange-100 transition-colors">
                          <Info
                            size={15}
                            className="text-stone-400 hover:text-stone-600 transition-colors"
                          />
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* BOTÓN PRINCIPAL DE WHATSAPP */}
          {!g.whatsappEnviado ? (
            <Tooltip text="Enviar WhatsApp" position="top" align="center">
              <>{whatsappButton()}</>
            </Tooltip>
          ) : (
            <>{whatsappButton()}</>
          )}
        </div>
      )}

      {/* VISTA PREVIA */}
      <Tooltip text="Vista previa" position="top" align="center">
        <button
          type="button"
          onClick={(e) =>
            stopAndRun(e, () =>
              window.open(
                `/i/${invitationId}?guest=${g.id}&preview=1&token=AQWOLdldspWRKDOSAKkwqppals`,
                "_blank",
              ),
            )
          }
          className="p-2 rounded-xl text-stone-custom hover:bg-sand-100 hover:text-charcoal hover:border-gold/30 transition-all border border-sand shadow-sm"
        >
          <Eye size={16} />
        </button>
      </Tooltip>

      <Tooltip text="Eliminar" position="top" align="center">
        <button
          type="button"
          title="Eliminar"
          onClick={(e) => stopAndRun(e, () => onDelete(g))}
          className="p-2 rounded-xl text-danger-600 border border-sand hover:bg-red-50 hover:text-danger-700 hover:border-red-100 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
};
