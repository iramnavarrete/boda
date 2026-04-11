import { useCallback, useState } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";
import { useToast } from "@/features/shared/components/Toast";

interface WhatsappModalState {
  isOpen: boolean;
  type: "initial" | "reminder";
  guest: Guest | null;
}

const CLOSED: WhatsappModalState = {
  isOpen: false,
  type: "initial",
  guest: null,
};

function buildInitialMessage(
  guest: Guest,
  invitationId: string,
  dateStr: string | null,
): string {
  const dateSentence = dateStr
    ? `\n\nPor favor, ayúdanos a confirmar tu asistencia a más tardar el día ${new Date(
        `${dateStr}T00:00:00`,
      ).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}.`
    : "";

  const link = `https://jninvitaciones.com/i/${invitationId}?guest=${guest.id}`;
  const sparkle = String.fromCodePoint(0x2728);
  const letter = String.fromCodePoint(0x1f48c);

  return (
    `¡Hola ${guest.nombre}!\n` +
    `${sparkle} Les enviamos el enlace de su invitación digital. ${sparkle}\n` +
    `Nos encantaría que nos acompañen en este día tan importante.\n` +
    `${letter} La confirmación será únicamente para la recepción, cada invitado cuenta con un lugar asignado. ` +
    `Reservamos ${guest.invitados} lugares en su nombre${dateSentence}\n${link}`
  );
}

function buildReminderMessage(guest: Guest, dateStr: string | null): string {
  const dateSentence = dateStr
    ? ` La confirmación (o cualquier cambio) podrás realizarla hasta el día ${new Date(
        `${dateStr}T00:00:00`,
      ).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}. ` +
      `Dado que el lugar es limitado, si no recibimos tu confirmación antes de esa fecha, el espacio será asignado a otra persona.`
    : ` Dado que el lugar es limitado, te pedimos de favor confirmarnos lo antes posible para poder organizar las mesas.`;

  const instaLink = `https://www.instagram.com/reel/DNyrQW6XuMO/?igsh=cGI1andwYzhkcWRy`;
  const sparkle = String.fromCodePoint(0x2728);
  const heart = String.fromCodePoint(0x1f496);
  const tada = String.fromCodePoint(0x1f389);

  return (
    `${sparkle} Queridos ${guest.nombre} ${sparkle}\n` +
    `Queremos recordarte que aún no hemos recibido tu confirmación de asistencia para nuestro evento.` +
    `${dateSentence} Tu respuesta es muy importante para nosotros ${heart}\n` +
    `¡Esperamos contar contigo en este día tan especial! ${tada}\n\n${instaLink}`
  );
}

export function useWhatsappModal(invitationId: string | undefined) {
  const { toast } = useToast();
  const [modal, setModal] = useState<WhatsappModalState>(CLOSED);

  const open = useCallback(
    (guest: Guest, type: "initial" | "reminder") =>
      setModal({ isOpen: true, type, guest }),
    [],
  );

  const close = useCallback(() => setModal(CLOSED), []);

  const sendMessage = useCallback(
    async (guest: Guest, message: string, onSuccess: () => void) => {
      if (!invitationId) return;
      try {
        const contactInfo = await GuestService.getGuestContactInfo(
          invitationId,
          guest.id,
        );
        const telefono = contactInfo?.telefono;

        if (!telefono) {
          toast("No se encontró el celular de este invitado", "error");
          return;
        }

        const phone = telefono.replace(/[+\s]/g, "");
        window.open(
          `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
          "_blank",
        );
        onSuccess();
      } catch {
        toast("Error al intentar abrir WhatsApp", "error");
      }
    },
    [invitationId, toast],
  );

  const handleSubmit = useCallback(
    async (dateStr: string | null, autoBlock: boolean) => {
      const { guest, type } = modal;
      if (!guest || !invitationId) return;

      const shouldSaveDate = autoBlock && !!dateStr;

      if (type === "initial") {
        const msg = buildInitialMessage(guest, invitationId, dateStr);
        await sendMessage(guest, msg, () => {
          GuestService.markWhatsAppSent(
            invitationId,
            guest,
            shouldSaveDate ? dateStr! : undefined,
          );
          close();
        });
      } else {
        const msg = buildReminderMessage(guest, dateStr);
        await sendMessage(guest, msg, () => {
          GuestService.markReminderAsSent(
            invitationId,
            guest,
            shouldSaveDate ? dateStr! : undefined,
          );
          close();
        });
      }
    },
    [modal, invitationId, sendMessage, close],
  );

  return { modal, open, close, handleSubmit };
}
