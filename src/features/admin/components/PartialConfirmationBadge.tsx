import { Family } from "@/types";
import { getRejectedPasses, isPartialConfirmation } from "@/utils/family";
import { UserMinus } from "lucide-react";
 
const PartialConfirmationBadge = ({ family: family }: { family: Family }) => {
  if (!isPartialConfirmation(family)) return null;
  const rejected = getRejectedPasses(family);

  return (
    <span className="inline-flex items-center gap-1 p-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-orange-200 bg-orange-50 text-orange-600">
      <UserMinus size={10} />
      {rejected} {rejected === 1 ? "pase rechazado" : "pases rechazados"}
    </span>
  );
};

export default PartialConfirmationBadge;