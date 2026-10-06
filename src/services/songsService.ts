import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SongSuggestion } from "@/types";
import { invitationsCollectionName } from "./invitationsService";

const getSongsCollection = (invitationId: string) =>
  collection(db, invitationsCollectionName, invitationId, "songs");

/**
 * Servicio de sugerencias de canciones para la playlist del evento.
 *
 * Solo se usa para FAMILIAS INVITADAS (con `?family=` en la URL).
 * Los invitados anónimos manejan su lista en memoria local con
 * `useState` — sin tocar Firestore.
 *
 * Estructura: `invitations/{invitationId}/songs/{songId}`
 * Campos: { title, artist, suggestedBy, createdAt (serverTimestamp) }
 */
export const SongsService = {
  /**
   * Suscripción en tiempo real a la colección de canciones.
   * Devuelve una función de cleanup para desuscribirse.
   */
  subscribeToSongs: (
    invitationId: string,
    callback: (songs: SongSuggestion[]) => void,
    onError?: (error: FirestoreError) => void,
  ) => {
    if (!invitationId) return () => {};

    return onSnapshot(
      query(getSongsCollection(invitationId), orderBy("createdAt", "desc")),
      (snapshot) => {
        const list: SongSuggestion[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data({ serverTimestamps: "estimate" });
          return {
            id: docSnap.id,
            title: data.title || "",
            artist: data.artist || "",
            suggestedBy: data.suggestedBy || "Invitado",
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          };
        });
        callback(list);
      },
      (error) => {
        if (onError) onError(error);
        else console.error("Error en subscripción de songs:", error);
      },
    );
  },

  /**
   * Agrega una nueva sugerencia. `suggestedBy` debe venir ya resuelto
   * (nombre de familia o nombre del invitado anónimo) — el servicio
   * NO inspecciona URL ni contexto.
   */
  addSong: async (
    invitationId: string,
    payload: { title: string; artist: string; suggestedBy: string },
  ): Promise<{ id: string } | null> => {
    if (!invitationId) return null;
    try {
      const docRef = await addDoc(getSongsCollection(invitationId), {
        title: payload.title.trim(),
        artist: payload.artist.trim(),
        suggestedBy: payload.suggestedBy.trim(),
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id };
    } catch (error) {
      console.error("Error guardando sugerencia de canción:", error);
      return null;
    }
  },
};