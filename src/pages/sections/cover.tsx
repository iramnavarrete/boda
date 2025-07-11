import AnimatedEntrance from "@/components/AnimatedEntrance";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import FlowersCoverUp from "@/icons/flowers-cover-up";
import GreenWaves from "@/icons/green-waves";

export default function Cover() {
  return (
    <div className="bg_fixed">
      <div className="overlay bg-main" />
      <AnimatedEntrance>
        <div className="h-[calc(100vh-50px)] w-full  flex flex-col  drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)] relative">
          <div className="relative px-3">
            <div className="flex flex-1 justify-center items-center flex-col gap-3 pt-14">
              <FlowersCoverUp className="w-[80%]" />
              <p className="font-nourdLight text-white text-xl">
                NUESTRA BODA
              </p>
              <p className="font-newIconScript text-white text-4xl drop-shadow-[4px_2px_0_rgba(0,0,0,0.25)]">
                Josué & Yaneth
              </p>
              <p className="font-nourdLight text-white text-xl">
                25 / OCT / 2025
              </p>
              <FlowersCoverDown className="w-[80%]" />
            </div>
          </div>
          <GreenWaves className="w-full absolute bottom-[-20px]" />
        </div>
      </AnimatedEntrance>
    </div>
  );
}
