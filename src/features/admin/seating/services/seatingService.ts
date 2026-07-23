import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeatingElement, FamilyElement } from "../stores/useSeatingStore";
import { Family, GuestSeat } from "@/types";
import { invitationsCollectionName } from "@/services/invitationsService";
import { getFamilyColorByIndex } from "@/utils/familyColors";

interface ExtendedDbFamily extends Family {
  asientos?: GuestSeat[] | null;
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
      if (!snap.exists()) return [];
      return snap.data().elements as SeatingElement[];
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

  formatFamiliesToFamiliesSeats: async (
    rawFamilies: ExtendedDbFamily[],
  ): Promise<FamilyElement[]> => {
    const result: FamilyElement[] = [];

    for (let i = 0; i < rawFamilies.length; i++) {
      const rawFamily = rawFamilies[i];
      const familyName = rawFamily.nombre || `Grupo ${i + 1}`;
      const deadline = rawFamily.fechaLimiteConfirmacion || null;

      const color = getFamilyColorByIndex(i);

      const familyGuests: GuestSeat[] = rawFamily.asientos || [];

      result.push({
        id: rawFamily.id,
        name: familyName,
        deadline,
        colorBg: color.bg,
        colorBorder: color.border,
        guests: familyGuests,
        allowChanges: rawFamily.cambiosPermitidos,
        rawFamily: rawFamily,
      });
    }

    return result;
  },
};
