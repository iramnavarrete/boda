import AnimatedEntrance from "@/components/AnimatedEntrance";

export default function Cover() {
  return (
    <div className="bg_fixed">
      <div className="overlay bg-main" />
      <AnimatedEntrance>
        <div className="h-[calc(100vh-50px)] w-full justify-end items-end flex flex-col px-3 drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]">
          <div className="relative">
            <p className="font-sacramento text-6xl text-white drop-shadow-[8px_2px_0_rgba(0,0,0,0.25)]">
              Megan
            </p>
            <p className="font-outfit absolute top-0 right-0 text-sm text-white">
              Mis <span className="text-primary">XV</span> años
            </p>
          </div>
          <p className="font-handlee pt-8 pb-2 text-white">
            7 de Septiembre del 2024
          </p>
        </div>
      </AnimatedEntrance>
    </div>
  );
}
