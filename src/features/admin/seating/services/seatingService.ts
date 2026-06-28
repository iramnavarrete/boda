import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeatingElement, FamilyElement } from "../stores/useSeatingStore";
import { Family, GuestSeat, GuestStatus } from "@/types";
import { familyPaths, FamiliesService } from "@/services/familiesService";
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

  // Migra on-the-fly los IDs posicionales legacy a los nuevos UUIDs
  // Retorna los elementos migrados y un flag indicando si hubo cambios
  migrateLegacyIds: (
    elements: SeatingElement[],
    families: FamilyElement[],
  ): { elements: SeatingElement[]; hadChanges: boolean } => {
    // Construimos un mapa de ID posicional → UUID real
    const legacyToUuid: Record<string, string> = {};
    families.forEach((f) => {
      f.guests.forEach((g, j) => {
        const legacyId = `${f.id}_seat_${j}`;
        legacyToUuid[legacyId] = g.id;
      });
    });

    let hadChanges = false;
    const migratedElements = elements.map((el) => {
      const newSeats = el.assignedSeats.map((seatId) => {
        if (!seatId || seatId === "") return seatId;
        const uuid = legacyToUuid[seatId];
        if (uuid && uuid !== seatId) {
          hadChanges = true;
          return uuid;
        }
        return seatId;
      });
      return { ...el, assignedSeats: newSeats };
    });

    return { elements: migratedElements, hadChanges };
  },

  formatFamiliesToFamiliesSeats: async (
    invitationId: string,
    rawFamilies: ExtendedDbFamily[],
  ): Promise<FamilyElement[]> => {
    const result: FamilyElement[] = [];

    for (let i = 0; i < rawFamilies.length; i++) {
      const rawFamily = rawFamilies[i];
      const hue = Math.floor((i * (360 / rawFamilies.length)) % 360);
      const familyName = rawFamily.nombre || `Grupo ${i + 1}`;
      const totalTickets = Number(rawFamily.invitados) || 1;
      const confirmedCount = Number(rawFamily.confirmados) || 0;
      const isAttending = rawFamily.asistencia;
      const deadline = rawFamily.fechaLimiteConfirmacion || null;

      let familyGuests: GuestSeat[];

      if (rawFamily.asientos && rawFamily.asientos.length > 0) {
        // ✅ Tiene UUIDs reales — los usamos directamente
        // Recalculamos el estatus por si cambió la asistencia en Firestore
        familyGuests = rawFamily.asientos.map((seat, j) => {
          let estatus: GuestStatus = "pending";
          if (isAttending === false) estatus = "declined";
          else if (isAttending === true)
            estatus = j < confirmedCount ? "confirmed" : "declined";
          return { ...seat, estatus };
        });

        // Si el total de tickets cambió vs los asientos guardados, ajustamos
        if (familyGuests.length < totalTickets) {
          // Agregamos los que faltan
          for (let j = familyGuests.length; j < totalTickets; j++) {
            let estatus: GuestStatus = "pending";
            if (isAttending === false) estatus = "declined";
            else if (isAttending === true)
              estatus = j < confirmedCount ? "confirmed" : "declined";
            familyGuests.push({ id: crypto.randomUUID(), nombre: "", estatus });
          }
          // Persistimos los nuevos asientos
          await updateDoc(familyPaths.family(invitationId, rawFamily.id), {
            asientos: familyGuests,
          });
        } else if (familyGuests.length > totalTickets) {
          // Recortamos los que sobran (no confirmados primero)
          familyGuests = familyGuests.slice(0, totalTickets);
        }
      } else {
        // ⚠️ Legacy — no tiene asientos con UUIDs, los inicializamos y guardamos
        familyGuests = await FamiliesService.initializeFamilySeats(
          invitationId,
          rawFamily.id,
          totalTickets,
          confirmedCount,
          isAttending ?? null,
        );
      }

      result.push({
        id: rawFamily.id,
        name: familyName,
        deadline,
        colorBg: `hsl(${hue}, 80%, 85%)`,
        colorBorder: `hsl(${hue}, 70%, 65%)`,
        guests: familyGuests,
        allowChanges: rawFamily.cambiosPermitidos,
      });
    }

    return result;
  },
};
