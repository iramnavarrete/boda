"use client";

import { useEffect, useState } from "react";

// --- TIPOS ESTRICTOS ---
type FirestoreTimestamp = {
  toDate: () => Date;
};

type SerializedTimestamp = {
  seconds: number;
  nanoseconds?: number;
};

type ValidTimestamp =
  | Date
  | string
  | number
  | FirestoreTimestamp
  | SerializedTimestamp;

export function useTimeAgo(timestamp?: ValidTimestamp | null) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!timestamp) return;

    const updateTime = () => {
      let date: Date;

      // 1. Normalizamos la fecha utilizando Type Guards estrictos
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        date = new Date(timestamp);
      } else if (
        "toDate" in timestamp &&
        typeof timestamp.toDate === "function"
      ) {
        // Es un Timestamp nativo de Firestore
        date = timestamp.toDate();
      } else if (
        "seconds" in timestamp &&
        typeof timestamp.seconds === "number"
      ) {
        // Es un objeto serializado de Firestore
        date = new Date(timestamp.seconds * 1000);
      } else {
        // Fallback seguro
        date = new Date(String(timestamp));
      }

      // Si por alguna razón la fecha no es válida, abortamos
      if (isNaN(date.getTime())) return;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      // Formateador de horas (ej: "5:00 p.m.")
      const timeFormatter = new Intl.DateTimeFormat("es-MX", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const timeStr = timeFormatter.format(date).toLowerCase();

      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Lógica de visualización
      if (diffMins < 1) {
        setTimeAgo("Hace un momento");
      } else if (diffMins < 60) {
        setTimeAgo(`Hace ${diffMins} min`);
      } else if (targetDate.getTime() === today.getTime()) {
        setTimeAgo(`Hoy a las ${timeStr}`);
      } else if (targetDate.getTime() === yesterday.getTime()) {
        setTimeAgo(`Ayer a las ${timeStr}`);
      } else {
        const diffDays = Math.floor(
          (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays < 7) {
          // "Lunes a las 5:00 p.m."
          const dayFormatter = new Intl.DateTimeFormat("es-MX", {
            weekday: "long",
          });
          const dayStr = dayFormatter.format(date);
          const capitalizedDay =
            dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
          setTimeAgo(`${capitalizedDay} a las ${timeStr}`);
        } else {
          // "16 mar 2026"
          const fullFormatter = new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          setTimeAgo(fullFormatter.format(date));
        }
      }
    };

    // Calcular inmediatamente y luego actualizar cada minuto
    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}
