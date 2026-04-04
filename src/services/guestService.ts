import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  writeBatch,
  getDoc,
  FirestoreError,
  FirestoreErrorCode,
} from "firebase/firestore";
import {
  Guest,
  GuestContactInfo,
  GuestFormData,
  ImportedGuest,
} from "../../types/types";
import { db } from "@/lib/firebase/config";
import { generateGuestID } from "@/utils/generators";

export const GuestService = {
  subscribeToGuests: (
    invitationId: string,
    callback: (guests: Guest[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    const q = query(collection(db, "invitations", invitationId, "guests"));

    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            tieneTelefono: !!d.tieneTelefono,
          } as Guest;
        });

        callback(
          data.sort(
            (a, b) =>
              // @ts-expect-error Se ignora este error por compatibilidad de campos
              (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0),
          ),
        );
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  getGuestContactInfo: async (invitationId: string, guestId: string) => {
    try {
      const privateRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        guestId,
        "private",
        "contactInfo",
      );
      const snapshot = await getDoc(privateRef);

      if (snapshot.exists()) {
        return snapshot.data() as GuestContactInfo;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

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

    const publicRef = doc(db, "invitations", invitationId, "guests", guestId);

    let publicPayload: Partial<Guest> = {};

    if (isPublic) {
      // 🌍 SI ES UN INVITADO PÚBLICO:
      // Enviamos ÚNICAMENTE los campos permitidos en las reglas de Firestore
      publicPayload = {
        asistencia: data.asistencia,
        confirmados: Number(data.confirmados) || 0,
        ultimaModificacion: timestamp,
      } as Partial<Guest>;
    } else {
      const privateRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        guestId,
        "private",
        "contactInfo",
      );

      const tieneTelefono = !!(
        data.telefono && data.telefono.trim().length > 0
      );
      // 🔒 SI ES EL ADMINISTRADOR:
      // Enviamos toda la información (Nombre, cantidad permitida, permisos, etc)
      publicPayload = {
        nombre: data.nombre,
        invitados: Number(data.invitados) || 1,
        notaAnfitrion: data.notaAnfitrion || null,
        cambiosPermitidos: data.cambiosPermitidos ?? true,
        tieneTelefono,
        ultimaModificacion: timestamp,
        asistencia: data.asistencia,
        confirmados: Number(data.confirmados) || 0,
      };

      if (isNew) {
        publicPayload.id = guestId;
        publicPayload.fechaCreacion = timestamp;
        publicPayload.notaInvitado = null;
        publicPayload.asistencia = null;
        publicPayload.confirmados = null;
      }

      const privatePayload = {
        telefono: data.telefono || null,
      };

      batch.set(privateRef, privatePayload, { merge: true });
    }

    // Usamos merge: true para no borrar los datos del admin cuando el invitado confirma
    batch.set(publicRef, publicPayload, { merge: true });

    await batch.commit();
  },

  deleteGuest: async (invitationId: string, guestId: string) => {
    const batch = writeBatch(db);
    const publicRef = doc(db, "invitations", invitationId, "guests", guestId);
    const privateRef = doc(
      db,
      "invitations",
      invitationId,
      "guests",
      guestId,
      "private",
      "contactInfo",
    );

    batch.delete(privateRef);
    batch.delete(publicRef);

    await batch.commit();
  },

  batchUpdateLock: async (
    invitationId: string | null,
    guestIds: string[],
    shouldLock: boolean,
  ) => {
    if (!invitationId) {
      return;
    }
    const batch = writeBatch(db);

    guestIds.forEach((id) => {
      batch.update(doc(db, "invitations", invitationId, "guests", id), {
        cambiosPermitidos: !shouldLock,
        ultimaModificacion: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  toggleGuestLock: async (invitationId: string, guest: Guest) => {
    const docRef = doc(db, "invitations", invitationId, "guests", guest.id);

    await setDoc(
      docRef,
      {
        cambiosPermitidos: !guest.cambiosPermitidos,
        ultimaModificacion: serverTimestamp(),
      },
      { merge: true },
    );
  },

  batchDeleteGuests: async (invitationId: string, guestIds: string[]) => {
    const batch = writeBatch(db);

    guestIds.forEach((id) => {
      const publicRef = doc(db, "invitations", invitationId, "guests", id);
      const privateRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        id,
        "private",
        "contactInfo",
      );
      batch.delete(privateRef);
      batch.delete(publicRef);
    });

    await batch.commit();
  },

  getGuest: async (
    invitationId: string,
    guestId: string,
  ): Promise<{
    guest: Guest | null;
    error: FirestoreErrorCode | null;
  }> => {
    try {
      const privateRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        guestId,
      );
      const snapshot = await getDoc(privateRef);

      if (snapshot.exists()) {
        return { guest: snapshot.data() as Guest, error: null };
      }
      return { guest: null, error: null };
    } catch (error) {
      const firestoreError = error as FirestoreError;
      return {
        guest: null,
        error: firestoreError.code || "Error desconocido",
      };
    }
  },
  markWhastappSent: async (invitationId: string, guest: Guest) => {
    const docRef = doc(db, "invitations", invitationId, "guests", guest.id);

    await setDoc(
      docRef,
      {
        whatsappEnviado: true,
      } as Partial<Guest>,
      { merge: true },
    );
  },

  batchImportGuests: async (
    invitationId: string,
    parsedGuests: ImportedGuest[],
  ) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // ✅ Promise.all espera TODOS los async antes de continuar
    await Promise.all(
      parsedGuests.map(async (guest) => {
        const guestId = await GuestService.getUniqueGuestId(invitationId);
        const publicRef = doc(
          db,
          "invitations",
          invitationId,
          "guests",
          guestId,
        );
        const privateRef = doc(
          db,
          "invitations",
          invitationId,
          "guests",
          guestId,
          "private",
          "contactInfo",
        );

        const tieneTelefono = !!(
          guest.telefono && guest.telefono.trim().length > 0
        );

        batch.set(publicRef, {
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

        batch.set(privateRef, { telefono: guest.telefono || null });
      }),
    );

    // ✅ Commit solo cuando todos los .set() ya están listos
    await batch.commit();
  },
};
