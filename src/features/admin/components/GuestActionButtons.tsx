import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MouseEvent, useCallback } from "react";
import { Guest } from "@/types";
import { cn } from "@heroui/theme";
import { Timestamp } from "firebase/firestore";

interface GuestActionButtonsProps {
  guest: Guest;
  invitationId: string | string[] | undefined;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onPreview?: (guest: Guest) => void; // opcional por si cada vista quiere manejarlo distinto
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

export const GuestActionButtons = ({
  guest: g,
  invitationId,
  onSendWhatsApp,
  onSendReminder,
  onDelete,
}: GuestActionButtonsProps) => {
  const stringFechaWhatsapp = useCallback(() => {
    if (!g.fechaWhatsappEnviado) {
      return "";
    }
    return (
      " el " +
      new Date(
        (g.fechaWhatsappEnviado as Timestamp).seconds * 1000,
      ).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })
    );
  }, [g.fechaWhatsappEnviado]);

  const stringFechaRecordatorio = useCallback(() => {
    if (!g.fechaRecordatorioEnviado) {
      return "";
    }
    return (
      " el " +
      new Date(
        (g.fechaRecordatorioEnviado as Timestamp).seconds * 1000,
      ).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })
    );
  }, [g.fechaRecordatorioEnviado]);
  return (
    <div className="flex items-center gap-1 justify-end">
      {g.tieneTelefono && (
        <>
          {g.whatsappEnviado === true && (
            <button
              type="button"
              title="Enviar Recordatorio"
              onClick={(e) => stopAndRun(e, () => onSendReminder(g))}
              className="p-2 rounded-xl text-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-sand hover:border-orange-300 shadow-sm relative"
            >
              <Bell size={16} />
              {g.recordatorioEnviado === true && (
                <div
                  title={`Recordatorio enviado${stringFechaRecordatorio()}`}
                  className="absolute bottom-[6px] right-[3px] bg-white rounded-full p-[1px] shadow-sm cursor-help"
                >
                  <CheckCircle2
                    size={11}
                    className="text-green-500 bg-green-50 rounded-full"
                  />
                </div>
              )}
            </button>
          )}

          <button
            type="button"
            title="Enviar Whatsapp"
            onClick={(e) => stopAndRun(e, () => onSendWhatsApp(g))}
            className="p-2 rounded-xl text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors border border-sand hover:border-green-600 relative"
          >
            <IconBrandWhatsapp className="w-4 h-4" />
            <div
              title={
                g.whatsappEnviado
                  ? `WhatsApp enviado${stringFechaWhatsapp()}`
                  : "WhatsApp pendiente de enviar"
              }
              className="absolute bottom-[6px] right-[3px] bg-white rounded-full p-[1px] shadow-sm cursor-help"
            >
              {g.whatsappEnviado === true ? (
                <CheckCircle2
                  size={11}
                  className="text-green-500 bg-green-50 rounded-full"
                />
              ) : (
                <Clock
                  size={11}
                  className="text-sand-400 bg-green-50 rounded-full"
                />
              )}
            </div>
          </button>
        </>
      )}

      <button
        type="button"
        title="Vista previa"
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

      <button
        type="button"
        title="Eliminar"
        onClick={(e) => stopAndRun(e, () => onDelete(g))}
        className="p-2 rounded-xl text-danger-600 border border-sand hover:bg-red-50 hover:text-danger-700 hover:border-red-100 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
