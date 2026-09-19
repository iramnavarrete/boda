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

/**
 * Formatea un timestamp como texto relativo en español.
 *
 * Se extrae a una función pura para poder inicializar el estado del
 * hook sincrónicamente (sin esperar al `useEffect`). Esto evita que
 * las cards virtualizadas (masonic) parpadeen con texto vacío cada
 * vez que se desmontan/remontan al scrollear.
 */
function formatTimeAgo(timestamp: ValidTimestamp | null | undefined): string {
  if (!timestamp) return "";

  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  } else if (
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    date = timestamp.toDate();
  } else if (
    "seconds" in timestamp &&
    typeof timestamp.seconds === "number"
  ) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(String(timestamp));
  }

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const timeFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const timeStr = timeFormatter.format(date).toLowerCase();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Hace un momento";
  } else if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else if (targetDate.getTime() === today.getTime()) {
    return `Hoy a las ${timeStr}`;
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return `Ayer a las ${timeStr}`;
  } else {
    const diffDays = Math.floor(
      (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 7) {
      const dayFormatter = new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
      });
      const dayStr = dayFormatter.format(date);
      const capitalizedDay =
        dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
      return `${capitalizedDay} a las ${timeStr}`;
    } else {
      const fullFormatter = new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return fullFormatter.format(date);
    }
  }
}

export function useTimeAgo(timestamp?: ValidTimestamp | null) {
  // Inicializamos SINCRONICAMENTE para evitar el flash de string vacío
  // en mounts/remounts de la virtualización.
  const [timeAgo, setTimeAgo] = useState<string>(() =>
    formatTimeAgo(timestamp ?? null),
  );

  useEffect(() => {
    // Re-sincronizamos tras el mount por si `timestamp` cambió y para
    // actualizar el texto cada minuto.
    setTimeAgo(formatTimeAgo(timestamp ?? null));
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp ?? null));
    }, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}
