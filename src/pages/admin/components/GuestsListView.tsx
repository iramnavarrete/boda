import { Users } from "lucide-react";
import GuestsTable from "./GuestsTable";
import GuestsCards from "./GuestsCards";
import { Guest } from "../../../../types/types";
import Loader from "@/components/Loader";

interface GuestsListViewProps {
  filteredGuests: Guest[];
  viewMode: "list" | "table";
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onSelectAll: (guests: Guest[]) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
  isLoading: boolean;
}

export default function GuestsListView({
  filteredGuests,
  viewMode,
  selectedGuests,
  onSelectGuest,
  onSelectAll,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
  isLoading,
}: GuestsListViewProps) {
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
    <>
      <GuestsTable
        guests={filteredGuests}
        selectedGuests={selectedGuests}
        viewMode={viewMode}
        onSelectGuest={onSelectGuest}
        onSelectAll={onSelectAll}
        onEdit={onEdit}
        onDelete={onDelete}
        onSendWhatsApp={onSendWhatsApp}
        onLockToggle={onLockToggle}
      />

      <GuestsCards
        guests={filteredGuests}
        selectedGuests={selectedGuests}
        viewMode={viewMode}
        onSelectGuest={onSelectGuest}
        onSelectAll={onSelectAll}
        onEdit={onEdit}
        onDelete={onDelete}
        onSendWhatsApp={onSendWhatsApp}
        onLockToggle={onLockToggle}
      />
    </>
  );
}
