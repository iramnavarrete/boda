import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  FirestoreError,
  FirestoreErrorCode,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Invitation } from "@/types";
import { User } from "firebase/auth";

export const InvitationsService = {
  isAdmin: async (user: User | null): Promise<boolean> => {
    try {
      if (!user) return false;

      const idTokenResult = await user.getIdTokenResult();

      // Leemos el Custom Claim directamente
      return !!idTokenResult.claims.isRootAdmin;
    } catch (error) {
      console.error("Error al verificar rol de administrador:", error);
      return false;
    }
  },

  getUserInvitations: async (user: User) => {
    try {
      // Verificamos si es root leyendo el token local
      const isRoot = await InvitationsService.isAdmin(user);

      if (isRoot) {
        // Si es Root, descargamos todas las invitaciones
        const q = query(collection(db, "invitations"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
        );
      }

      // Si NO es root, buscamos su mapa de accesos en la nueva colección "users"
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) return [];

      const invitationsMap = userDocSnap.data().invitationsMap || {};
      const allowedInvitationIds = Object.keys(invitationsMap);

      // Si no tiene invitaciones asignadas, retornamos vacío inmediatamente
      if (allowedInvitationIds.length === 0) return [];

      // NOTA: Firestore permite un máximo de 30 elementos en la cláusula "in".
      // Si a un guardia le asignas más de 30 eventos a la vez, tendrías que dividir
      // 'allowedInvitationIds' en chunks (lotes) de 30 y hacer múltiples queries.
      const q = query(
        collection(db, "invitations"),
        where(documentId(), "in", allowedInvitationIds),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
      );
    } catch (error) {
      console.error("Error obteniendo invitaciones:", error);
      return [];
    }
  },

  createInvitation: async (payload: Partial<Invitation>) => {
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...dataToUpdate } = payload;

      await updateDoc(docRef, dataToUpdate);
    } catch (error) {
      console.error("Error actualizando invitación:", error);
      throw error;
    }
  },

  getInvitation: async (
    invitationId: string,
  ): Promise<{
    invitation: Invitation | null;
    error: FirestoreErrorCode | null;
  }> => {
    try {
      const privateRef = doc(db, "invitations", invitationId);
      const snapshot = await getDoc(privateRef);

      if (snapshot.exists()) {
        return { invitation: snapshot.data() as Invitation, error: null };
      }
      return { invitation: null, error: null };
    } catch (error) {
      const firestoreError = error as FirestoreError;
      return {
        invitation: null,
        error: firestoreError.code || "Error desconocido",
      };
    }
  },
};
