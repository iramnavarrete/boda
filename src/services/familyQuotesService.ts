import {
  setDoc,
  onSnapshot,
  query,
  writeBatch,
  getDoc,
  getDocs,
  FirestoreError,
  serverTimestamp,
  updateDoc,
  collection,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FirestoreResult, FamilyQuote, Family } from "@/types";
import { FamiliesService } from "./familiesService";
import { invitationsCollectionName } from "./invitationsService";

const getQuotesCollection = (invitationId: string) =>
  collection(db, invitationsCollectionName, invitationId, "quotes");

const getQuoteDoc = (invitationId: string, familyId: string) =>
  doc(db, invitationsCollectionName, invitationId, "quotes", familyId);

export type FamilyQuoteMap = Omit<FamilyQuote, "asistencia"> & {
  sortLeido?: boolean;
  asistencia?: boolean | null | "deleted";
  parentesco?: string;
};

export const FamilyQuotesService = {
  subscribeToQuoteMessages: (
    invitationId: string,
    callback: (messages: FamilyQuoteMap[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    let quotesList: FamilyQuoteMap[] = [];
    let familiesList: Family[] = [];

    // "Join" Reactivo: Combina los mensajes con las familias en vivo
    const notifyChanges = () => {
      const merged = quotesList.map((q): FamilyQuoteMap => {
        const fam = familiesList.find((f) => f.id === q.id);

        return {
          ...q,
          // Si la familia existe, actualizamos su nombre/etiqueta en tiempo real
          // Si fue eliminada, conservamos los datos originales del quote.
          autor: fam ? fam.nombre : q.autor,
          parentesco: fam
            ? fam.etiqueta || "Invitado"
            : q.parentesco || "Invitado",
          // Si fam existe, tomamos su asistencia (boolean | null), si no existe mandamos "deleted"
          asistencia: fam !== undefined ? fam.asistencia : "deleted",
        };
      });

      const sorted = merged.sort((a, b) => {
        const timeA = a.fechaModificacion || 0;
        const timeB = b.fechaModificacion || 0;
        return timeB - timeA;
      });

      callback(sorted);
    };

    const unsubQuotes = onSnapshot(
      query(getQuotesCollection(invitationId)),
      (snapshot) => {
        quotesList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data({ serverTimestamps: "estimate" });
          return {
            id: docSnap.id,
            autor: data.autor || "Invitado",
            mensaje: data.mensaje || "",
            fechaCreacion: data.fechaCreacion?.toMillis?.() || Date.now(),
            fechaModificacion:
              data.fechaModificacion?.toMillis?.() || Date.now(),
            leido: data.leido || false,
            parentesco: data.parentesco || "Invitado",
            asistencia: null, // Valor temporal hasta que haga merge con familiesList
          } as FamilyQuoteMap;
        });
        notifyChanges();
      },
      (error) => {
        if (onError) onError(error);
        else console.error("Error en subscripción de quotes:", error);
      },
    );

    const unsubFamilies = FamiliesService.subscribeToFamilies(
      invitationId,
      (fams) => {
        familiesList = fams;
        notifyChanges();
      },
      (error) => console.error("Error al obtener familias para quotes:", error),
    );

    return () => {
      unsubQuotes();
      unsubFamilies();
    };
  },

  toggleMessageReadStatus: async (
    invitationId: string,
    familyId: string,
    currentStatus: boolean,
  ) => {
    const quoteRef = getQuoteDoc(invitationId, familyId);
    await setDoc(quoteRef, { leido: !currentStatus }, { merge: true });
  },

  markAllMessagesAsRead: async (invitationId: string, familyIds: string[]) => {
    if (!familyIds.length) return;
    const batch = writeBatch(db);
    familyIds.forEach((id) => {
      const quoteRef = getQuoteDoc(invitationId, id);
      batch.set(quoteRef, { leido: true }, { merge: true });
    });
    await batch.commit();
  },

  getFamilyMessages: async (
    invitationId: string,
  ): Promise<FamilyQuoteMap[]> => {
    try {
      if (!invitationId) return [];

      const quotesSnap = await getDocs(getQuotesCollection(invitationId));

      return quotesSnap.docs.map((docSnap) => {
        const data = docSnap.data({ serverTimestamps: "estimate" });
        return {
          id: docSnap.id,
          autor: data.autor || "Invitado",
          mensaje: data.mensaje || "",
          fechaCreacion: data.fechaCreacion?.toMillis?.() || Date.now(),
          fechaModificacion: data.fechaModificacion?.toMillis?.() || Date.now(),
          leido: data.leido || false,
          parentesco: data.parentesco || "Invitado",
          asistencia: null,
        } as FamilyQuoteMap;
      });
    } catch (error) {
      console.error("Error fetching family messages:", error);
      throw error;
    }
  },

  saveFamilyQuote: async (
    invitationId: string,
    familyId: string,
    payload: Partial<FamilyQuote>,
  ): Promise<FirestoreResult<boolean>> => {
    if (!invitationId || !familyId || !payload)
      return { result: null, error: null };

    try {
      const timestamp = serverTimestamp();
      const docRef = getQuoteDoc(invitationId, familyId);
      const { id: _, ...dataToUpdate } = payload;

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...dataToUpdate,
          leido: false,
          fechaModificacion: timestamp,
        });
      } else {
        await setDoc(docRef, {
          ...dataToUpdate,
          familyId, // Conservamos el ID por si borran la familia
          leido: false,
          fechaCreacion: timestamp,
          fechaModificacion: timestamp,
        });
      }

      return { result: true, error: null };
    } catch (error) {
      console.error("Error guardando mensaje de la familia:", error);
      return {
        result: false,
        error: (error as FirestoreError).code || "unknown-error",
      };
    }
  },

  getFamilyQuote: async (
    invitationId: string,
    familyId: string,
  ): FirestoreResult<FamilyQuote> => {
    try {
      const docRef = getQuoteDoc(invitationId, familyId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return { result: snapshot.data() as FamilyQuote, error: null };
      }
      return { result: null, error: null };
    } catch (error) {
      const firestoreError = error as FirestoreError;
      return {
        result: null,
        error: firestoreError.code || "Error desconocido",
      };
    }
  },
};
