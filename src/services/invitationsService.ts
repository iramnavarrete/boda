import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Invitation } from "@/types";

export const InvitationsService = {
  isAdmin: async (userId: string) => {
    try {
      const adminDocRef = doc(db, "admin-users", "users");
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const rootUuids = adminDocSnap.data().uuids || [];
        return rootUuids.includes(userId);
      }
      return false;
    } catch (error) {
      console.error("Error al verificar rol de administrador:", error);
      return false;
    }
  },

  getUserInvitations: async (userId: string) => {
    try {
      // Reutilizamos la función de arriba para evitar repetir código
      const isAdmin = await InvitationsService.isAdmin(userId);

      // Construimos la consulta según el rol obtenido
      const q = isAdmin
        ? query(collection(db, "invitations"))
        : query(
            collection(db, "invitations"),
            where("usuariosPermitidos", "array-contains", userId),
          );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Invitation,
      );
    } catch (error) {
      console.error("Error obteniendo invitaciones:", error);
      return [];
    }
  },

  createInvitation: async (payload: Invitation) => {
    try {
      // Extraemos el id para usarlo como ruta, y guardamos el resto de los datos
      const { id, ...dataToSave } = payload;

      if (!id) {
        throw new Error("El ID de la invitación es obligatorio");
      }

      // Usamos doc() con el ID personalizado y setDoc para crearlo
      const docRef = doc(db, "invitations", id);
      await setDoc(docRef, dataToSave);

      return id;
    } catch (error) {
      console.error("Error creando invitación:", error);
      throw error;
    }
  },

  updateInvitation: async (id: string, payload: Partial<Invitation>) => {
    try {
      const docRef = doc(db, "invitations", id);

      const { id: _, ...dataToUpdate } = payload;

      await updateDoc(docRef, dataToUpdate);
    } catch (error) {
      console.error("Error actualizando invitación:", error);
      throw error;
    }
  },

  getInvitation: async (invitationId: string) => {
    try {
      const privateRef = doc(db, "invitations", invitationId);
      const snapshot = await getDoc(privateRef);

      if (snapshot.exists()) {
        return snapshot.data() as Invitation;
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo invitación:", error);
      return null;
    }
  },
};
