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
  Unsubscribe,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FirestoreResult, Guest, GuestQuote } from "@/types";

// Definimos la interfaz para los mensajes tipados correctamente
type GuestQuoteMap = GuestQuote & {
  sortLeido?: boolean;
};

export const GuestQuotesService = {
  // SUSCRIPCIÓN EN TIEMPO REAL A LOS MENSAJES (QUOTES)
  subscribeToGuestMessages: (
    invitationId: string,
    callback: (messages: GuestQuoteMap[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    const messagesMap = new Map<string, GuestQuoteMap>();
    const quoteUnsubscribes = new Map<string, Unsubscribe>();

    const guestsRef = collection(db, "invitations", invitationId, "guests");
    const q = query(guestsRef);

    const notifyChanges = () => {
      const sorted = Array.from(messagesMap.values()).sort((a, b) => {
        // 1. PRIMER NIVEL: Ordenar por estado inicial de lectura
        if (a.sortLeido !== b.sortLeido) {
          return a.sortLeido ? 1 : -1;
        }

        // 2. SEGUNDO NIVEL: Fecha descendente
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });
      callback(sorted);
    };

    const mainUnsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docChanges();
        if (snapshot.empty) {
          callback([]);
        }
        docs.forEach((change) => {
          const guestId = change.doc.id;
          const guestData = change.doc.data() as Guest;

          // Si se agrega o modifica un invitado, aseguramos de escuchar su mensaje
          if (change.type === "added" || change.type === "modified") {
            if (!quoteUnsubscribes.has(guestId)) {
              const quoteRef = doc(guestsRef, guestId, "quotes", "quote");

              const qUnsub = onSnapshot(
                quoteRef,
                (quoteSnap) => {
                  if (quoteSnap.exists()) {
                    const qData = quoteSnap.data();
                    const text = qData.mensaje || qData.message;

                    if (text) {
                      const dateObj = qData.fechaCreacion?.toDate
                        ? qData.fechaCreacion.toDate()
                        : new Date();
                      const dateFormatted = dateObj.toLocaleDateString(
                        "es-MX",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      );

                      const existingMsg = messagesMap.get(guestId);
                      const currentLeido = qData.leido || false;

                      const initialSortLeido = existingMsg
                        ? existingMsg.sortLeido
                        : currentLeido;

                      messagesMap.set(guestId, {
                        id: guestId,
                        autor: guestData.nombre || "Invitado",
                        parentesco: "Invitado",
                        mensaje: text,
                        fecha: dateFormatted,
                        timestamp: qData.fechaCreacion?.toMillis
                          ? qData.fechaCreacion.toMillis()
                          : Date.now(),
                        leido: currentLeido,
                        sortLeido: initialSortLeido,
                        asistencia: guestData.asistencia === true,
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
            } else {
              // Si el invitado se actualiza (ej: cambia su nombre) pero el listener ya existe
              const existingMsg = messagesMap.get(guestId);
              if (existingMsg) {
                messagesMap.set(guestId, {
                  ...existingMsg,
                  autor: guestData.nombre || "Invitado",
                  parentesco: "Invitado",
                });
                notifyChanges();
              }
            }
          }

          // Si se elimina al invitado, limpiamos sus listeners
          if (change.type === "removed") {
            const unsub = quoteUnsubscribes.get(guestId);
            if (unsub) {
              unsub();
              quoteUnsubscribes.delete(guestId);
            }
            messagesMap.delete(guestId);
            notifyChanges();
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
          const quoteData = quoteSnapshot.data();
          const text = quoteData.mensaje || quoteData.message;

          if (text) {
            return {
              id: guestId,
              autor: guestData.nombre || "Invitado",
              parentesco: guestData.grupo || "Invitado",
              mensaje: text,
              fecha: quoteData.fechaCreacion
                ? new Date(
                    quoteData.fechaCreacion.seconds * 1000,
                  ).toLocaleDateString()
                : "Reciente",
              timestamp: quoteData.fechaCreacion?.toMillis
                ? quoteData.fechaCreacion.toMillis()
                : Date.now(),
              leido: quoteData.leido || false,
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
          fecha: timestamp,
          timestamp,
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
