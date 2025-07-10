import { useEffect, useState } from "react";

const useCountdown = (targetDate: Date) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  const daysFormatted = days < 10 ? `0${days}` : `${days}`;
  const hoursFormatted = hours < 10 ? `0${hours}` : `${hours}`;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsFormatted = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted];
};

export { useCountdown };
