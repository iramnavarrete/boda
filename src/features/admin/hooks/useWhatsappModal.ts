import { useCallback, useState } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import {
  replaceWhatsappVariables,
  type WhatsappMessageContext,
} from "@/utils/whatsappMessage";

interface WhatsappModalState {
  isOpen: boolean;
  type: "initial" | "reminder";
  family: Family | null;
}

const CLOSED: WhatsappModalState = {
  isOpen: false,
  type: "initial",
  family: null,
};

// ────────────────────────────────────────────────────────────────────────────
// Emojis Unicode (se envían directo vía WhatsApp).
//
// El admin puede pegar cualquier emoji en el textarea del modal — la API
// de WhatsApp acepta el texto URL-encoded y los renderiza correctamente.
// ────────────────────────────────────────────────────────────────────────────

const ICON = {
  sparkle: String.fromCodePoint(0x2728), // ✨
  heart: String.fromCodePoint(0x1f496), // 💖
  tada: String.fromCodePoint(0x1f389), // 🎉
  letter: String.fromCodePoint(0x1f48c), // 💌
  ring: String.fromCodePoint(0x1f48d), // 💍
} as const;

// ────────────────────────────────────────────────────────────────────────────
// UN solo método público: buildMessage
//
// 1) Si la invitación tiene un template custom en Firestore
//    (mensajeInicial / mensajeRecordatorio), se usa tal cual con las
//    variables ({nombreFamilia}, {numInvitados}, {link}, {fechaLimite}).
// 2) Si no, se compone el default según el tipo.
// ────────────────────────────────────────────────────────────────────────────

function buildMessage(
  type: "initial" | "reminder",
  family: Family,
  invitationId: string,
  dateStr: string | null,
  customTemplate: string | undefined,
): string {
  const ctx: WhatsappMessageContext = {
    family,
    invitationId,
    limitDateStr: dateStr,
  };

  // 1) Template custom
  if (customTemplate && customTemplate.trim().length > 0) {
    return replaceWhatsappVariables(customTemplate, ctx).trim();
  }

  // 2) Default según el tipo
  const link = `https://jninvitaciones.com/i/${invitationId}?family=${family.id}`;

  // Solo el texto de la fecha (ej: "20 de agosto"). El resto del texto
  // que la rodea va inline en cada template de abajo.
  const fechaLimite = dateStr
    ? new Date(`${dateStr}T00:00:00`).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })
    : "";

  if (type === "initial") {
    // Bloque con la fecha: solo se agrega si hay fecha límite.
    const bloqueFecha = fechaLimite
      ? `\n\nPor favor, ayúdanos a confirmar tu asistencia a más tardar el día ${fechaLimite}.`
      : "";

    const template =
      `¡Hola ${family.nombre}!\n` +
      `${ICON.sparkle} Les enviamos el enlace de su invitación digital. ${ICON.sparkle}\n` +
      `Nos encantaría que nos acompañen en este día tan importante.\n` +
      `${ICON.letter} La confirmación será únicamente para la recepción, cada invitado cuenta con un lugar asignado. ` +
      `Reservamos {totalLugares} en su nombre${bloqueFecha}\n${link}`;

    return replaceWhatsappVariables(template, ctx);
  }

  // type === "reminder"
  const bloqueFecha = fechaLimite
    ? ` La confirmación (o cualquier cambio) podrás realizarla hasta el día ${fechaLimite}. ` +
      `Dado que el lugar es limitado, si no recibimos tu confirmación antes de esa fecha, el espacio será asignado a otra persona.`
    : ` Dado que el lugar es limitado, te pedimos de favor confirmarnos lo antes posible para poder organizar las mesas.`;

  const instaLink = `https://www.instagram.com/reel/DNyrQW6XuMO/?igsh=cGI1andwYzhkcWRy`;

  const template =
    `Hola ${family.nombre} ${ICON.sparkle}\n` +
    `Queremos recordarte que aún no hemos recibido tu confirmación de asistencia para nuestro evento.` +
    `${bloqueFecha} Tu respuesta es muy importante para nosotros ${ICON.heart}\n` +
    `¡Esperamos contar contigo en este día tan especial! ${ICON.tada}\n\n${instaLink}`;

  return replaceWhatsappVariables(template, ctx);
}

export function useWhatsappModal(invitationId: string | undefined) {
  const { toast } = useToast();
  const [modal, setModal] = useState<WhatsappModalState>(CLOSED);

  // Leemos la invitación actual del store para acceder a los mensajes custom
  const invitationData = useInvitationStore((state) => state.invitationData);

  const open = useCallback(
    (family: Family, type: "initial" | "reminder") =>
      setModal({ isOpen: true, type, family: family }),
    [],
  );

  const close = useCallback(() => setModal(CLOSED), []);

  const sendMessage = useCallback(
    async (family: Family, message: string, onSuccess: () => void) => {
      if (!invitationId) return;
      try {
        const contactInfo = await FamiliesService.getFamilyContactInfo(
          invitationId,
          family.id,
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
      const { family, type } = modal;
      if (!family || !invitationId) return;

      const shouldSaveDate = autoBlock && !!dateStr;

      const customTemplate =
        type === "initial"
          ? invitationData?.mensajeInicial
          : invitationData?.mensajeRecordatorio;

      const msg = buildMessage(
        type,
        family,
        invitationId,
        dateStr,
        customTemplate,
      );

      if (type === "initial") {
        await sendMessage(family, msg, () => {
          FamiliesService.markWhatsAppSent(
            invitationId,
            family,
            shouldSaveDate ? dateStr! : undefined,
          );
          close();
        });
      } else {
        await sendMessage(family, msg, () => {
          FamiliesService.markReminderAsSent(
            invitationId,
            family,
            shouldSaveDate ? dateStr! : undefined,
          );
          close();
        });
      }
    },
    [modal, invitationId, sendMessage, close, invitationData],
  );

  return { modal, open, close, handleSubmit };
}
