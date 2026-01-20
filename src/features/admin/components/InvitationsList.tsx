import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  MailOpen,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { InvitationsService } from "@/services/invitationsService";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import Loader from "@/features/front/components/Loader";
import Image from "next/image";
import { useCountdown } from "@/features/front/hooks/useCountDown";
import Link from "next/link";
import { AuthService } from "@/services/authService";
import LoginFlowersIcon from "@/icons/login-flowers-icon";
import { formatTimeStamp } from "@/utils/formatters";
import { Invitation } from "@/types";

const InvitationCard = ({ invitation }: { invitation: Invitation }) => {
  const [days, hours] = useCountdown(invitation.fecha.toDate());

  return (
    <Link
      href={`/admin/invitations/${invitation.id}/dashboard`}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#EBE5DA] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(197,166,105,0.2)] hover:-translate-y-1 hover:border-[#D4C4A8]"
    >
      {/* SECCIÓN IMAGEN */}
      <div className="relative h-48 w-full overflow-hidden bg-[#F4EFE6]">
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        <Image
          src={
            invitation.imagenPortada ||
            "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000&auto=format&fit=crop"
          }
          alt={invitation.nombre}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge de Estado */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/10">
            Activa
          </span>
        </div>
      </div>

      {/* SECCIÓN CONTENIDO */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Encabezado */}
        <div>
          <p className="text-[10px] font-bold text-[#A39885] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-6 h-[1px] bg-[#D4C4A8]"></span>
            {invitation.tipo}
          </p>
          <h3 className="font-serif text-2xl text-[#5A5A5A] leading-tight group-hover:text-[#C5A669] transition-colors duration-300">
            {invitation.nombre}
          </h3>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-1 gap-2.5 py-4 border-t border-b border-[#F5F2EB]">
          <div className="flex items-center gap-2.5 text-sm text-[#8A8A8A]">
            <Calendar size={15} className="text-[#C5A669]" />
            <span>
              {formatTimeStamp(invitation.fecha)
                .replaceAll("/", "")
                .toLocaleLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#8A8A8A]">
            <MapPin size={15} className="text-[#C5A669]" />
            <span className="truncate">{invitation.recepcion.nombreSalon}</span>
          </div>
        </div>

        {/* Footer: Contador y Acción */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#C5A669]" />
            <div className="flex items-baseline gap-1 text-xs font-medium text-[#5A5A5A]">
              <span className="bg-[#FDFBF7] px-1.5 py-0.5 rounded border border-[#EBE5DA] text-[#C5A669] font-bold">
                {days}d
              </span>
              <span className="bg-[#FDFBF7] px-1.5 py-0.5 rounded border border-[#EBE5DA] text-[#C5A669] font-bold">
                {hours}h
              </span>
              <span className="text-[#A39885]">restantes</span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#FDFBF7] border border-[#EBE5DA] flex items-center justify-center text-[#C5A669] group-hover:bg-[#C5A669] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// 2. Estado Vacío (EmptyInvitationsState)
const EmptyInvitationsState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center relative border border-[#EBE5DA] max-w-md bg-[#FDFBF7] justify-self-center rounded-xl">
    <div className="w-24 h-24 bg-[#F4EFE6] rounded-full flex items-center justify-center mb-6">
      <MailOpen size={48} className="text-[#C5A669]" />
    </div>
    <h3 className="font-serif text-2xl text-[#5A5A5A] mb-2">
      Sin invitaciones asignadas
    </h3>
    <p className="text-[#8A8A8A] max-w-sm mx-auto mb-8">
      Actualmente no tienes ninguna invitación activa asociada a tu cuenta.
    </p>
    <div className=" text-[#A39885] px-8 py-4 text-sm">
      <p className="font-bold mb-1 flex items-center gap-2 justify-center text-[#C5A669]">
        <AlertCircle size={16} /> ¿Crees que es un error?
      </p>
      Contacta a a tu proveedor de invitaciones para que te asigne tus eventos
      correspondientes.
    </div>
  </div>
);

export default function InvitationsListPage() {
  const user = useAuthUser();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const invitations = await InvitationsService.getUserInvitations(user.uid);
      setInvitations(invitations);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <Loader fullscreen />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans text-[#5A5A5A] relative overflow-hidden">
      {/* Textura de papel (Patrón SVG sutil) */}
      <svg
        className="fixed inset-0 w-screen h-screen opacity-30 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Decoración Floral: Esquina Superior Izquierda */}
      <LoginFlowersIcon className="absolute top-0 left-0 w-64 h-64 text-[#C5A669]/20 pointer-events-none -translate-x-10 -translate-y-10" />

      {/* Decoración Floral: Esquina Inferior Derecha (Rotada) */}
      <LoginFlowersIcon className="absolute bottom-0 right-0 w-64 h-64 text-[#C5A669]/20 pointer-events-none translate-x-10 translate-y-10 rotate-180" />

      {/* Botón de Logout Flotante (Top Right) */}
      <div className="absolute top-4 right-6 md:top-8 md:right-12">
        <button
          onClick={AuthService.logout}
          className=" relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#8A8A8A] hover:text-red-500 hover:bg-red-100 hover:shadow-sm border border-transparent hover:border-red-200 transition-all duration-300 z-20"
        >
          <span className="inline">Cerrar Sesión</span>
          <LogOut size={18} />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header de la Sección */}
          <div className="text-center space-y-2 mb-12">
            <h1 className="font-serif text-3xl md:text-4xl text-[#5A5A5A]">
              Mis Eventos
            </h1>
            <p className="text-[#8A8A8A] max-w-lg mx-auto">
              Bienvenido a tu panel. Selecciona el evento que deseas gestionar.
            </p>
          </div>

          {/* Contenido Dinámico */}
          {invitations.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {invitations.map((inv) => (
                <div key={inv.id} className="w-full max-w-sm flex-shrink-0">
                  <InvitationCard invitation={inv} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyInvitationsState />
          )}
        </div>
      </main>
    </div>
  );
}
