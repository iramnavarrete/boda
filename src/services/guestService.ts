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
} from "firebase/firestore";
import { Guest, GuestContactInfo, GuestFormData } from "../../types/types";
import { db } from "@/lib/firebase/config";
import { generateGuestID } from "@/utils/generators";
import { AuthService } from "./authService";

const getInvitationId = (): string => {
  const user = AuthService.getCurrentUser();
  return user?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
    ? "ximena-becerra"
    : "default-app";
};

export const GuestService = {
  subscribeToGuests: (
    invitationId: string, // <--- AHORA SE RECIBE COMO PARÁMETRO
    callback: (guests: Guest[]) => void,
    onError?: (error: FirestoreError) => void
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

        // Ordenamiento en cliente (Más recientes primero)
        callback(
          data.sort(
            (a, b) =>
              // @ts-ignore
              (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0)
          )
        );
      },
      (error) => {
        onError?.(error);
      }
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
        "contactInfo"
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

  // GENERAR ID ÚNICO
  getUniqueGuestId: async (invitationId: string) => {
    let isUnique = false;
    let newId = "";
    let attempts = 0;

    while (!isUnique) {
      newId = generateGuestID();
      const guest = await getDoc(
        doc(db, "invitations", invitationId, "guests", newId)
      );

      if (!guest.exists()) {
        isUnique = true;
      }

      attempts++;
      if (attempts > 15) {
        throw new Error(
          "No se pudo generar un ID único después de varios intentos"
        );
      }
    }

    return newId;
  },

  saveGuest: async (
    invitationId: string,
    guestId: string,
    data: GuestFormData,
    isNew: boolean
  ) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // Referencias
    const publicRef = doc(db, "invitations", invitationId, "guests", guestId);
    const privateRef = doc(
      db,
      "invitations",
      invitationId,
      "guests",
      guestId,
      "private",
      "contactInfo"
    );

    const tieneTelefono = !!(data.telefono && data.telefono.trim().length > 0);

    const publicPayload: Partial<Guest> = {
      nombre: data.nombre,
      invitados: Number(data.invitados) || 1,
      notaAnfitrion: data.notaAnfitrion || null,
      cambiosPermitidos: data.cambiosPermitidos ?? true,
      tieneTelefono,
      ultimaModificacion: timestamp,
      asistencia: data.asistencia,
      confirmados: Number(data.confirmados),
    };

    // Si es nuevo, inicializamos campos faltantes
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

    // Agregamos al batch
    batch.set(publicRef, publicPayload, { merge: true });
    batch.set(privateRef, privatePayload, { merge: true });

    // Ejecutamos ambas escrituras
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
      "contactInfo"
    );

    batch.delete(privateRef);
    batch.delete(publicRef);

    await batch.commit();
  },

  batchUpdateLock: async (
    invitationId: string,
    guestIds: string[],
    shouldLock: boolean
  ) => {
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
      { merge: true }
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
        "contactInfo"
      );
      batch.delete(privateRef);
      batch.delete(publicRef);
    });

    await batch.commit();
  },
};
