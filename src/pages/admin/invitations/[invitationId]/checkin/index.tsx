"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Camera,
  ChevronDown,
  CheckCircle2,
  Info,
  CameraOff,
  XCircle,
  Ban,
  Edit,
  Power,
  Search,
  ChevronRight,
  Clock,
  QrCode,
  Users,
  MapPin,
} from "lucide-react";
import { FamiliesService } from "@/services/familiesService";
import { Family } from "@/types";
import { useToast } from "@/features/shared/components/Toast";
import Modal from "@/features/shared/components/Modal";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme";
import CheckInConfirmModal from "@/features/admin/components/modals/CheckInConfirmModal";
import { SeatingElement } from "@/features/admin/seating/stores/useSeatingStore";
import { SeatingService } from "@/features/admin/seating/services/seatingService";

type ModalState =
  | "none"
  | "loading"
  | "confirm"
  | "already_entered"
  | "not_found"
  | "not_allowed"
  | "pending_response";

type TabState = "scanner" | "directory";
type CheckInFilterType = "all" | "pending_entry" | "entered" | "no_access";

export default function CheckInPage() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  const [activeTab, setActiveTab] = useState<TabState>("scanner");
  const [modalState, setModalState] = useState<ModalState>("none");
  const [scannedFamily, setScannedFamily] = useState<Family | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de la cámara
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  // Estados de datos
  const [families, setFamilies] = useState<Family[]>([]);
  const [elements, setElements] = useState<SeatingElement[]>([]);

  // Estados locales de Búsqueda y Filtrado exclusivos para Check-in
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilterType>("all");

  const isProcessingRef = useRef(false);

  // 1. Obtener la lista de familias en tiempo real
  useEffect(() => {
    if (!invitationId) return;
    const unsubscribe = FamiliesService.subscribeToFamilies(
      invitationId,
      (data) => setFamilies(data),
      (error) => {
        console.error("Error cargando invitados:", error);
        toast("Error al cargar la lista de invitados", "error");
      },
    );
    return () => unsubscribe();
  }, [invitationId, toast]);

  // Obtener el plano de mesas para el cruce de datos
  useEffect(() => {
    if (!invitationId) return;
    SeatingService.getPlan(invitationId).then(setElements).catch(console.error);
  }, [invitationId]);

  // Calculamos las mesas asignadas a la familia escaneada
  const assignedTables = useMemo(() => {
    if (!scannedFamily || !elements.length) return [];

    const familyGuestIds = scannedFamily.asientos?.map((a) => a.id) || [];
    if (familyGuestIds.length === 0) return [];

    const tables = new Set<string>();

    elements.forEach((el) => {
      if (el.seats && el.seats > 0) {
        const hasGuest = el.assignedSeats.some(
          (seatId) => seatId && familyGuestIds.includes(seatId),
        );
        if (hasGuest) tables.add(el.alias);
      }
    });

    return Array.from(tables);
  }, [scannedFamily, elements]);

  // Calculamos los contadores para los Badges
  const filterCounts = useMemo(() => {
    let pending = 0;
    let entered = 0;
    let noAccess = 0;

    families.forEach((f) => {
      const confirmados = f.confirmados || 0;
      const usados = f.pasesUsados || 0;

      if (f.asistencia === true && confirmados > 0 && usados < confirmados) {
        pending++; // Tienen pases y aún faltan por ingresar
      }
      if (usados > 0) {
        entered++; // Ya cruzaron la puerta (total o parcialmente)
      }
      if (
        f.asistencia === false ||
        f.asistencia === null ||
        confirmados === 0
      ) {
        noAccess++; // No pueden entrar
      }
    });

    return {
      all: families.length,
      pending_entry: pending,
      entered,
      no_access: noAccess,
    };
  }, [families]);

  // Aplicamos los filtros y la búsqueda
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      const matchesSearch = f.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      const confirmados = f.confirmados || 0;
      const usados = f.pasesUsados || 0;

      switch (checkInFilter) {
        case "pending_entry":
          matchesFilter =
            f.asistencia === true && confirmados > 0 && usados < confirmados;
          break;
        case "entered":
          matchesFilter = usados > 0;
          break;
        case "no_access":
          matchesFilter =
            f.asistencia === false ||
            f.asistencia === null ||
            confirmados === 0;
          break;
        case "all":
        default:
          matchesFilter = true;
          break;
      }

      return matchesSearch && matchesFilter;
    });
  }, [families, searchTerm, checkInFilter]);

  const requestCameraAccess = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Tu navegador no soporta la cámara o la conexión no es segura (requiere HTTPS).",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);

      stream.getTracks().forEach((track) => track.stop());

      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = enumeratedDevices.filter(
        (d) => d.kind === "videoinput",
      );
      setDevices(videoDevices);

      const savedCameraId = localStorage.getItem("checkin_camera_id");

      if (
        savedCameraId &&
        videoDevices.find((d) => d.deviceId === savedCameraId)
      ) {
        setSelectedDeviceId(savedCameraId);
      } else if (videoDevices.length > 0 && !selectedDeviceId) {
        const backCamera = videoDevices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("trasera"),
        );
        const defaultId = backCamera
          ? backCamera.deviceId
          : videoDevices[0].deviceId;
        setSelectedDeviceId(defaultId);
        localStorage.setItem("checkin_camera_id", defaultId);
      }
    } catch (error: unknown) {
      console.error("Error obteniendo cámaras:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        setCameraError(
          "Permiso denegado. Debes habilitar el acceso a la cámara desde los ajustes de tu navegador.",
        );
      } else {
        setCameraError("No se pudo acceder a la cámara del dispositivo.");
      }
      setHasPermission(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (activeTab === "scanner" && !hasPermission && !cameraError) {
      requestCameraAccess();
    }
  }, [activeTab, requestCameraAccess, hasPermission, cameraError]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    localStorage.setItem("checkin_camera_id", newId);
  };

  const processFamilyCheckIn = (family: Family | null, error?: boolean) => {
    if (error || !family) {
      setModalState("not_found");
      return;
    }

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

  const checkIsEventDay = (): boolean => {
    if (!invitationData?.fecha) return false;
    const todayStr = new Date().toLocaleDateString("en-CA");
    const eventStr = invitationData?.fecha.toDate().toLocaleDateString("en-CA");
    return todayStr === eventStr;
  };
  const isEventDay = checkIsEventDay();

  const handleConfirm = async (pasesAConfirmar: number) => {
    if (!scannedFamily || !invitationData?.id) return;
    setIsSubmitting(true);

    try {
      await FamiliesService.checkInFamily(
        invitationData.id,
        scannedFamily.id,
        pasesAConfirmar,
      );
      toast("¡Acceso registrado con éxito!", "success");

      setScannedFamily(null);
      setModalState("none");

      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
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

  if (!invitationId) {
    return <Loader fullscreen />;
  }

  return (
    <AdminLayout invitationId={invitationId}>
      <div className="flex flex-col items-center justify-start p-4 md:p-6 max-w-xl mx-auto min-h-[calc(100vh-80px)] w-full">
        {/* HEADER */}
        <div className="w-full text-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#2C2C29] mb-2">
            Punto de Acceso
          </h2>
          <p className="text-sm text-[#A8A29E]">
            Registra la entrada de los invitados
          </p>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="w-full flex items-center p-1 bg-[#F9F7F2] border border-[#EBE5DA] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("scanner")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "scanner"
                ? "bg-white text-[#2C2C29] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
                : "text-[#A8A29E] hover:text-[#5A5A5A]",
            )}
          >
            <QrCode size={16} />
            Escáner QR
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === "directory"
                ? "bg-white text-[#2C2C29] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
                : "text-[#A8A29E] hover:text-[#5A5A5A]",
            )}
          >
            <Users size={16} />
            Directorio
          </button>
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: ESCÁNER QR */}
        {/* ============================================================== */}
        {activeTab === "scanner" && (
          <div className="w-full bg-white rounded-[2rem] border border-[#EBE5DA] shadow-sm p-4 md:p-6 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!hasPermission ? (
              <div className="w-full aspect-square bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-[#EBE5DA] flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-16 h-16 bg-white text-[#A8A29E] rounded-full flex items-center justify-center mb-2 shadow-sm border border-[#EBE5DA]">
                  <CameraOff size={32} />
                </div>
                <h3 className="font-bold text-[#2C2C29] text-lg">
                  Cámara no disponible
                </h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">
                  {cameraError ||
                    "Necesitamos acceso a la cámara para escanear los códigos QR."}
                </p>
                <button
                  onClick={requestCameraAccess}
                  className="mt-4 px-6 py-3 bg-[#2C2C29] text-white rounded-xl font-bold hover:bg-[#1a1a18] transition-colors shadow-md"
                >
                  Solicitar Permiso
                </button>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center gap-3 mb-4 relative z-10">
                  {devices.length > 1 ? (
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#A8A29E]">
                        <Camera size={16} />
                      </div>
                      <select
                        value={selectedDeviceId}
                        onChange={handleCameraChange}
                        disabled={!isCameraOn}
                        className="w-full pl-10 pr-8 py-3.5 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-sm font-medium text-[#2C2C29] focus:outline-none focus:border-[#C5A669] focus:ring-1 focus:ring-[#C5A669]/20 transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {devices.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Cámara ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#A8A29E]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    title={isCameraOn ? "Apagar cámara" : "Encender cámara"}
                    className={cn(
                      "w-[50px] h-[50px] shrink-0 flex items-center justify-center rounded-xl border transition-all shadow-sm",
                      isCameraOn
                        ? "bg-white border-[#EBE5DA] text-[#2C2C29] hover:bg-[#F9F7F2]"
                        : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100",
                    )}
                  >
                    <Power size={20} />
                  </button>
                </div>

                <div className="w-full aspect-[4/5] md:aspect-square bg-[#FDFBF7] rounded-3xl overflow-hidden relative border border-[#EBE5DA] shadow-inner">
                  {isCameraOn ? (
                    <Scanner
                      onScan={(text) => handleScan(text[0].rawValue)}
                      onError={(error) => console.log(error?.message)}
                      scanDelay={4000}
                      allowMultiple={true}
                      formats={["qr_code"]}
                      constraints={
                        selectedDeviceId
                          ? { deviceId: selectedDeviceId }
                          : undefined
                      }
                      components={{ finder: false }}
                      sound={true}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#A8A29E] bg-[#FDFBF7]">
                      <CameraOff size={40} className="mb-4 opacity-40" />
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Cámara Apagada
                      </p>
                      <button
                        onClick={() => setIsCameraOn(true)}
                        className="mt-4 px-5 py-2.5 bg-white rounded-xl shadow-sm text-[#2C2C29] text-xs font-bold border border-[#EBE5DA] hover:bg-[#F9F7F2] hover:text-[#C5A669] transition-colors"
                      >
                        Encender Escáner
                      </button>
                    </div>
                  )}

                  {isCameraOn && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/40 m-6 md:m-8 rounded-[2rem]" />
                  )}

                  {modalState === "loading" && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-[#C5A669] rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Validando Pase...
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 2: LISTADO MANUAL (DIRECTORIO)                           */}
        {/* ============================================================== */}
        {activeTab === "directory" && (
          <div className="w-full bg-white rounded-[2rem] border border-[#EBE5DA] shadow-sm p-4 md:p-6 flex flex-col flex-1 h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* BUSCADOR */}
            <div className="relative mb-3 shrink-0">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por nombre de familia o invitado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-sm font-medium text-[#2C2C29] focus:outline-none focus:border-[#C5A669] focus:ring-1 focus:ring-[#C5A669]/20 transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto mb-4 pb-1 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { id: "all", label: "Todos", count: filterCounts.all },
                {
                  id: "pending_entry",
                  label: "Faltan",
                  count: filterCounts.pending_entry,
                },
                {
                  id: "entered",
                  label: "Ingresaron",
                  count: filterCounts.entered,
                },
                {
                  id: "no_access",
                  label: "Sin acceso",
                  count: filterCounts.no_access,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCheckInFilter(tab.id as CheckInFilterType)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                    checkInFilter === tab.id
                      ? "bg-[#C5A669] border-[#C5A669] text-white shadow-sm"
                      : "bg-[#FDFBF7] border-[#EBE5DA] text-[#A8A29E] hover:text-[#5A5A5A] hover:border-[#C5A669]/30",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[9px]",
                      checkInFilter === tab.id
                        ? "bg-white/20"
                        : "bg-[#EBE5DA]/50 text-[#5A5A5A]",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 -mr-2 scrollbar-thin scrollbar-thumb-[#EBE5DA]">
              {filteredFamilies.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-[#A8A29E]">
                  <Users size={32} className="opacity-30 mb-3" />
                  <p className="text-sm font-medium text-[#5A5A5A]">
                    No se encontraron invitados.
                  </p>
                  <p className="text-xs mt-1">
                    Verifica que el nombre esté escrito correctamente o cambia
                    el filtro.
                  </p>
                </div>
              ) : (
                filteredFamilies.map((family) => {
                  const isDeclined = family.asistencia === false;
                  const isPending = family.asistencia === null;
                  const hasEntered = family.asistio === true;

                  return (
                    <button
                      key={family.id}
                      onClick={() => handleManualSelect(family)}
                      className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-[#F9F7F2] rounded-xl border border-transparent hover:border-[#EBE5DA] transition-all text-left group shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="font-semibold text-[#2C2C29] truncate">
                          {family.nombre}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {isDeclined ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              Declinado
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                              Pendiente
                            </span>
                          ) : hasEntered ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                              {family.pasesUsados}/{family.confirmados}{" "}
                              Ingresaron
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A669] bg-[#FDFBF7] border border-[#EBE5DA] px-1.5 py-0.5 rounded">
                              {family.confirmados} Pases Listos
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-center">
                        {isDeclined ? (
                          <XCircle
                            className="text-red-300"
                            size={22}
                            strokeWidth={1.5}
                          />
                        ) : isPending ? (
                          <Clock
                            className="text-stone-300"
                            size={22}
                            strokeWidth={1.5}
                          />
                        ) : hasEntered &&
                          family.pasesUsados === family.confirmados ? (
                          <CheckCircle2 className="text-green-500" size={22} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FDFBF7] border border-[#EBE5DA] flex items-center justify-center group-hover:bg-white group-hover:border-[#C5A669] transition-colors shadow-sm">
                            <ChevronRight
                              className="text-[#A8A29E] group-hover:text-[#C5A669]"
                              size={16}
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================= MODALES COMPARTIDOS ======================= */}

        {/* MODAL 1: CONFIRMAR INGRESO */}
        <CheckInConfirmModal
          isOpen={modalState === "confirm"}
          family={scannedFamily}
          isSubmitting={isSubmitting}
          isEventDay={isEventDay}
          assignedTables={assignedTables}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />

        {/* MODAL 2: YA INGRESÓ (O INGRESO PARCIAL COMPLETADO) */}
        <Modal
          isOpen={modalState === "already_entered"}
          onBackdropPress={handleCloseModal}
        >
          {scannedFamily && (
            <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#FDFBF7] border border-[#EBE5DA] text-[#A8A29E] mb-6 shadow-sm">
                <Info size={32} />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
                Pase Ya Utilizado
              </h3>

              <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-6">
                El acceso para la familia{" "}
                <b className="text-[#2C2C29]">{scannedFamily.nombre}</b> ya fue
                registrado anteriormente.
              </p>

              <div className="w-full flex flex-col gap-2 mb-8">
                <div className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
                    Personas ingresadas
                  </span>
                  <div className="flex items-center gap-2 text-[#2C2C29] font-bold text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />
                    {scannedFamily.pasesUsados ||
                      scannedFamily.confirmados} de {scannedFamily.confirmados}{" "}
                    pases
                  </div>
                </div>

                {assignedTables.length > 0 && (
                  <div className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
                      Mesa asignada
                    </span>
                    <div className="flex items-center gap-2 text-[#2C2C29] font-bold text-sm">
                      <MapPin size={16} className="text-[#C5A669]" />
                      {assignedTables.join(", ")}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
                >
                  Volver
                </button>
                <button
                  onClick={() => setModalState("confirm")}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#C5A669] bg-[#C5A669] text-white font-bold hover:bg-[#b09255] transition-colors shadow-md shadow-[#C5A669]/20 text-sm flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Editar Ingreso
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL 3: INGRESO NO PERMITIDO */}
        <Modal
          isOpen={modalState === "not_allowed"}
          onBackdropPress={handleCloseModal}
        >
          {scannedFamily && (
            <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100 mb-6 shadow-sm">
                <Ban size={32} />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
                Ingreso No Permitido
              </h3>

              <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-8">
                La familia{" "}
                <b className="text-[#2C2C29]">{scannedFamily.nombre}</b> declinó
                la invitación o cuenta con 0 pases confirmados para el evento.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL 3.5: RESPUESTA PENDIENTE */}
        <Modal
          isOpen={modalState === "pending_response"}
          onBackdropPress={handleCloseModal}
        >
          {scannedFamily && (
            <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-50 text-amber-500 border border-amber-100 mb-6 shadow-sm">
                <Clock size={32} />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
                Respuesta Pendiente
              </h3>

              <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-8">
                La familia{" "}
                <b className="text-[#2C2C29]">{scannedFamily.nombre}</b> nunca
                respondió a la invitación en tiempo y forma, por lo que no
                cuenta con pases asignados para el evento.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL 4: PASE INVÁLIDO O NO ENCONTRADO */}
        <Modal
          isOpen={modalState === "not_found"}
          onBackdropPress={handleCloseModal}
        >
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100 mb-6 shadow-sm">
              <XCircle size={32} />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
              Pase Inválido
            </h3>

            <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-8">
              No se encontró ningún invitado con este código QR. Verifica que el
              pase corresponda a este evento.
            </p>

            <button
              onClick={handleCloseModal}
              className="w-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
            >
              Cerrar y volver a intentar
            </button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
