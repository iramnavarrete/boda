"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  MailOpen,
  ArrowRight,
  Plus,
  Edit2,
} from "lucide-react";
import { InvitationsService } from "@/services/invitationsService";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import Loader from "@/features/front/components/Loader";
import Image from "next/image";
import { useCountdown } from "@/features/front/hooks/useCountDown";
import Link from "next/link";
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
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#EBE5DA] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(197,166,105,0.2)] hover:-translate-y-1 hover:border-[#C5A669]"
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
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
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
        <div className="absolute top-3 right-3 z-20">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 bg-black/10 text-white">
            Activa
          </span>
        </div>
      </div>

      {/* SECCIÓN CONTENIDO */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-6 h-[1px] bg-[#C5A669]/50"></span>
            {invitation.tipo}
          </p>
          <h3 className="font-serif text-2xl text-[#2C2C29] leading-tight group-hover:text-[#C5A669] transition-colors duration-300">
            {invitation.nombre}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2.5 py-4 border-t border-b border-[#EBE5DA]">
          <div className="flex items-center gap-2.5 text-sm text-[#5A5A5A]">
            <Calendar size={15} className="text-[#C5A669]" />
            <span>
              {formatTimeStamp(invitation.fecha).replaceAll("/", "").toLocaleLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#5A5A5A]">
            <MapPin size={15} className="text-[#C5A669]" />
            <span className="truncate">{invitation.recepcion?.nombreSalon || 'Sin ubicación'}</span>
          </div>
        </div>

        {/* Footer: Contador y Acción */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#C5A669]" />
            <div className="flex items-baseline gap-1 text-xs font-medium text-[#2C2C29]">
              <span className="bg-[#FDFBF7] px-1.5 py-0.5 rounded border border-[#EBE5DA] text-[#C5A669] font-bold">
                {days}d
              </span>
              <span className="bg-[#FDFBF7] px-1.5 py-0.5 rounded border border-[#EBE5DA] text-[#C5A669] font-bold">
                {hours}h
              </span>
              <span className="text-[#C5A669]">restantes</span>
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

const EmptyInvitationsState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center relative border border-[#EBE5DA] bg-white rounded-2xl max-w-lg mx-auto shadow-sm">
    <div className="w-20 h-20 bg-[#FDFBF7] rounded-full border border-[#EBE5DA] flex items-center justify-center mb-6">
      <MailOpen size={36} className="text-[#C5A669]" />
    </div>
    <h3 className="font-serif text-2xl text-[#2C2C29] mb-2">
      Sin invitaciones activas
    </h3>
    <p className="text-[#5A5A5A] max-w-sm mx-auto mb-8 text-sm">
      Actualmente no tienes ninguna invitación asociada a tu cuenta.
    </p>
    <div className="bg-[#FDFBF7] text-[#C5A669] px-6 py-4 text-sm rounded-xl border border-[#EBE5DA] inline-flex flex-col items-center">
      <p className="font-bold mb-1 flex items-center gap-2 justify-center">
        <AlertCircle size={16} /> ¿Crees que es un error?
      </p>
      <span className="text-[#5A5A5A] mt-1">Contacta a soporte para verificar tus permisos.</span>
    </div>
  </div>
);

export default function InvitationsListPage() {
  const user = useAuthUser();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para Modal y Permisos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRootUser, setIsRootUser] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(
    null,
  );

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const invites = await InvitationsService.getUserInvitations(user);
      setInvitations(invites);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const checkRootStatus = async () => {
      try {
        const isAdmin = await InvitationsService.isAdmin(user);
        setIsRootUser(isAdmin);
      } catch (error) {
        console.error("Error verificando permisos de admin:", error);
      }
    };

    checkRootStatus();
    fetchInvitations();
  }, [user, fetchInvitations]);

  if (isLoading) {
    return <Loader fullscreen />;
  }

  return (
    <div className="w-full relative z-10 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl font-bold text-[#2C2C29] mb-2">
              Mis Eventos
            </h1>
            <p className="text-[#A8A29E] text-sm max-w-lg">
              Selecciona el evento que deseas gestionar.
            </p>
          </div>

          {isRootUser && (
            <button
              onClick={() => {
                setEditingInvitation(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#2C2C29] hover:bg-[#1F1F1D] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-95"
            >
              <Plus size={18} /> Nueva Invitación
            </button>
          )}
        </div>

        {/* CONTENIDO DINÁMICO (GRID) */}
        {invitations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                isAdmin={isRootUser}
                onEdit={(inv) => {
                  setEditingInvitation(inv);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyInvitationsState />
        )}
      </div>

      <CreateInvitationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invitationToEdit={editingInvitation}
        onSuccess={fetchInvitations}
      />
    </div>
  );
}