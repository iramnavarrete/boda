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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FirestoreResult, Guest, GuestQuote } from "@/types";
import { Unsubscribe } from "firebase/auth";

// Definimos la interfaz para los mensajes tipados correctamente
type GuestQuoteMap = GuestQuote & {
  sortLeido?: boolean;
};

export const GuestQuotesService = {
  subscribeToGuestMessages: (
    invitationId: string,
    callback: (messages: GuestQuoteMap[]) => void, // Sustituye "any" por tu tipo GuestQuoteMap
    onError?: (error: FirestoreError) => void, // Sustituye "any" por FirestoreError
  ) => {
    if (!invitationId) return () => {};

    const messagesMap = new Map<string, GuestQuote>(); // Mapa de mensajes
    const guestsCache = new Map<string, DocumentData>(); // Caché en vivo de invitados
    const quoteUnsubscribes = new Map<string, Unsubscribe>(); // Mapa de desuscripciones

    const guestsRef = collection(db, "invitations", invitationId, "guests");
    const q = query(guestsRef);

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
          const guestId = change.doc.id;
          const guestData = change.doc.data();

          // Si se elimina al invitado, limpiamos sus listeners y cachés
          if (change.type === "removed") {
            const unsub = quoteUnsubscribes.get(guestId);
            if (unsub) {
              unsub();
              quoteUnsubscribes.delete(guestId);
            }
            guestsCache.delete(guestId);
            messagesMap.delete(guestId);
            notifyChanges();
            return; // Terminamos la ejecución para este doc
          }

          // GUARDAMOS SIEMPRE LA VERSIÓN MÁS RECIENTE DEL INVITADO
          guestsCache.set(guestId, guestData);

          if (change.type === "added") {
            // Solo creamos el listener del Quote la primera vez
            if (!quoteUnsubscribes.has(guestId)) {
              const quoteRef = doc(guestsRef, guestId, "quotes", "quote");

              const qUnsub = onSnapshot(
                quoteRef,
                (quoteSnap) => {
                  if (quoteSnap.exists()) {
                    const qData = quoteSnap.data({
                      serverTimestamps: "estimate",
                    });
                    const text = qData.mensaje;

                    if (text) {
                      const currentGuestData = guestsCache.get(guestId) || {};
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

                      messagesMap.set(guestId, {
                        id: guestId,
                        autor: currentGuestData.nombre || "Invitado",
                        parentesco: "Invitado",
                        mensaje: text,
                        fechaCreacion: msCreacion,
                        fechaModificacion: msModificacion,
                        leido: currentLeido,
                        asistencia: currentGuestData.asistencia === true,
                      });
                    } else {
                      messagesMap.delete(guestId);
                    }
                  } else {
                    messagesMap.delete(guestId);
                  }

                  notifyChanges();
                },
                (error) => {
                  console.warn(
                    `Esperando permisos para leer mensaje de: ${guestId}`,
                  );
                },
              );
              quoteUnsubscribes.set(guestId, qUnsub);
            }
          } else if (change.type === "modified") {
            // Si el invitado se modificó (ej. cambió asistencia o nombre)
            // pero el quote listener ya existía, actualizamos el mapa directamente
            const existingMsg = messagesMap.get(guestId);

            if (existingMsg) {
              messagesMap.set(guestId, {
                ...existingMsg,
                autor: guestData.nombre || "Invitado",
                asistencia: guestData.asistencia === true,
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
    guestId: string,
    currentStatus: boolean,
  ) => {
    const quoteRef = doc(
      db,
      "invitations",
      invitationId,
      "guests",
      guestId,
      "quotes",
      "quote",
    );
    await setDoc(quoteRef, { leido: !currentStatus }, { merge: true });
  },

  markAllMessagesAsRead: async (invitationId: string, guestIds: string[]) => {
    if (!guestIds.length) return;
    const batch = writeBatch(db);
    guestIds.forEach((id) => {
      const quoteRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        id,
        "quotes",
        "quote",
      );
      batch.set(quoteRef, { leido: true }, { merge: true });
    });
    await batch.commit();
  },

  getGuestMessages: async (invitationId: string): Promise<GuestQuoteMap[]> => {
    try {
      if (!invitationId) return [];

      const guestsSnapshot = await getDocs(
        collection(db, "invitations", invitationId, "guests"),
      );

      const messagesPromises = guestsSnapshot.docs.map(async (guestDoc) => {
        const guestId = guestDoc.id;
        const guestData = guestDoc.data();

        const quoteRef = doc(
          db,
          "invitations",
          invitationId,
          "guests",
          guestId,
          "quotes",
          "quote",
        );
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
              id: guestId,
              autor: guestData.nombre || "Invitado",
              parentesco: guestData.grupo || "Invitado",
              mensaje: text,
              fechaCreacion: msCreacion,
              fechaModificacion: msModificacion,
              leido: quoteData.leido || false,
              asistencia: guestData.asistencia || false,
            } as GuestQuoteMap;
          }
        }

        return null;
      });

      const results = await Promise.all(messagesPromises);

      return results.filter((msg): msg is GuestQuoteMap => msg !== null);
    } catch (error) {
      console.error("Error fetching guest messages:", error);
      throw error;
    }
  },

  saveGuestQuote: async (
    invitationId: string,
    guestId: string,
    payload: Partial<GuestQuote>,
  ): FirestoreResult<boolean> => {
    if (!invitationId || !guestId || !payload)
      return { result: null, error: null };

    try {
      const timestamp = serverTimestamp();

      const docRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        guestId,
        "quotes",
        "quote",
      );

      const { id: _, ...dataToUpdate } = payload;

      await setDoc(
        docRef,
        {
          ...dataToUpdate,
          leido: false,
          fechaCreacion: timestamp,
          fechaModificacion: timestamp,
        },
        { merge: true },
      );
      return { result: true, error: null };
    } catch (error) {
      console.error("Error actualizando mensaje para anfitrión:", error);
      return { result: false, error: (error as FirestoreError).code };
    }
  },

  getGuestQuote: async (
    invitationId: string,
    guestId: string,
  ): FirestoreResult<GuestQuote> => {
    try {
      const docRef = doc(
        db,
        "invitations",
        invitationId,
        "guests",
        guestId,
        "quotes",
        "quote",
      );

      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return { result: snapshot.data() as GuestQuote, error: null };
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
