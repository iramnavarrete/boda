import { Users } from "lucide-react";
import GuestsCards from "./GuestsCards";
import { Guest } from "@/types";
import Loader from "@/features/front/components/Loader";

interface GuestsGridViewProps {
  filteredGuests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
  isLoading: boolean;
}

export default function GuestsGridView({
  filteredGuests,
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
  isLoading,
}: GuestsGridViewProps) {
  if (filteredGuests.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <Users className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-2 text-stone-500">No se encontraron invitados.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <GuestsCards
      guests={filteredGuests}
      selectedGuests={selectedGuests}
      onSelectGuest={onSelectGuest}
      onEdit={onEdit}
      onDelete={onDelete}
      onSendWhatsApp={onSendWhatsApp}
      onLockToggle={onLockToggle}
    />
  );
}
