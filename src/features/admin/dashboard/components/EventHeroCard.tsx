import React from "react";
import { Gem, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import { formatToEventDate } from "@/utils/formatters";

interface EventHeroCardProps {
  timeAgo: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  familiesRoute?: string;
}

const EventHeroCard: React.FC<EventHeroCardProps> = ({
  timeAgo,
  eventName,
  eventDate,
  eventLocation,
  familiesRoute
}) => {
  const formattedDate = formatToEventDate(eventDate);
  console.log(eventDate, formattedDate, "EVENT DATE");

  const day = formattedDate.split("/")[0].trim();
  const month = formattedDate.split("/")[1].trim();

  return <div className="bg-[#2C3627] text-[#FDFBF7] rounded-[24px] p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
      <Gem size={300} />
    </div>

    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
      <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/20 shadow-inner w-20 shrink-0">
        <p className="text-[#C5A669] text-[10px] font-bold uppercase tracking-widest mb-1">
          {month}
        </p>
        <p className="text-3xl font-serif leading-none">{day}</p>
      </div>
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-medium mb-3">
          {eventName}
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white/60 text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#C5A669]" /> {eventLocation}
          </span>
          <span className="hidden sm:block text-white/30">•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#C5A669]" />{" "}
            {`Última actualización: ${timeAgo}`}
          </span>
        </div>
      </div>
    </div>

    <div className="relative z-10 w-full lg:w-auto">
      <Link
        href={familiesRoute || "/admin/invitations/"}
        className="w-full lg:w-auto bg-[#C5A669] hover:bg-[#b09255] text-white text-[11px] uppercase tracking-widest font-bold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <Users size={16} /> Gestionar invitados
      </Link>
    </div>
  </div>
};

export default React.memo(EventHeroCard);
