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
  GuestStatus,
  ImportedFamily,
} from "@/types";
import { db } from "@/lib/firebase/config";
import { generateFamilyId } from "@/utils/generators";

const invitationsCollectionName = "invitations";
const familiesCollectionName = "families";

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
    doc(
      db,
      invitationsCollectionName,
      invId,
      familiesCollectionName,
      familyId,
      "quotes",
      "quote",
    ),

  familiesCollection: (invId: string): CollectionReference =>
    collection(db, invitationsCollectionName, invId, familiesCollectionName),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BATCH_CHUNK_SIZE = 200; // 200 docs × 2 writes = 400 ops, dentro del límite de 500

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

    // Mantenemos un Map para preservar referencias de objetos no modificados.
    // Esto permite que React.memo en las tarjetas funcione correctamente:
    // solo los invitados que cambiaron en Firestore tendrán nueva referencia.
    const cache = new Map<string, Family>();

    return onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "removed") {
            cache.delete(change.doc.id);
          } else {
            const d = change.doc.data();
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
    familyId: string,
    data: FamilyFormData,
    isNew: boolean,
    isPublic: boolean = false,
  ) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    const publicRef = familyPaths.family(invitationId, familyId);

    if (isPublic) {
      // Invitado confirmando su asistencia: solo campos permitidos por las reglas de Firestore
      batch.set(
        publicRef,
        {
          asistencia: data.asistencia,
          confirmados: Number(data.confirmados) || 0,
          ultimaModificacion: timestamp,
        } as Partial<Family>,
        { merge: true },
      );
    } else {
      // Admin: escribe todos los campos
      const tieneTelefono = !!data.telefono?.trim().length;

      const publicPayload: Partial<Family> = {
        nombre: data.nombre,
        invitados: Number(data.invitados) || 1,
        notaAnfitrion: data.notaAnfitrion || null,
        cambiosPermitidos: data.cambiosPermitidos ?? true,
        tieneTelefono,
        ultimaModificacion: timestamp,
        asistencia: data.asistencia,
        confirmados: Number(data.confirmados) || 0,
        etiqueta: data.etiqueta || null,
        fechaLimiteConfirmacion: data.fechaLimiteConfirmacion || null,
      };

      if (isNew) {
        Object.assign(publicPayload, {
          id: familyId,
          fechaCreacion: timestamp,
          notaInvitado: null,
          asistencia: null,
          confirmados: null,
        });
      }

      batch.set(
        familyPaths.familyContact(invitationId, familyId),
        { telefono: data.telefono || null },
        { merge: true },
      );
      batch.set(publicRef, publicPayload, { merge: true });
    }

    await batch.commit();
  },

  updateGuestList: async (
    invitationId: string,
    familyId: string,
    guests: { id: string; name: string; status: GuestStatus }[],
  ) => {
    const payload = guests.map((g) => ({
      id: g.id,
      name: g.name,
      status: g.status,
    }));

    // Actualiza tu documento de Firebase con este nuevo payload
    await setDoc(
      familyPaths.family(invitationId, familyId),
      {
        guests: payload,
      },
      { merge: true },
    );
  },

  deleteFamily: async (invitationId: string, familyId: string) => {
    const batch = writeBatch(db);
    batch.delete(familyPaths.familyContact(invitationId, familyId));
    batch.delete(familyPaths.family(invitationId, familyId));
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

    // Al desbloquear, siempre establecemos la fecha (null si no se pasa ninguna)
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

        // Al desbloquear, siempre establecemos la fecha (null si no se pasa ninguna)
        if (!shouldLock) {
          payload.fechaLimiteConfirmacion = newDate ?? null;
        }

        batch.update(familyPaths.family(invitationId, familyId), payload);
      });

      await batch.commit();
    }
  },

  batchDeleteFamilies: async (invitationId: string, familyIds: string[]) => {
    // Delete también respeta el límite de 500, pero son solo deletes (1 op c/u × 2 refs)
    for (let i = 0; i < familyIds.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = familyIds.slice(i, i + BATCH_CHUNK_SIZE);

      chunk.forEach((id) => {
        batch.delete(familyPaths.familyContact(invitationId, id));
        batch.delete(familyPaths.family(invitationId, id));
      });

      await batch.commit();
    }
  },

  batchImportFamilies: async (
    invitationId: string,
    parsedFamilies: ImportedFamily[],
  ) => {
    const timestamp = serverTimestamp();

    // Procesamos en chunks para no superar el límite de 500 ops por batch.
    // Cada invitado = 2 writes (public + private) → chunk de 200 = 400 ops máx.
    for (let i = 0; i < parsedFamilies.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = parsedFamilies.slice(i, i + BATCH_CHUNK_SIZE);

      // Generamos todos los IDs del chunk en paralelo
      const familyIds = await Promise.all(
        chunk.map(() => FamiliesService.getUniqueFamilyId(invitationId)),
      );

      chunk.forEach((family, index) => {
        const familyId = familyIds[index];
        const tieneTelefono = !!family.telefono?.trim().length;

        batch.set(familyPaths.family(invitationId, familyId), {
          id: familyId,
          nombre: family.nombre,
          invitados: Number(family.invitados) || 1,
          notaAnfitrion: family.notaAnfitrion || null,
          cambiosPermitidos: true,
          tieneTelefono,
          ultimaModificacion: timestamp,
          fechaCreacion: timestamp,
          asistencia: null,
          confirmados: 0,
          notaInvitado: null,
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
    familyDocId: string, // El ID del documento en Firestore (antiguo guestId/familyId)
    updatedGuestsList: { id: string; nombre: string; estatus: GuestStatus }[],
  ) => {
    const familyRef = familyPaths.family(invitationId, familyDocId);

    try {
      const docSnap = await getDoc(familyRef);
      if (!docSnap.exists()) {
        throw new Error("El documento de la familia no existe");
      }

      // TODO no hacer el getDoc sino más bien enviar el family y que se actualice directamente sin el get
      const data = docSnap.data();
      const currentConfirmed = Number(data.confirmados) || 0;

      // El nuevo total de invitados permitidos es el tamaño de la lista purgada
      // Usamos Math.max(1, ...) por seguridad para que el documento nunca quede en 0 invitados si no lo deseas
      const newTotal = Math.max(1, updatedGuestsList.length);

      // Creamos el payload unificado
      const payload: Partial<Family> = {
        invitados: newTotal,
        asientos: updatedGuestsList,
        ultimaModificacion: serverTimestamp(),
      };

      // Si al reducir el total este queda por debajo de los que ya habían confirmado en Firestore,
      // ajustamos de manera segura el contador de confirmados.
      if (newTotal < currentConfirmed) {
        payload.confirmados = newTotal;
      }

      // Una única escritura en la base de datos para actualizar todo el estado del grupo
      await updateDoc(familyRef, payload);
    } catch (e) {
      console.error(
        "Error unificado al remover asiento y reducir contador:",
        e,
      );
      throw e;
    }
  },
};
