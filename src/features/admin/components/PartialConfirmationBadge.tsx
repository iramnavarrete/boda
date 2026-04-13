import { Guest } from "@/types";
import { getRejectedPasses, isPartialConfirmation } from "@/utils/guest";
import { UserMinus } from "lucide-react";
 
const PartialConfirmationBadge = ({ guest }: { guest: Guest }) => {
  if (!isPartialConfirmation(guest)) return null;
  const rejected = getRejectedPasses(guest);

  return (
    <span className="inline-flex items-center gap-1 p-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-orange-200 bg-orange-50 text-orange-600">
      <UserMinus size={10} />
      {rejected} {rejected === 1 ? "pase rechazado" : "pases rechazados"}
    </span>
  );
};

export default PartialConfirmationBadge;