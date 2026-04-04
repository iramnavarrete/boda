import { useEffect, useState } from "react";

const useCountdown = (targetDate?: Date | string | number | null) => {
  // 1. Validamos la fecha de forma segura ANTES de llamar a cualquier hook.
  // Si targetDate es undefined o inválido, isValidDate será false.
  const isValidDate = targetDate
    ? !isNaN(new Date(targetDate).getTime())
    : false;

  // 2. Si es válida obtenemos los milisegundos, si no, forzamos a 0.
  const countDownDate = isValidDate ? new Date(targetDate!).getTime() : 0;

  // 3. El estado SIEMPRE se inicializa (evita el error de Invalid Hook Call).
  // Si no es válido, iniciamos en 0 para que retorne "00" por defecto.
  const [countDown, setCountDown] = useState(
    isValidDate ? countDownDate - new Date().getTime() : 0,
  );

  // 4. El useEffect SIEMPRE se llama en el mismo orden.
  useEffect(() => {
    // Si la fecha no es válida, abortamos la creación del intervalo
    if (!isValidDate) return;

    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate, isValidDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  const daysFormatted = days < 0 ? "00" : days < 10 ? `0${days}` : `${days}`;
  const hoursFormatted =
    hours < 0 ? "00" : hours < 10 ? `0${hours}` : `${hours}`;
  const minutesFormatted =
    minutes < 0 ? "00" : minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsFormatted =
    seconds < 0 ? "00" : seconds < 10 ? `0${seconds}` : `${seconds}`;

  return [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted];
};

export { useCountdown };
