"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { QrCode, Users } from "lucide-react";
import { FamiliesService } from "@/services/familiesService";
import { Family } from "@/types";
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme";
import { SeatingElement } from "@/types/seating";
import { SeatingService } from "@/features/admin/seating/services/seatingService";
import CheckInConfirmModal from "@/features/admin/checkin/CheckInConfirmModal";
import CheckInDirectory from "@/features/admin/checkin/CheckInDirectory";
import { ModalState, TabState } from "@/features/admin/checkin/types";
import CheckInFeedbackModals from "@/features/admin/checkin/CheckInFeedbackModals";
import CheckInScanner from "@/features/admin/checkin/CheckInScanner";

export default function CheckInPage() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  const [activeTab, setActiveTab] = useState<TabState>("scanner");
  const [modalState, setModalState] = useState<ModalState>("none");
  const [scannedFamily, setScannedFamily] = useState<Family | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Lo volvemos un estado (por defecto false para que el servidor no se queje)
  const [isEventDay, setIsEventDay] = useState(false);

  // 2. Lo calculamos exclusivamente en el cliente (celular) al montar la página
  useEffect(() => {
    if (!invitationData?.fecha) return;

    // Hora del celular
    const todayStr = new Date().toLocaleDateString("en-CA");

    // Fecha del evento
    const eventDate = invitationData.fecha.toDate();
    const eventStr = eventDate.toLocaleDateString("en-CA");

    // Fecha del día siguiente
    const dayAfterEvent = new Date(eventDate);
    dayAfterEvent.setDate(dayAfterEvent.getDate() + 1);
    const dayAfterStr = dayAfterEvent.toLocaleDateString("en-CA");

    // Actualizamos el estado con la verdad absoluta del dispositivo
    setIsEventDay(todayStr === eventStr || todayStr === dayAfterStr);
  }, [invitationData?.fecha]);

  // Estados de datos
  const [families, setFamilies] = useState<Family[]>([]);
  const [elements, setElements] = useState<SeatingElement[]>([]);

  const isProcessingRef = useRef(false);

  // 1. Obtener la lista de familias en tiempo real
  useEffect(() => {
    if (!invitationId) return;
    const unsubscribe = FamiliesService.subscribeToFamilies(
      invitationId,
      (data) => setFamilies(data),
      () => toast("Error al cargar la lista de invitados", "error"),
    );
    return () => unsubscribe();
  }, [invitationId, toast]);

  // 2. Obtener el plano de mesas
  useEffect(() => {
    if (!invitationId) return;
    SeatingService.getPlan(invitationId).then(setElements).catch(console.error);
  }, [invitationId]);

  const tableAssignments = useMemo(() => {
    if (!scannedFamily || !elements.length) return {};

    // Obtenemos a los invitados de la familia que SÍ confirmaron (asistencia === true)
    const confirmedGuestIds =
      scannedFamily.asientos
        ?.filter((guest) => guest.estatus === "confirmed")
        .map((guest) => guest.id) || [];

    if (confirmedGuestIds.length === 0) return {};

    const assignments: Record<string, number> = {};

    elements.forEach((el) => {
      if (el.seats && el.seats > 0) {
        let countInTable = 0;
        el.assignedSeats.forEach((seatId) => {
          if (seatId && confirmedGuestIds.includes(seatId)) countInTable++;
        });
        if (countInTable > 0) assignments[el.alias] = countInTable;
      }
    });

    return assignments;
  }, [scannedFamily, elements]);

  // Procesar escaneo o selección manual
  const processFamilyCheckIn = (family: Family | null, error?: boolean) => {
    if (error || !family) return setModalState("not_found");

    setScannedFamily(family);

    if (family.asistencia === null) {
      setModalState("pending_response");
    } else if (
      family.asistencia === false ||
      !family.confirmados ||
      family.confirmados <= 0
    ) {
      setModalState("not_allowed");
    } else if (family.asistio && family.pasesUsados === family.confirmados) {
      setModalState("already_entered");
    } else {
      setModalState("confirm");
    }
  };

  const handleScan = async (text: string) => {
    if (isProcessingRef.current || modalState !== "none" || !invitationData?.id)
      return;
    isProcessingRef.current = true;
    setModalState("loading");

    const { family, error } = await FamiliesService.getFamily(
      invitationData.id,
      text,
    );
    processFamilyCheckIn(family, !!error);
  };

  const handleManualSelect = (family: Family) => {
    if (modalState !== "none" || !invitationData?.id) return;
    processFamilyCheckIn(family, false);
  };

  // Confirmar el ingreso
  const handleConfirm = async (ingresandoAhora: number) => {
    if (!scannedFamily || !invitationData?.id) return;
    setIsSubmitting(true);

    try {
      // Sumamos los pases que ya se habían usado con los que están entrando HOY
      const pasesPrevios = scannedFamily.pasesUsados || 0;
      const nuevoTotal = pasesPrevios + ingresandoAhora;

      await FamiliesService.checkInFamily(
        invitationData.id,
        scannedFamily.id,
        nuevoTotal,
      );
      toast("¡Acceso registrado con éxito!", "success");
      handleCloseModal();
    } catch (error) {
      toast("Error al registrar el acceso.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setScannedFamily(null);
    setModalState("none");
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1500);
  };

  if (!invitationId) return <Loader fullscreen />;

  return (
    <AdminLayout invitationId={invitationId}>
      <div
        className={cn(
          "flex flex-col items-center justify-start p-4 md:p-6 mx-auto min-h-[calc(100vh-80px)] w-full transition-all duration-500 ease-in-out",
          activeTab === "scanner" ? "max-w-xl" : "max-w-6xl",
        )}
      >
        {/* HEADER */}
        <div className="w-full text-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#2C2C29] mb-2">
            Punto de Acceso
          </h2>
          <p className="text-sm text-[#A8A29E]">
            Registra la entrada de los invitados
          </p>
        </div>

        {/* TABS */}
        <div className="w-full flex items-center p-1 bg-[#F9F7F2] border border-[#EBE5DA] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("scanner")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "scanner"
                ? "bg-white text-[#2C2C29] shadow-sm ring-1 ring-black/5"
                : "text-[#A8A29E] hover:text-[#5A5A5A]",
            )}
          >
            <QrCode size={16} /> Escáner QR
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "directory"
                ? "bg-white text-[#2C2C29] shadow-sm ring-1 ring-black/5"
                : "text-[#A8A29E] hover:text-[#5A5A5A]",
            )}
          >
            <Users size={16} /> Directorio
          </button>
        </div>

        {/* VISTAS MODULARIZADAS */}
        {activeTab === "scanner" && (
          <CheckInScanner onScan={handleScan} modalState={modalState} />
        )}

        {activeTab === "directory" && (
          <CheckInDirectory families={families} onSelect={handleManualSelect} />
        )}

        {/* MODALES */}
        <CheckInConfirmModal
          isEventDay={isEventDay}
          isOpen={modalState === "confirm"}
          family={scannedFamily}
          isSubmitting={isSubmitting}
          tableAssignments={tableAssignments} // Mandamos el diccionario de mesas
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />

        <CheckInFeedbackModals
          modalState={modalState}
          family={scannedFamily}
          tableAssignments={tableAssignments}
          onClose={handleCloseModal}
          onEdit={() => setModalState("confirm")}
        />
      </div>
    </AdminLayout>
  );
}
