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
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Invitation } from "@/types";
import { UserProfile } from "@/stores/authStore";

export const invitationsCollectionName = "invitations";

export const invitationPaths = {
  invitation: (invId: string): DocumentReference =>
    doc(db, invitationsCollectionName, invId),
  invitationsCollection: (): CollectionReference =>
    collection(db, invitationsCollectionName),
};

export const InvitationsService = {
  getUserInvitations: async (user: UserProfile) => {
    try {
      const isRoot = !!user.isRootAdmin;

      // Si es Root, descargamos todas las invitaciones sin filtros
      if (isRoot) {
        const q = query(invitationPaths.invitationsCollection());
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
        );
      }

      let allowedInvitationIds: string[] = [];
      const claimsRoles = user.roles;

      if (claimsRoles && Object.keys(claimsRoles).length > 0) {
        // ÉXITO: Leemos desde la memoria (Costo: 0 lecturas extra)
        allowedInvitationIds = Object.keys(claimsRoles);
      } else {
        // PLAN B: Si no hay roles en la memoria, buscamos en la base de datos (Costo: 1 lectura)
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const invitationsMap = userDocSnap.data().invitationsMap || {};
          allowedInvitationIds = Object.keys(invitationsMap);
        }
      }

      // Si definitivamente no tiene eventos asignados, no hacemos más consultas
      if (allowedInvitationIds.length === 0) return [];

      // 3. Consultamos las invitaciones a las que tiene acceso
      // Dividimos en bloques de 30 para evitar el límite de Firestore
      const chunks = [];
      for (let i = 0; i < allowedInvitationIds.length; i += 30) {
        chunks.push(allowedInvitationIds.slice(i, i + 30));
      }

      const fetchPromises = chunks.map(async (chunk) => {
        const q = query(
          invitationPaths.invitationsCollection(),
          where(documentId(), "in", chunk),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
        );
      });

      // Ejecutamos las consultas en paralelo y unimos los resultados
      const results = await Promise.all(fetchPromises);
      return results.flat();
    } catch (error) {
      console.error("Error obteniendo invitaciones:", error);
      return [];
    }
  },

  createInvitation: async (payload: Partial<Invitation>) => {
    try {
      const { id, ...dataToSave } = payload;

      if (!id) {
        throw new Error("El ID de la invitación es obligatorio");
      }

      const docRef = invitationPaths.invitation(id);
      await setDoc(docRef, dataToSave);

      return id;
    } catch (error) {
      console.error("Error creando invitación:", error);
      throw error;
    }
  },

  updateInvitation: async (id: string, payload: Partial<Invitation>) => {
    try {
      const docRef = invitationPaths.invitation(id);

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
      const privateRef = invitationPaths.invitation(invitationId);
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
