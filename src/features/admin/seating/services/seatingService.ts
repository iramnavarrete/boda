import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeatingElement, FamilyElement } from "../stores/useSeatingStore";
import { Family, GuestSeat, GuestStatus } from "@/types";

interface ExtendedDbFamily extends Family {
  aliasAsientos?: string[];
}

export const SeatingService = {
  getPlan: async (invitationId: string): Promise<SeatingElement[]> => {
    if (!invitationId) return [];
    try {
      const ref = doc(db, "invitations", invitationId, "modules", "seating");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data().elements as SeatingElement[];
      }
      return [];
    } catch (error) {
      console.error("Error al cargar el plano:", error);
      return [];
    }
  },

  savePlan: async (invitationId: string, elements: SeatingElement[]) => {
    if (!invitationId) return;
    try {
      const ref = doc(db, "invitations", invitationId, "modules", "seating");
      await setDoc(
        ref,
        { elements, updatedAt: new Date().toISOString() },
        { merge: true },
      );
    } catch (error) {
      console.error("Error al guardar el plano:", error);
      throw error;
    }
  },

  updateSeatAlias: async (
    invitationId: string,
    guestDbId: string,
    aliases: string[],
  ) => {
    if (!invitationId || !guestDbId) return;
    try {
      const sanitizedAliases = aliases.map((alias) => alias || "");

      const ref = doc(db, "invitations", invitationId, "families", guestDbId);
      await updateDoc(ref, { aliasAsientos: sanitizedAliases });
    } catch (error) {
      console.error("Error al actualizar el alias del asiento:", error);
      throw error;
    }
  },

  formatGuestsToFamilies: (rawGuests: ExtendedDbFamily[]): FamilyElement[] => {
    return rawGuests.map((rawGuest: ExtendedDbFamily, i: number) => {
      const hue = Math.floor((i * (360 / rawGuests.length)) % 360);

      const familyName = rawGuest.nombre || `Grupo ${i + 1}`;
      const totalTickets = Number(rawGuest.invitados) || 1;
      const confirmedCount = Number(rawGuest.confirmados) || 0;
      const isAttending = rawGuest.asistencia;

      const deadline = rawGuest.fechaLimiteConfirmacion || null;
      const aliases = rawGuest.aliasAsientos || [];

      const familyGuests: GuestSeat[] = Array.from(
        { length: totalTickets },
        (_, j) => {
          let currentStatus: GuestStatus = "pending";

          if (isAttending === false) {
            currentStatus = "declined";
          } else if (isAttending === true) {
            currentStatus = j < confirmedCount ? "confirmed" : "declined";
          }

          // 🔥 Eliminado el fallback que ponía el nombre de la familia en el índice 0
          const seatName = aliases[j] || "";

          return {
            id: `${rawGuest.id}_seat_${j}`,
            nombre: seatName,
            estatus: currentStatus,
          };
        },
      );

      return {
        id: rawGuest.id,
        name: familyName,
        deadline: deadline,
        aliases: aliases,
        colorBg: `hsl(${hue}, 80%, 85%)`,
        colorBorder: `hsl(${hue}, 70%, 65%)`,
        guests: familyGuests,
      };
    });
  },
};
