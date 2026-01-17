import { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  MapPin,
  Clock,
  AlertCircle,
  MailOpen,
} from "lucide-react";
import { InvitationsService } from "@/services/invitationsService";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import { useRouter } from "next/router";
import Loader from "@/features/front/components/Loader";
import Image from "next/image";
import { useCountdown } from "@/features/front/hooks/useCountDown";

export interface Invitation {
  id: string;
  title: string;
  names: string;
  date: string;
  targetDate: string;
  location: string;
  status: "active" | "draft" | "archived";
  coverUrl?: string;
}

const InvitationCardVisual = ({
  invitation,
  onClick,
}: {
  invitation: Invitation;
  onClick: (id: string) => void;
}) => {
  const [days, hours, minutes, seconds] = useCountdown(
    new Date(invitation.targetDate)
  );
  return (
    <div
      onClick={() => onClick(invitation.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative isolate"
    >
      {/* IMAGEN DE PORTADA */}
      <div className="h-40 w-full bg-stone-200 relative overflow-hidden">
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />

        <div className="relative w-full h-full">
          <Image
            src={
              invitation.coverUrl ||
              "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000&auto=format&fit=crop"
            }
            alt="Cover"
            fill
            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            style={{ willChange: "transform" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Badge de estado flotante */}
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider ${
              invitation.status === "active"
                ? "bg-green-500/90 text-white"
                : "bg-stone-500/90 text-white"
            }`}
          >
            {invitation.status === "active" ? "Activa" : "Borrador"}
          </span>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif text-xl text-stone-800 font-bold leading-tight group-hover:text-[#C5A669] transition-colors">
              {invitation.names}
            </h3>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-wide">
              {invitation.title}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-stone-100">
          <div className="space-y-1">
            <p className="text-[10px] text-stone-400 uppercase">Fecha</p>
            <p className="text-sm font-medium text-stone-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#C5A669]" />
              {invitation.date}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-stone-400 uppercase">Lugar</p>
            <p className="text-sm font-medium text-stone-600 flex items-center gap-1.5 truncate">
              <MapPin size={14} className="text-[#C5A669]" />
              {invitation.location}
            </p>
          </div>
        </div>

        {/* Footer con Contador */}
        <div className="mt-auto pt-1 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Clock size={14} className="text-stone-400" />
            <span className="text-xs text-stone-500 font-medium">Faltan:</span>
          </div>
          <div className="flex gap-1 text-sm font-bold text-stone-800">
            {/* Versión compacta del contador */}
            <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 group-hover:bg-[#C5A669]/10 group-hover:text-[#C5A669] transition-colors">
              {days}d
            </span>{" "}
            :
            <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 group-hover:bg-[#C5A669]/10 group-hover:text-[#C5A669] transition-colors">
              {hours}h
            </span>{" "}
            :
            <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 group-hover:bg-[#C5A669]/10 group-hover:text-[#C5A669] transition-colors">
              {minutes}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyInvitationsState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
      <MailOpen size={48} className="text-stone-300" />
    </div>
    <h3 className="font-serif text-2xl text-stone-800 mb-2">
      Sin invitaciones asignadas
    </h3>
    <p className="text-stone-500 max-w-sm mx-auto mb-8">
      Actualmente no tienes ninguna invitación activa asociada a tu cuenta.
    </p>
    <div className="bg-yellow-50 text-yellow-800 px-6 py-4 rounded-xl text-sm border border-yellow-100 max-w-md">
      <p className="font-bold mb-1 flex items-center gap-2 justify-center">
        <AlertCircle size={16} /> ¿Crees que es un error?
      </p>
      Contacta al administrador del sistema para que te asigne tus eventos
      correspondientes.
    </div>
  </div>
);

export const InvitationsListPage = () => {
  const user = useAuthUser();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const invitations = await InvitationsService.getUserInvitations(user.uid);
      setInvitations(
        invitations.map((el) => ({
          id: el.id,
          title: "50 Aniversario",
          names: "Roberto & Ana",
          date: "15 Dic 2026",
          targetDate: "2026-12-15T21:00:00",
          location: "Salón Central",
          status: "draft",
          coverUrl:
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
        }))
      );
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <Loader fullscreen />;
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4">
            <Heart className="text-[#C5A669] fill-current" size={24} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-stone-800">
            Mis Eventos
          </h1>
          <p className="text-stone-500 max-w-lg mx-auto">
            Bienvenido a tu panel. Selecciona el evento que deseas gestionar.
          </p>
        </div>
        {invitations.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {invitations.map((inv) => (
              <div key={inv.id} className="w-full max-w-sm flex-shrink-0">
                <InvitationCardVisual
                  invitation={inv}
                  onClick={() => {
                    router.push(`/admin/invitations/${inv.id}`);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyInvitationsState />
        )}
      </div>
    </div>
  );
};
