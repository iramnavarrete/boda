import { SearchX, Users } from "lucide-react";
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
       <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border border-dashed border-[#EBE5DA] shadow-[0_2px_10px_-5px_rgba(44,44,41,0.05)]">
         {isLoading ? (
           <Loader />
         ) : (
           <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="relative mb-6">
               <div className="absolute inset-0 bg-[#C5A669]/10 rounded-full blur-xl scale-150"></div>
               <div className="relative bg-[#FDFBF7] p-5 rounded-full border border-[#EBE5DA] shadow-sm">
                 <SearchX
                   className="h-10 w-10 text-[#C5A669]"
                   strokeWidth={1.5}
                 />
               </div>
             </div>
             <h3 className="text-2xl font-serif font-bold text-[#2C2C29] mb-2">
               No se encontraron invitados
             </h3>
             <p className="text-sm text-[#A8A29E] max-w-sm leading-relaxed">
               Puedes crear un invitado en el botón "+ Nuevo"
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
      onLockToggle={onLockToggle}
    />
  );
}
