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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const GuestQuotesService = {
  // SUSCRIPCIÓN EN TIEMPO REAL A LOS MENSAJES (QUOTES)
  subscribeToGuestMessages: (
    invitationId: string,
    callback: (messages: any[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    const messagesMap = new Map();
    const quoteUnsubscribes = new Map();

    const guestsRef = collection(db, "invitations", invitationId, "guests");
    const q = query(guestsRef);

    const mainUnsub = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const guestId = change.doc.id;
          const guestData = change.doc.data();

          // Si se agrega o modifica un invitado, aseguramos de escuchar su mensaje
          if (change.type === "added" || change.type === "modified") {
            if (!quoteUnsubscribes.has(guestId)) {
              // Escuchar cambios específicos de la cita de este invitado
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

                      messagesMap.set(guestId, {
                        id: guestId,
                        autor: guestData.nombre || "Invitado",
                        parentesco: guestData.grupo || "Invitado",
                        mensaje: text,
                        fecha: dateFormatted,
                        timestamp: qData.fechaCreacion?.toMillis
                          ? qData.fechaCreacion.toMillis()
                          : Date.now(),
                        leido: qData.leido || false,
                      });
                    } else {
                      messagesMap.delete(guestId);
                    }
                  } else {
                    messagesMap.delete(guestId);
                  }

                  // Emitir el array actualizado y ORDENADO (más recientes primero)
                  const sortedMessages = Array.from(messagesMap.values()).sort(
                    (a, b) => b.timestamp - a.timestamp,
                  );
                  callback(sortedMessages);
                },
                (error) => {
                  console.warn(
                    `Esperando permisos para leer mensaje de: ${guestId}`,
                  );
                },
              );
              quoteUnsubscribes.set(guestId, qUnsub);
            } else {
              // Si el invitado se actualiza pero el listener ya existe, solo actualizamos su nombre/grupo
              if (messagesMap.has(guestId)) {
                const existingMsg = messagesMap.get(guestId);
                messagesMap.set(guestId, {
                  ...existingMsg,
                  autor: guestData.nombre || "Invitado",
                  parentesco: guestData.grupo || "Invitado",
                });

                // Emitir nuevamente ordenado
                const sortedMessages = Array.from(messagesMap.values()).sort(
                  (a, b) => b.timestamp - a.timestamp,
                );
                callback(sortedMessages);
              }
            }
          }

          // Si se elimina al invitado, limpiamos sus listeners de mensajes
          if (change.type === "removed") {
            if (quoteUnsubscribes.has(guestId)) {
              quoteUnsubscribes.get(guestId)();
              quoteUnsubscribes.delete(guestId);
            }
            messagesMap.delete(guestId);

            // Emitir nuevamente ordenado
            const sortedMessages = Array.from(messagesMap.values()).sort(
              (a, b) => b.timestamp - a.timestamp,
            );
            callback(sortedMessages);
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

  getGuestMessages: async (invitationId: string) => {
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
              // Aseguramos que retorne el timestamp para poder ordenar
              timestamp: quoteData.fechaCreacion?.toMillis
                ? quoteData.fechaCreacion.toMillis()
                : Date.now(),
              leido: quoteData.leido || false,
            };
          }
        }

        return null;
      });

      const results = await Promise.all(messagesPromises);

      // Filtramos los nulos y ORDENAMOS por timestamp antes de regresar los datos
      const validMessages = results.filter((msg) => msg !== null);
      return validMessages.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching guest messages:", error);
      throw error;
    }
  },
};
