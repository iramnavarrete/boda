import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Invitation } from "@/types";

export const InvitationsService = {
  getUserInvitations: async (userId: string) => {
    try {
      const q = query(
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
      return [];
    }
  },
};
