import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const InvitationsService = {
  getUserInvitations: async (userId: string) => {
    try {
      const q = query(
        collection(db, "invitations"),
        where("allowedUsers", "array-contains", userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      return [];
    }
  },
};
