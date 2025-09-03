import { useEffect, useState } from "react";

export default function AddToCalendar() {
  const [platform, setPlatform] = useState("web");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|macintosh/.test(ua)) {
      setPlatform("apple");
    } else if (/android/.test(ua)) {
      setPlatform("google");
    } else if (/outlook/.test(ua)) {
      setPlatform("outlook");
    } else {
      setPlatform("google"); // fallback general
    }
  }, []);

  const abrirCalendario = () => {
    const titulo = "Boda de Josué & Yaneth";
    const descripcion =
      "La boda más esperada del 2025\n\nCeremonia: https://maps.app.goo.gl/6tZo4PFqmskX2nsa8\n\nRecepción: https://maps.app.goo.gl/dgtiBetWv66uCrRi6\n\n";
    const ubicacion = "Salón de eventos Hacienda Real, Chihuahua, México";

    const fechaInicioUTC = "20251026T030000Z"; // 25 oct 2025, 9:00 PM CDT
    const fechaFinUTC = "20251026T080000Z"; // 26 oct 2025, 2:00 AM CDT

    if (platform === "google") {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        titulo
      )}&details=${encodeURIComponent(
        descripcion
      )}&location=${encodeURIComponent(
        ubicacion
      )}&dates=${fechaInicioUTC}/${fechaFinUTC}`;
      window.open(url, "_blank");
    } else if (platform === "outlook") {
      const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
        titulo
      )}&body=${encodeURIComponent(descripcion)}&location=${encodeURIComponent(
        ubicacion
      )}&startdt=2025-10-25T21:00:00&enddt=2025-10-26T02:00:00`;
      window.open(url, "_blank");
    } else if (platform === "apple") {
      const uid = `evento-${Date.now()}@bidajy.info`;

      const contenidoICS = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//boda//bidajy.info//ES
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${fechaInicioUTC}
DTSTART:${fechaInicioUTC}
DTEND:${fechaFinUTC}
SUMMARY:${titulo}
DESCRIPTION:${descripcion}
LOCATION:${ubicacion}
END:VEVENT
END:VCALENDAR`.trim();

      const blob = new Blob([contenidoICS], {
        type: "text/calendar;charset=utf-8",
      });
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(blob);
      enlace.download = "boda-josue-yaneth.ics";
      enlace.click();
    }
  };

  return (
    <button
      className="border-border-button border-1 mt-8 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
      onClick={abrirCalendario}
    >
      Agregar al Calendario
    </button>
  );
}
