"use client";

import { useState, useEffect } from "react";

export function useTimeAgo(timestamp: number | undefined) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!timestamp) return;

    const updateTime = () => {
      const date = new Date(timestamp);
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
