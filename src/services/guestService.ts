import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  writeBatch,
  getDoc,
  FirestoreError,
  where,
  getDocs,
} from "firebase/firestore";
import { Guest, GuestFormData } from "../../types/types";
import { db } from "@/lib/firebase/config";
import { generateGuestID } from "@/utils/generators";
import { AuthService } from "./authService";

export const GuestService = {
  // Suscripción en tiempo real
  subscribeToGuests: (
    callback: (guests: Guest[]) => void,
    onError?: (error: FirestoreError) => void
  ) => {
    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";
    const q = query(collection(db, "invitations", invitationId, "guests"));
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Guest)
        );
        // Ordenamiento en cliente para no requerir índices complejos
        callback(
          data.sort(
            (a, b) =>
              // @ts-ignore (createdAt puede ser FieldValue en escritura, pero Timestamp en lectura)
              (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0)
          )
        );
      },
      (error) => {
        onError?.(error);
      }
    );
  },
  getUniqueGuestId: async () => {
    let isUnique = false;
    let newId = "";
    let attempts = 0;

    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";

    // Intentamos hasta encontrar uno libre
    while (!isUnique) {
      newId = generateGuestID();

      // Hacemos la llamada de lectura para ver si existe
      const guest = await getDoc(
        doc(db, "invitations", invitationId, "guests", newId)
      );

      if (!guest.exists()) {
        isUnique = true; // ¡Encontramos uno libre! Salimos del bucle
      }

      // Safety break: Evita bucles infinitos en el caso de error
      attempts++;
      if (attempts > 10)
        throw new Error(
          "No se pudo generar un ID único después de varios intentos"
        );
    }

    return newId;
  },

  // Crear o Actualizar
  saveGuest: async (guestId: string, data: GuestFormData, isNew: boolean) => {
    const payload: Partial<Guest> = {
      ...data,
      id: guestId,
      ultimaModificacion: serverTimestamp(),
    };
    if (isNew) payload.fechaCreacion = serverTimestamp();

    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";

    await setDoc(
      doc(db, "invitations", invitationId, "guests", guestId),
      payload,
      { merge: true }
    );
  },

  // Eliminar
  deleteGuest: async (guestId: string) => {
    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";
    await deleteDoc(doc(db, "invitations", invitationId, "guests", guestId));
  },

  // Actualización por lotes (Batch)
  batchUpdateLock: async (guestIds: string[], shouldLock: boolean) => {
    const batch = writeBatch(db);
    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";
    guestIds.forEach((id) => {
      batch.update(doc(db, "invitations", invitationId, "guests", id), {
        cambiosPermitidos: !shouldLock,
      });
    });
    await batch.commit();
  },

  toggleGuestLock: async (guest: Guest) => {
    const payload: Partial<Guest> = {
      ...guest,
      id: guest.id,
      ultimaModificacion: serverTimestamp(),
      cambiosPermitidos: !guest.cambiosPermitidos,
    };

    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";
    await setDoc(
      doc(db, "invitations", invitationId, "guests", guest.id),
      payload,
      { merge: true }
    );
  },

  batchDeleteGuests: async (guestIds: string[]) => {
    const batch = writeBatch(db);
    const invitationId =
      AuthService.getCurrentUser()?.uid === "w6AceU9Qw9XsTkF0GNlCJ0TwriB2"
        ? "ximena-becerra"
        : "default-app";
    guestIds.forEach((id) => {
      // Asegúrate de usar la misma ruta que en saveGuest/subscribe
      const docRef = doc(db, "invitations", invitationId, "guests", id);
      batch.delete(docRef);
    });
    await batch.commit();
  },

  getUserInvitationIds: async (): Promise<string[]> => {
    try {
      const q = query(
        collection(db, "invitations"),
        where(
          "allowedUsers",
          "array-contains",
          AuthService.getCurrentUser()?.uid
        )
      );

      const snapshot = await getDocs(q);

      // Retornamos solo los IDs
      return snapshot.docs.map((doc) => doc.id);
    } catch (error) {
      return [];
    }
  },
};
