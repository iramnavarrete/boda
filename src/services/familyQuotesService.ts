import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  writeBatch,
  getDoc,
  getDocs,
  FirestoreError,
  serverTimestamp,
  DocumentData,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FirestoreResult, FamilyQuote } from "@/types";
import { Unsubscribe } from "firebase/auth";
import { familyPaths } from "./familiesService";

// Definimos la interfaz para los mensajes tipados correctamente
type FamilyQuoteMap = FamilyQuote & {
  sortLeido?: boolean;
};

export const FamilyQuotesService = {
  subscribeToQuoteMessages: (
    invitationId: string,
    callback: (messages: FamilyQuoteMap[]) => void, // Sustituye "any" por tu tipo FamilyQuoteMap
    onError?: (error: FirestoreError) => void, // Sustituye "any" por FirestoreError
  ) => {
    if (!invitationId) return () => {};

    const messagesMap = new Map<string, FamilyQuote>(); // Mapa de mensajes
    const familiesCache = new Map<string, DocumentData>(); // Caché en vivo de invitados
    const quoteUnsubscribes = new Map<string, Unsubscribe>(); // Mapa de desuscripciones

    const familiesRef = familyPaths.familiesCollection(invitationId);
    const q = query(familiesRef);

    const notifyChanges = () => {
      const sorted = Array.from(messagesMap.values()).sort((a, b) => {
        // ÚNICO NIVEL: Ordenar estrictamente por fechaModificacion descendente.
        const timeA = a.fechaModificacion || 0;
        const timeB = b.fechaModificacion || 0;
        return timeB - timeA;
      });
      callback(sorted);
    };

    const mainUnsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback([]);
        }

        const docs = snapshot.docChanges();

        docs.forEach((change) => {
          const familyId = change.doc.id;
          const familyData = change.doc.data();

          // Si se elimina al invitado, limpiamos sus listeners y cachés
          if (change.type === "removed") {
            const unsub = quoteUnsubscribes.get(familyId);
            if (unsub) {
              unsub();
              quoteUnsubscribes.delete(familyId);
            }
            familiesCache.delete(familyId);
            messagesMap.delete(familyId);
            notifyChanges();
            return; // Terminamos la ejecución para este doc
          }

          // GUARDAMOS SIEMPRE LA VERSIÓN MÁS RECIENTE DEL INVITADO
          familiesCache.set(familyId, familyData);

          if (change.type === "added") {
            // Solo creamos el listener del Quote la primera vez
            if (!quoteUnsubscribes.has(familyId)) {
              const quoteRef = familyPaths.familyQuote(invitationId, familyId);

              const qUnsub = onSnapshot(
                quoteRef,
                (quoteSnap) => {
                  if (quoteSnap.exists()) {
                    const qData = quoteSnap.data({
                      serverTimestamps: "estimate",
                    });
                    const text = qData.mensaje;

                    if (text) {
                      const currentFamilyData =
                        familiesCache.get(familyId) || {};
                      const currentLeido = qData.leido || false;

                      let msCreacion = 0;
                      if (qData.fechaCreacion) {
                        if (typeof qData.fechaCreacion === "number") {
                          msCreacion = qData.fechaCreacion;
                        } else if (
                          typeof qData.fechaCreacion.toMillis === "function"
                        ) {
                          msCreacion = qData.fechaCreacion.toMillis();
                        }
                      }

                      // Extracción segura de fechaModificacion
                      let msModificacion = msCreacion;
                      if (qData.fechaModificacion) {
                        if (typeof qData.fechaModificacion === "number") {
                          msModificacion = qData.fechaModificacion;
                        } else if (
                          typeof qData.fechaModificacion.toMillis === "function"
                        ) {
                          msModificacion = qData.fechaModificacion.toMillis();
                        }
                      }

                      messagesMap.set(familyId, {
                        id: familyId,
                        autor: currentFamilyData.nombre || "Invitado",
                        parentesco: "Invitado",
                        mensaje: text,
                        fechaCreacion: msCreacion,
                        fechaModificacion: msModificacion,
                        leido: currentLeido,
                        asistencia: currentFamilyData.asistencia === true,
                      });
                    } else {
                      messagesMap.delete(familyId);
                    }
                  } else {
                    messagesMap.delete(familyId);
                  }

                  notifyChanges();
                },
                (error) => {
                  console.warn(
                    `Esperando permisos para leer mensaje de: ${familyId}`,
                  );
                },
              );
              quoteUnsubscribes.set(familyId, qUnsub);
            }
          } else if (change.type === "modified") {
            // Si el invitado se modificó (ej. cambió asistencia o nombre)
            // pero el quote listener ya existía, actualizamos el mapa directamente
            const existingMsg = messagesMap.get(familyId);

            if (existingMsg) {
              messagesMap.set(familyId, {
                ...existingMsg,
                autor: familyData.nombre || "Invitado",
                asistencia: familyData.asistencia === true,
              });
              notifyChanges();
            }
          }
        });
      },
      (error) => {
        if (onError) onError(error);
        else
          console.error("Error en subscripción de invitados principal:", error);
      },
    );

    return () => {
      mainUnsub();
      quoteUnsubscribes.forEach((unsub) => unsub());
    };
  },

  // FUNCIONES PARA MARCAR LEÍDO / NO LEÍDO EN LA BASE DE DATOS
  toggleMessageReadStatus: async (
    invitationId: string,
    familyId: string,
    currentStatus: boolean,
  ) => {
    const quoteRef = familyPaths.familyQuote(invitationId, familyId);
    await setDoc(quoteRef, { leido: !currentStatus }, { merge: true });
  },

  markAllMessagesAsRead: async (invitationId: string, familyIds: string[]) => {
    if (!familyIds.length) return;
    const batch = writeBatch(db);
    familyIds.forEach((id) => {
      const quoteRef = familyPaths.familyQuote(invitationId, id);
      batch.set(quoteRef, { leido: true }, { merge: true });
    });
    await batch.commit();
  },

  getFamilyMessages: async (
    invitationId: string,
  ): Promise<FamilyQuoteMap[]> => {
    try {
      if (!invitationId) return [];

      const familiesSnapshot = await getDocs(
        familyPaths.familiesCollection(invitationId),
      );

      const messagesPromises = familiesSnapshot.docs.map(async (familyDoc) => {
        const familyId = familyDoc.id;
        const familyData = familyDoc.data();

        const quoteRef = familyPaths.familyQuote(invitationId, familyId);
        const quoteSnapshot = await getDoc(quoteRef);

        if (quoteSnapshot.exists()) {
          const quoteData = quoteSnapshot.data({
            serverTimestamps: "estimate",
          });
          const text = quoteData.mensaje;

          // Convertimos de forma segura a milisegundos
          const msCreacion = quoteData.fechaCreacion?.toMillis
            ? quoteData.fechaCreacion.toMillis()
            : Date.now();

          const msModificacion = quoteData.fechaModificacion?.toMillis
            ? quoteData.fechaModificacion.toMillis()
            : msCreacion;

          if (text) {
            return {
              id: familyId,
              autor: familyData.nombre || "Invitado",
              parentesco: familyData.grupo || "Invitado",
              mensaje: text,
              fechaCreacion: msCreacion,
              fechaModificacion: msModificacion,
              leido: quoteData.leido || false,
              asistencia: familyData.asistencia || false,
            } as FamilyQuoteMap;
          }
        }

        return null;
      });

      const results = await Promise.all(messagesPromises);

      return results.filter((msg): msg is FamilyQuoteMap => msg !== null);
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

      const docRef = familyPaths.familyQuote(invitationId, familyId);

      const { id: _, ...dataToUpdate } = payload;

      // Verificamos si el documento existe explícitamente en lugar de depender del try-catch de Firebase
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Si ya existe, solo actualizamos (Ideal para cuando el invitado edita)
        await updateDoc(docRef, {
          ...dataToUpdate,
          leido: false,
          fechaModificacion: timestamp,
        });
      } else {
        // Si no existe, lo creamos con ambas fechas
        await setDoc(docRef, {
          ...dataToUpdate,
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
      const docRef = familyPaths.familyQuote(invitationId, familyId);

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
