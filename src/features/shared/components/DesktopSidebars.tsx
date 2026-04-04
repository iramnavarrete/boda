import FlowersCoverUp from "@/icons/flowers-cover-up";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { formatToEventDate } from "@/utils/formatters";

export default function DesktopSidebars() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  return (
    <>
      {/* Sidebar Izquierdo (Nombres) */}
      <div className="hidden sm:block fixed left-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center">
        <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block" />
        <p className="flex items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl -rotate-90 2xl:-rotate-0 2xl:py-12">
          {invitationData?.nombre || ""}
        </p>
        <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block" />
      </div>

      {/* Sidebar Derecho (Fecha) */}
      <div className="hidden sm:block fixed right-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center bg-texture">
        <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block scale-x-[-1]" />
        <p className="flex gap-2 items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl rotate-90 2xl:rotate-0 2xl:py-12">
          {formatToEventDate(invitationData?.fechaISO, true)}
        </p>
        <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block scale-x-[-1]" />
      </div>
    </>
  );
}
