import CountdownTimer from "@/components/CountDownTimer";

const finalDate = new Date("2024-09-07T21:00:00");

export default function CountDown() {
  return (
    <div className="relative bg_fixed bg-transparent">
      <div className="overlay bg-countdown" />
      <div className="h-screen w-full pt-24 bg-transparent">
        <div className="flex flex-row items-center justify-center">
          <CountdownTimer targetDate={finalDate} />
        </div>
      </div>
    </div>
  );
}
