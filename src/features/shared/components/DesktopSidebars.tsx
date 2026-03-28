import FlowersCoverUp from "@/icons/flowers-cover-up";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import { brideName, groomName, weddingDate } from "@/constants/constants";

export default function DesktopSidebars() {
  return (
    <>
      {/* Sidebar Izquierdo (Nombres) */}
      <div className="hidden sm:block fixed left-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center">
        <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block" />
        <p className="flex items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl -rotate-90 2xl:-rotate-0 2xl:py-12">
          {brideName} <span className="text-2xl 2xl:text-2xl px-2">&</span>{" "}
          {groomName}
        </p>
        <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block" />
      </div>

      {/* Sidebar Derecho (Fecha) */}
      <div className="hidden sm:block fixed right-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center bg-texture">
        <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block scale-x-[-1]" />
        <p className="flex gap-2 items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl rotate-90 2xl:rotate-0 2xl:py-12">
          {weddingDate.getDate()} <span>/</span>{" "}
          {String(weddingDate.getMonth() + 1).padStart(2, "0")} <span>/</span>{" "}
          {String(weddingDate.getFullYear()).slice(-2)}
        </p>
        <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block scale-x-[-1]" />
      </div>
    </>
  );
}
