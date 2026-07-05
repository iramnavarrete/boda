import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeatingElement, FamilyElement } from "../stores/useSeatingStore";
import { Family, GuestSeat } from "@/types";
import { invitationsCollectionName } from "@/services/invitationsService";

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
      const hue = Math.floor((i * (360 / rawFamilies.length)) % 360);
      const familyName = rawFamily.nombre || `Grupo ${i + 1}`;
      const deadline = rawFamily.fechaLimiteConfirmacion || null;

      // 🔥 CERO LEGACY: Confiamos ciegamente en que FamiliesService
      // ya estructuró correctamente el array de "asientos" desde el inicio
      const familyGuests: GuestSeat[] = rawFamily.asientos || [];

      result.push({
        id: rawFamily.id,
        name: familyName,
        deadline,
        colorBg: `hsl(${hue}, 80%, 85%)`,
        colorBorder: `hsl(${hue}, 70%, 65%)`,
        guests: familyGuests,
        allowChanges: rawFamily.cambiosPermitidos,
        rawFamily: rawFamily,
      });
    }

    return result;
  },
};
