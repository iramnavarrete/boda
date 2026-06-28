import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeatingElement, FamilyElement } from "../stores/useSeatingStore";
import { Family, GuestSeat, GuestStatus } from "@/types";
import { familyPaths } from "@/services/familiesService";
import { invitationsCollectionName } from "@/services/invitationsService";

interface ExtendedDbFamily extends Family {
  aliasAsientos?: string[];
}

export const SeatingService = {
  getPlan: async (invitationId: string): Promise<SeatingElement[]> => {
    if (!invitationId) return [];
    try {
      const ref = doc(
        db,
        invitationsCollectionName,
        invitationId,
        "modules",
        "seating",
      );
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
      const ref = doc(
        db,
        invitationsCollectionName,
        invitationId,
        "modules",
        "seating",
      );
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
    familyId: string,
    aliases: string[],
  ) => {
    if (!invitationId || !familyId) return;
    try {
      const sanitizedAliases = aliases.map((alias) => alias || "");

      const ref = familyPaths.family(invitationId, familyId);
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

      const familyGuests: GuestSeat[] = Array.from(
        { length: totalTickets },
        (_, j) => {
          let currentStatus: GuestStatus = "pending";
          if (isAttending === false) {
            currentStatus = "declined";
          } else if (isAttending === true) {
            currentStatus = j < confirmedCount ? "confirmed" : "declined";
          }
          return {
            id: `${rawGuest.id}_seat_${j}`,
            nombre: "",
            estatus: currentStatus,
          };
        },
      );

      return {
        id: rawGuest.id,
        name: familyName,
        deadline,
        colorBg: `hsl(${hue}, 80%, 85%)`,
        colorBorder: `hsl(${hue}, 70%, 65%)`,
        guests: familyGuests,
      };
    });
  },
};
