import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  writeBatch,
  getDoc,
  updateDoc,
  FirestoreError,
  FirestoreErrorCode,
  DocumentReference,
  CollectionReference,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import {
  Family,
  FamilyContactInfo,
  FamilyFormData,
  GuestSeat,
  GuestStatus,
  ImportedFamily,
} from "@/types";
import { db } from "@/lib/firebase/config";
import { generateFamilyId } from "@/utils/generators";
import { invitationsCollectionName } from "./invitationsService";

export const familiesCollectionName = "families";

// ─── Paths firestore ────────────────────────────────────────────────────────────────────

export const familyPaths = {
  family: (invId: string, familyId: string): DocumentReference =>
    doc(db, invitationsCollectionName, invId, familiesCollectionName, familyId),

  familyContact: (invId: string, familyId: string): DocumentReference =>
    doc(
      db,
      invitationsCollectionName,
      invId,
      familiesCollectionName,
      familyId,
      "private",
      "contactInfo",
    ),
  familyQuote: (invId: string, familyId: string): DocumentReference =>
    doc(db, invitationsCollectionName, invId, "quotes", familyId),

  familiesCollection: (invId: string): CollectionReference =>
    collection(db, invitationsCollectionName, invId, familiesCollectionName),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BATCH_CHUNK_SIZE = 200;

const byCreatedDesc = (a: Family, b: Family): number =>
  ((b.fechaCreacion as Timestamp)?.seconds ?? 0) -
  ((a.fechaCreacion as Timestamp)?.seconds ?? 0);

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const FamiliesService = {
  // ── Suscripción en tiempo real ──────────────────────────────────────────────

  subscribeToFamilies: (
    invitationId: string,
    callback: (families: Family[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    const q = query(familyPaths.familiesCollection(invitationId));
    const cache = new Map<string, Family>();

    return onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const d = change.doc.data();

          if (change.type === "removed" || Number(d.invitados) === 0) {
            cache.delete(change.doc.id);
          } else {
            cache.set(change.doc.id, {
              id: change.doc.id,
              ...d,
              tieneTelefono: !!d.tieneTelefono,
            } as Family);
          }
        });

        callback(Array.from(cache.values()).sort(byCreatedDesc));
      },
      (error) => onError?.(error),
    );
  },

  // ── Lectura ─────────────────────────────────────────────────────────────────

  getFamily: async (
    invitationId: string,
    familyId: string,
  ): Promise<{ family: Family | null; error: FirestoreErrorCode | null }> => {
    try {
      const snapshot = await getDoc(familyPaths.family(invitationId, familyId));
      if (!snapshot.exists()) return { family: null, error: null };
      return { family: snapshot.data() as Family, error: null };
    } catch (error) {
      return {
        family: null,
        error: (error as FirestoreError).code ?? "unknown",
      };
    }
  },

  getFamilyContactInfo: async (
    invitationId: string,
    familyId: string,
  ): Promise<FamilyContactInfo | null> => {
    try {
      const snapshot = await getDoc(
        familyPaths.familyContact(invitationId, familyId),
      );
      return snapshot.exists() ? (snapshot.data() as FamilyContactInfo) : null;
    } catch {
      return null;
    }
  },

  // ── Escritura individual ────────────────────────────────────────────────────

  getUniqueFamilyId: async (invitationId: string) => {
    let isUnique = false;
    let newId = "";
    let attempts = 0;

    while (!isUnique) {
      newId = generateFamilyId();
      const family = await getDoc(familyPaths.family(invitationId, newId));

      if (!family.exists()) {
        isUnique = true;
      }

      attempts++;
      if (attempts > 15) {
        throw new Error(
          "No se pudo generar un ID único después de varios intentos",
        );
      }
    }

    return newId;
  },

  saveFamily: async (
    invitationId: string,
    family: Family,
    data: FamilyFormData,
    isNew: boolean,
    isPublic: boolean = false,
  ) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    const publicRef = familyPaths.family(invitationId, family.id);

    if (isPublic) {
      // Invitado confirmando su asistencia
      let asientosActualizados: GuestSeat[] = [];

      const familyName = family.nombre || "Invitado";
      const familyTag = family.etiqueta || "Invitado";
      const familyGuests = family.asientos || [];

      const confirmados = Number(data.confirmados) || 0;
      const isAttending = data.asistencia;

      asientosActualizados = familyGuests.map((seat, j) => {
        let estatus: GuestStatus = "pending";
        if (isAttending === false) estatus = "declined";
        else if (isAttending === true)
          estatus = j < confirmados ? "confirmed" : "declined";
        return { ...seat, estatus };
      });

      batch.set(
        publicRef,
        {
          asistencia: data.asistencia,
          confirmados: Number(data.confirmados) || 0,
          asientos: asientosActualizados,
          ultimaModificacion: timestamp,
        } as Partial<Family>,
        { merge: true },
      );

      batch.set(
        familyPaths.familyQuote(invitationId, family.id),
        {
          asistencia: data.asistencia,
          autor: familyName,
          parentesco: familyTag,
          familyId: family.id,
        },
        { merge: true },
      );
    } else {
      // Admin: escribe todos los campos
      const totalTickets = Number(data.invitados) || 1;
      const confirmedCount = Number(data.confirmados) || 0;
      const isAttending = data.asistencia;

      const publicPayload: Partial<Family> = {
        nombre: data.nombre,
        invitados: totalTickets,
        notaAnfitrion: data.notaAnfitrion || null,
        cambiosPermitidos: data.cambiosPermitidos ?? true,
        ultimaModificacion: timestamp,
        asistencia: isAttending,
        confirmados: confirmedCount,
        etiqueta: data.etiqueta || null,
        fechaLimiteConfirmacion: data.fechaLimiteConfirmacion || null,
      };

      if (data.telefono !== undefined) {
        publicPayload.tieneTelefono = !!data.telefono?.trim().length;
      }

      if (isNew) {
        const seats: GuestSeat[] = Array.from(
          { length: totalTickets },
          (_, j) => {
            let estatus: GuestStatus = "pending";
            if (isAttending === false) estatus = "declined";
            else if (isAttending === true)
              estatus = j < confirmedCount ? "confirmed" : "declined";
            return { id: crypto.randomUUID(), nombre: "", estatus };
          },
        );

        Object.assign(publicPayload, {
          id: family.id,
          fechaCreacion: timestamp,
          notaInvitado: null,
          asientos: seats,
        });
      } else {
        let familyGuests = family.asientos || [];

        // Ajustar TAMAÑO
        if (familyGuests.length < totalTickets) {
          for (let j = familyGuests.length; j < totalTickets; j++) {
            familyGuests.push({
              id: crypto.randomUUID(),
              nombre: "",
              estatus: "pending",
            });
          }
        } else if (familyGuests.length > totalTickets) {
          familyGuests = familyGuests.slice(0, totalTickets);
        }

        familyGuests = familyGuests.map((seat, j) => {
          let estatus: GuestStatus = seat.estatus;
          if (isAttending === false) estatus = "declined";
          else if (isAttending === true)
            estatus = j < confirmedCount ? "confirmed" : "declined";
          else estatus = "pending";
          return { ...seat, estatus };
        });

        publicPayload.asientos = familyGuests;
      }

      if (data.telefono !== undefined) {
        batch.set(
          familyPaths.familyContact(invitationId, family.id),
          { telefono: data.telefono || null },
          { merge: true },
        );
      }

      batch.set(publicRef, publicPayload, { merge: true });

      // VALIDACIÓN: Solo guardamos en quote si cambió algún dato relevante
      if (
        family?.nombre !== data.nombre ||
        family.etiqueta !== data.etiqueta ||
        family?.asistencia !== data.asistencia
      ) {
        batch.set(
          familyPaths.familyQuote(invitationId, family.id),
          {
            autor: data.nombre,
            parentesco: data.etiqueta || "Invitado",
            asistencia: isAttending,
            familyId: family.id,
          },
          { merge: true },
        );
      }
    }

    await batch.commit();
  },

  updateGuestList: async (
    invitationId: string,
    familyId: string,
    guests: { id: string; nombre: string; estatus: GuestStatus }[],
  ) => {
    const payload = guests.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      estatus: g.estatus,
    }));

    await setDoc(
      familyPaths.family(invitationId, familyId),
      { asientos: payload },
      { merge: true },
    );
  },

  deleteFamily: async (invitationId: string, familyId: string) => {
    const payload: Partial<Family> = {
      confirmados: 0,
      cambiosPermitidos: false,
      invitados: 0,
      asientos: [],
      ultimaModificacion: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.update(familyPaths.family(invitationId, familyId), payload);
    batch.set(
      familyPaths.familyQuote(invitationId, familyId),
      { asistencia: "deleted" },
      { merge: true },
    );
    await batch.commit();
  },

  toggleFamilyLock: async (
    invitationId: string,
    family: Family,
    forceLock?: boolean,
    newDate?: string,
  ) => {
    const isLocking =
      forceLock !== undefined ? forceLock : family.cambiosPermitidos;

    const payload: Partial<Family> = {
      cambiosPermitidos: !isLocking,
      ultimaModificacion: serverTimestamp(),
    };

    if (!isLocking) {
      payload.fechaLimiteConfirmacion = newDate ?? null;
    }

    await updateDoc(familyPaths.family(invitationId, family.id), payload);
  },

  markWhatsAppSent: async (
    invitationId: string,
    family: Pick<Family, "id">,
    deadlineDate?: string,
  ) => {
    await updateDoc(familyPaths.family(invitationId, family.id), {
      cambiosPermitidos: true,
      whatsappEnviado: true,
      fechaWhatsappEnviado: serverTimestamp(),
      fechaLimiteConfirmacion: deadlineDate ?? null,
    } as Partial<Family>);
  },

  markReminderAsSent: async (
    invitationId: string,
    family: Pick<Family, "id">,
    deadlineDate?: string,
  ) => {
    await updateDoc(familyPaths.family(invitationId, family.id), {
      cambiosPermitidos: true,
      recordatorioEnviado: true,
      fechaRecordatorioEnviado: serverTimestamp(),
      fechaLimiteConfirmacion: deadlineDate ?? null,
    } as Partial<Family>);
  },

  checkInFamily: async (
    invitationId: string,
    familyId: string,
    pasesUsados: number,
  ) => {
    const payload: Partial<Family> = {
      asistio: true,
      pasesUsados: pasesUsados,
      horaLlegada: serverTimestamp(),
      ultimaModificacion: serverTimestamp(),
    };

    await updateDoc(familyPaths.family(invitationId, familyId), payload);
  },

  // ── Operaciones en lote ─────────────────────────────────────────────────────

  batchUpdateLock: async (
    invitationId: string | null,
    familyIds: string[],
    shouldLock: boolean,
    newDate?: string,
  ) => {
    if (!invitationId) return;

    for (let i = 0; i < familyIds.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = familyIds.slice(i, i + BATCH_CHUNK_SIZE);

      chunk.forEach((familyId) => {
        const payload: Partial<Family> = {
          cambiosPermitidos: !shouldLock,
          ultimaModificacion: serverTimestamp(),
        };

        if (!shouldLock) {
          payload.fechaLimiteConfirmacion = newDate ?? null;
        }

        batch.update(familyPaths.family(invitationId, familyId), payload);
      });

      await batch.commit();
    }
  },

  batchDeleteFamilies: async (invitationId: string, familyIds: string[]) => {
    for (let i = 0; i < familyIds.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = familyIds.slice(i, i + BATCH_CHUNK_SIZE);

      chunk.forEach((id) => {
        const payload: Partial<Family> = {
          confirmados: 0,
          cambiosPermitidos: false,
          invitados: 0,
          asientos: [],
          ultimaModificacion: serverTimestamp(),
        };
        batch.update(familyPaths.family(invitationId, id), payload);

        batch.set(
          familyPaths.familyQuote(invitationId, id),
          { asistencia: "deleted" },
          { merge: true },
        );
      });

      await batch.commit();
    }
  },

  markInvitationAsViewed: async (invitationId: string, familyId: string) => {
    await updateDoc(familyPaths.family(invitationId, familyId), {
      invitacionVista: true,
    });
  },

  batchImportFamilies: async (
    invitationId: string,
    parsedFamilies: ImportedFamily[],
  ) => {
    const timestamp = serverTimestamp();

    for (let i = 0; i < parsedFamilies.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = parsedFamilies.slice(i, i + BATCH_CHUNK_SIZE);

      const familyIds = await Promise.all(
        chunk.map(() => FamiliesService.getUniqueFamilyId(invitationId)),
      );

      chunk.forEach((family, index) => {
        const familyId = familyIds[index];
        const tieneTelefono = !!family.telefono?.trim().length;
        const totalTickets = Number(family.invitados) || 1;

        const seats: GuestSeat[] = Array.from({ length: totalTickets }, () => ({
          id: crypto.randomUUID(),
          nombre: "",
          estatus: "pending",
        }));

        batch.set(familyPaths.family(invitationId, familyId), {
          id: familyId,
          nombre: family.nombre,
          invitados: totalTickets,
          notaAnfitrion: family.notaAnfitrion || null,
          cambiosPermitidos: true,
          tieneTelefono,
          ultimaModificacion: timestamp,
          fechaCreacion: timestamp,
          asistencia: null,
          confirmados: 0,
          notaInvitado: null,
          asientos: seats,
        });

        batch.set(familyPaths.familyContact(invitationId, familyId), {
          telefono: family.telefono || null,
        });
      });

      await batch.commit();
    }
  },

  removeFamilySeatAndReduceCount: async (
    invitationId: string,
    family: Family,
    updatedGuestsList: { id: string; nombre: string; estatus: GuestStatus }[],
  ) => {
    const familyRef = familyPaths.family(invitationId, family.id);

    try {
      const newTotal = Math.max(0, updatedGuestsList.length);

      const newConfirmed = updatedGuestsList.filter(
        (g) => g.estatus === "confirmed",
      ).length;

      const payload: Partial<Family> = {
        invitados: newTotal,
        confirmados: newConfirmed,
        asientos: updatedGuestsList,
        ultimaModificacion: serverTimestamp(),
      };

      if (newConfirmed === 0 && family.asistencia === true) {
        payload.asistencia = null;
      }

      const batch = writeBatch(db);
      batch.update(familyRef, payload);

      if (payload.asistencia !== undefined) {
        batch.set(
          familyPaths.familyQuote(invitationId, family.id),
          { asistencia: payload.asistencia },
          { merge: true },
        );
      }

      await batch.commit();
    } catch (e) {
      console.error(
        "Error unificado al remover asiento y reducir contador:",
        e,
      );
      throw e;
    }
  },
};
