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
} from "firebase/firestore";
import { nanoid } from "nanoid";
import {
  Guest,
  GuestContactInfo,
  GuestFormData,
  ImportedGuest,
} from "../../types/types";
import { db } from "@/lib/firebase/config";
import { generateGuestID } from "@/utils/generators";

// ─── Paths ────────────────────────────────────────────────────────────────────
// Centraliza todas las referencias a Firestore.
// Si cambia la estructura de la DB, solo se toca aquí.

const paths = {
  guest: (invId: string, guestId: string): DocumentReference =>
    doc(db, "invitations", invId, "guests", guestId),

  guestContact: (invId: string, guestId: string): DocumentReference =>
    doc(db, "invitations", invId, "guests", guestId, "private", "contactInfo"),

  guestsCollection: (invId: string): CollectionReference =>
    collection(db, "invitations", invId, "guests"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BATCH_CHUNK_SIZE = 200; // 200 docs × 2 writes = 400 ops, dentro del límite de 500

const byCreatedDesc = (a: Guest, b: Guest): number =>
  ((b.fechaCreacion as Timestamp)?.seconds ?? 0) -
  ((a.fechaCreacion as Timestamp)?.seconds ?? 0);

// Genera un ID único sin roundtrips a Firestore.
// Con nanoid(10) la probabilidad de colisión con <100k registros es despreciable (~1 en 10^12).
const generateGuestId = (): string => nanoid(10);

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const GuestService = {
  // ── Suscripción en tiempo real ──────────────────────────────────────────────

  subscribeToGuests: (
    invitationId: string,
    callback: (guests: Guest[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    const q = query(paths.guestsCollection(invitationId));

    // Mantenemos un Map para preservar referencias de objetos no modificados.
    // Esto permite que React.memo en las tarjetas funcione correctamente:
    // solo los invitados que cambiaron en Firestore tendrán nueva referencia.
    const cache = new Map<string, Guest>();

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
            } as Guest);
          }
        });

        callback(Array.from(cache.values()).sort(byCreatedDesc));
      },
      (error) => onError?.(error),
    );
  },

  // ── Lectura ─────────────────────────────────────────────────────────────────

  getGuest: async (
    invitationId: string,
    guestId: string,
  ): Promise<{ guest: Guest | null; error: FirestoreErrorCode | null }> => {
    try {
      const snapshot = await getDoc(paths.guest(invitationId, guestId));
      if (!snapshot.exists()) return { guest: null, error: null };
      return { guest: snapshot.data() as Guest, error: null };
    } catch (error) {
      return {
        guest: null,
        error: (error as FirestoreError).code ?? "unknown",
      };
    }
  },

  getGuestContactInfo: async (
    invitationId: string,
    guestId: string,
  ): Promise<GuestContactInfo | null> => {
    try {
      const snapshot = await getDoc(paths.guestContact(invitationId, guestId));
      return snapshot.exists() ? (snapshot.data() as GuestContactInfo) : null;
    } catch {
      return null;
    }
  },

  // ── Escritura individual ────────────────────────────────────────────────────

  getUniqueGuestId: async (invitationId: string) => {
    let isUnique = false;
    let newId = "";
    let attempts = 0;

    while (!isUnique) {
      newId = generateGuestID();
      const guest = await getDoc(
        doc(db, "invitations", invitationId, "guests", newId),
      );

      if (!guest.exists()) {
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

  saveGuest: async (
    invitationId: string,
    guestId: string,
    data: GuestFormData,
    isNew: boolean,
    isPublic: boolean = false,
  ) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    const publicRef = paths.guest(invitationId, guestId);

    if (isPublic) {
      // Invitado confirmando su asistencia: solo campos permitidos por las reglas de Firestore
      batch.set(
        publicRef,
        {
          asistencia: data.asistencia,
          confirmados: Number(data.confirmados) || 0,
          ultimaModificacion: timestamp,
        } as Partial<Guest>,
        { merge: true },
      );
    } else {
      // Admin: escribe todos los campos
      const tieneTelefono = !!data.telefono?.trim().length;

      const publicPayload: Partial<Guest> = {
        nombre: data.nombre,
        invitados: Number(data.invitados) || 1,
        notaAnfitrion: data.notaAnfitrion || null,
        cambiosPermitidos: data.cambiosPermitidos ?? true,
        tieneTelefono,
        ultimaModificacion: timestamp,
        asistencia: data.asistencia,
        confirmados: Number(data.confirmados) || 0,
        etiqueta: data.etiqueta,
        fechaLimiteConfirmacion: data.fechaLimiteConfirmacion || null,
      };

      if (isNew) {
        Object.assign(publicPayload, {
          id: guestId,
          fechaCreacion: timestamp,
          notaInvitado: null,
          asistencia: null,
          confirmados: null,
        });
      }

      batch.set(
        paths.guestContact(invitationId, guestId),
        { telefono: data.telefono || null },
        { merge: true },
      );
      batch.set(publicRef, publicPayload, { merge: true });
    }

    await batch.commit();
  },

  deleteGuest: async (invitationId: string, guestId: string) => {
    const batch = writeBatch(db);
    batch.delete(paths.guestContact(invitationId, guestId));
    batch.delete(paths.guest(invitationId, guestId));
    await batch.commit();
  },

  toggleGuestLock: async (
    invitationId: string,
    guest: Guest,
    forceLock?: boolean,
    newDate?: string,
  ) => {
    const isLocking =
      forceLock !== undefined ? forceLock : guest.cambiosPermitidos;

    const payload: Partial<Guest> = {
      cambiosPermitidos: !isLocking,
      ultimaModificacion: serverTimestamp(),
    };

    // Al desbloquear, siempre establecemos la fecha (null si no se pasa ninguna)
    if (!isLocking) {
      payload.fechaLimiteConfirmacion = newDate ?? null;
    }

    await updateDoc(paths.guest(invitationId, guest.id), payload);
  },

  markWhatsAppSent: async (
    invitationId: string,
    guest: Pick<Guest, "id">,
    deadlineDate?: string,
  ) => {
    await updateDoc(paths.guest(invitationId, guest.id), {
      cambiosPermitidos: true,
      whatsappEnviado: true,
      fechaWhatsappEnviado: serverTimestamp(),
      fechaLimiteConfirmacion: deadlineDate ?? null,
    } as Partial<Guest>);
  },

  markReminderAsSent: async (
    invitationId: string,
    guest: Pick<Guest, "id">,
    deadlineDate?: string,
  ) => {
    await updateDoc(paths.guest(invitationId, guest.id), {
      cambiosPermitidos: true,
      recordatorioEnviado: true,
      fechaRecordatorioEnviado: serverTimestamp(),
      fechaLimiteConfirmacion: deadlineDate ?? null,
    } as Partial<Guest>);
  },

  // ── Operaciones en lote ─────────────────────────────────────────────────────

  batchUpdateLock: async (
    invitationId: string | null,
    guestIds: string[],
    shouldLock: boolean,
    newDate?: string,
  ) => {
    if (!invitationId) return;

    for (let i = 0; i < guestIds.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = guestIds.slice(i, i + BATCH_CHUNK_SIZE);

      chunk.forEach((guestId) => {
        const payload: Partial<Guest> = {
          cambiosPermitidos: !shouldLock,
          ultimaModificacion: serverTimestamp(),
        };

        // Al desbloquear, siempre establecemos la fecha (null si no se pasa ninguna)
        if (!shouldLock) {
          payload.fechaLimiteConfirmacion = newDate ?? null;
        }

        batch.update(paths.guest(invitationId, guestId), payload);
      });

      await batch.commit();
    }
  },

  batchDeleteGuests: async (invitationId: string, guestIds: string[]) => {
    // Delete también respeta el límite de 500, pero son solo deletes (1 op c/u × 2 refs)
    for (let i = 0; i < guestIds.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = guestIds.slice(i, i + BATCH_CHUNK_SIZE);

      chunk.forEach((id) => {
        batch.delete(paths.guestContact(invitationId, id));
        batch.delete(paths.guest(invitationId, id));
      });

      await batch.commit();
    }
  },

  batchImportGuests: async (
    invitationId: string,
    parsedGuests: ImportedGuest[],
  ) => {
    const timestamp = serverTimestamp();

    // Procesamos en chunks para no superar el límite de 500 ops por batch.
    // Cada invitado = 2 writes (public + private) → chunk de 200 = 400 ops máx.
    for (let i = 0; i < parsedGuests.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = parsedGuests.slice(i, i + BATCH_CHUNK_SIZE);

      // Generamos todos los IDs del chunk en paralelo
      const guestIds = await Promise.all(chunk.map(() => generateGuestId()));

      chunk.forEach((guest, index) => {
        const guestId = guestIds[index];
        const tieneTelefono = !!guest.telefono?.trim().length;

        batch.set(paths.guest(invitationId, guestId), {
          id: guestId,
          nombre: guest.nombre,
          invitados: Number(guest.invitados) || 1,
          notaAnfitrion: guest.notaAnfitrion || null,
          cambiosPermitidos: true,
          tieneTelefono,
          ultimaModificacion: timestamp,
          fechaCreacion: timestamp,
          asistencia: null,
          confirmados: 0,
          notaInvitado: null,
        });

        batch.set(paths.guestContact(invitationId, guestId), {
          telefono: guest.telefono || null,
        });
      });

      await batch.commit();
    }
  },
};
