import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  MailOpen,
  ArrowRight,
  LogOut,
  Plus,
  Edit2,
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
import CreateInvitationModal from "./CreateInvitationModal";

const InvitationCard = ({
  invitation,
  isAdmin,
  onEdit
}: {
  invitation: Invitation;
  isAdmin: boolean;
  onEdit: (inv: Invitation) => void;
}) => {
  const [days, hours] = useCountdown(invitation.fecha.toDate());

  return (
    <Link
      href={`/admin/invitations/${invitation.id}/dashboard`}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-sand transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(197,166,105,0.2)] hover:-translate-y-1 hover:border-sand-400"
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault(); // Evita que se abra el enlace al Dashboard
            onEdit(invitation);
          }}
          className="absolute top-3 left-3 z-30 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#2C2C29] hover:text-[#C5A669] hover:bg-white transition-all shadow-sm border border-white/40"
        >
          <Edit2 size={14} />
        </button>
      )}
      {/* SECCIÓN IMAGEN */}
      <div className="relative h-48 w-full overflow-hidden bg-paper">
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
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-6 h-[1px] bg-sand-400"></span>
            {invitation.tipo}
          </p>
          <h3 className="font-serif text-2xl text-stone-custom leading-tight group-hover:text-gold transition-colors duration-300">
            {invitation.nombre}
          </h3>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-1 gap-2.5 py-4 border-t border-b border-stone-100">
          <div className="flex items-center gap-2.5 text-sm text-charcoal-400">
            <Calendar size={15} className="text-gold" />
            <span>
              {formatTimeStamp(invitation.fecha)
                .replaceAll("/", "")
                .toLocaleLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-charcoal-400">
            <MapPin size={15} className="text-gold" />
            <span className="truncate">{invitation.recepcion.nombreSalon}</span>
          </div>
        </div>

        {/* Footer: Contador y Acción */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gold" />
            <div className="flex items-baseline gap-1 text-xs font-medium text-stone-custom">
              <span className="bg-paper/30 px-1.5 py-0.5 rounded border border-sand text-gold font-bold">
                {days}d
              </span>
              <span className="bg-paper/30 px-1.5 py-0.5 rounded border border-sand text-gold font-bold">
                {hours}h
              </span>
              <span className="text-gold">restantes</span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-paper/30 border border-sand flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// 2. Estado Vacío (EmptyInvitationsState)
const EmptyInvitationsState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center relative border border-sand max-w-md bg-paper/30 justify-self-center rounded-xl">
    <div className="w-24 h-24 bg-paper rounded-full flex items-center justify-center mb-6">
      <MailOpen size={48} className="text-gold" />
    </div>
    <h3 className="font-serif text-2xl text-stone-custom mb-2">
      Sin invitaciones asignadas
    </h3>
    <p className="text-charcoal-400 max-w-sm mx-auto mb-8">
      Actualmente no tienes ninguna invitación activa asociada a tu cuenta.
    </p>
    <div className=" text-gold px-8 py-4 text-sm">
      <p className="font-bold mb-1 flex items-center gap-2 justify-center text-gold">
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

  // Estados para el administrador Root
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRootUser, setIsRootUser] = useState(false);

  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);

  const fetchInvitations = async () => {
    setIsLoading(true);
    const invites = await InvitationsService.getUserInvitations(user.uid);
    setInvitations(invites);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkRootStatus = async () => {
      try {
        const isAdmin = await InvitationsService.isAdmin(user.uid);
        setIsRootUser(isAdmin);
      } catch (error) {
        console.error("Error verificando permisos de admin:", error);
      }
    };

    checkRootStatus();
    fetchInvitations();
  }, [user.uid]);

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
    <div className="min-h-screen bg-paper font-sans text-stone-custom relative overflow-hidden">
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
      <LoginFlowersIcon className="absolute top-0 left-0 w-64 h-64 text-gold/20 pointer-events-none -translate-x-10 -translate-y-10" />

      {/* Decoración Floral: Esquina Inferior Derecha (Rotada) */}
      <LoginFlowersIcon className="absolute bottom-0 right-0 w-64 h-64 text-gold/20 pointer-events-none translate-x-10 translate-y-10 rotate-180" />

      {/* Botón de Logout Flotante (Top Right) */}
      <div className="absolute top-4 right-6 md:top-8 md:right-12">
        <button
          onClick={AuthService.logout}
          className=" relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-charcoal-400 hover:text-red-500 hover:bg-red-100 hover:shadow-sm border border-transparent hover:border-red-200 transition-all duration-300 z-20"
        >
          <span className="inline">Cerrar Sesión</span>
          <LogOut size={18} />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header de la Sección */}
          <div className="text-center space-y-2 mb-12">
            <h1 className="font-serif text-3xl md:text-4xl text-stone-custom">
              Mis Eventos
            </h1>
            <p className="text-charcoal-400 max-w-lg mx-auto">
              Bienvenido a tu panel. Selecciona el evento que deseas gestionar.
            </p>
            {/* RENDERIZADO CONDICIONAL SEGURO */}
            {isRootUser && (
              <div className="mt-8 pt-4 flex justify-center">
                <button
                  onClick={() => {
                    setEditingInvitation(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-[#2C2C29] hover:bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 border border-[#2C2C29]"
                >
                  <Plus size={16} /> Crear Nueva Invitación
                </button>
              </div>
            )}
          </div>

          {/* Contenido Dinámico */}
          {invitations.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {invitations.map((inv) => (
                <div key={inv.id} className="w-full max-w-sm flex-shrink-0">
                  <InvitationCard
                    invitation={inv}
                    isAdmin={isRootUser}
                    onEdit={(inv) => {
                      setEditingInvitation(inv);
                      setIsModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyInvitationsState />
          )}
        </div>
      </main>
      <CreateInvitationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invitationToEdit={editingInvitation}
        onSuccess={fetchInvitations}
      />
    </div>
  );
}
