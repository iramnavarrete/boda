import { SearchX } from "lucide-react";
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
  onSendReminder: (guest: Guest) => void;
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
  onSendReminder,
  onLockToggle,
  isLoading,
}: GuestsGridViewProps) {
   if (filteredGuests.length === 0) {
     return (
       <div className="relative flex flex-col items-center justify-center py-24 px-4 bg-white/80 rounded-3xl border border-dashed border-sand shadow-[0_2px_10px_-5px_rgba(44,44,41,0.05)]">
         {isLoading ? (
           <Loader />
         ) : (
           <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="relative mb-6">
               <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl scale-150"></div>
               <div className="relative bg-paper/30 p-5 rounded-full border border-sand shadow-sm">
                 <SearchX
                   className="h-10 w-10 text-gold"
                   strokeWidth={1.5}
                 />
               </div>
             </div>
             <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">
               No se encontraron invitados
             </h3>
             <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
               Puedes crear un invitado en el botón &quot;+ Nuevo&quot;
             </p>
           </div>
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
      onSendReminder={onSendReminder}
      onLockToggle={onLockToggle}
    />
  );
}
