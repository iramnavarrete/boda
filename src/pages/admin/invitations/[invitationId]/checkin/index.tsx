"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Power, // 🔥 Importamos el ícono de encendido/apagado
} from "lucide-react";
import { FamiliesService } from "@/services/familiesService";
import { Family } from "@/types";
import { useToast } from "@/features/shared/components/Toast";
import Modal from "@/features/shared/components/Modal";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme"; // 🔥 Asegúrate de tener esto importado para las clases dinámicas
import CheckInConfirmModal from "@/features/admin/components/modals/CheckInConfirmModal";

type ModalState =
  | "none"
  | "loading"
  | "confirm"
  | "already_entered"
  | "not_found"
  | "not_allowed";

export default function CheckInPage() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  const [modalState, setModalState] = useState<ModalState>("none");
  const [scannedFamily, setScannedFamily] = useState<Family | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de la cámara y permisos
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  const isProcessingRef = useRef(false);

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

      // USO DE LOCALSTORAGE PARA RECORDAR LA CÁMARA
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
    requestCameraAccess();
  }, [requestCameraAccess]);

  // Manejador para cambiar de cámara y guardar en memoria
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    localStorage.setItem("checkin_camera_id", newId);
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

    if (error || !family) {
      setModalState("not_found");
      return;
    }

    setScannedFamily(family);

    if (
      family.asistencia === false ||
      !family.confirmados ||
      family.confirmados <= 0
    ) {
      setModalState("not_allowed");
    } else if (family.asistio) {
      setModalState("already_entered");
    } else {
      setModalState("confirm");
    }
  };

  // Calcula si es el día del evento
  const checkIsEventDay = (): boolean => {
    if (!invitationData?.fechaISO) return false;
    const todayStr = new Date().toLocaleDateString("en-CA");
    const eventStr = invitationData.fechaISO.split("T")[0];
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
      <div className="flex flex-col items-center justify-center p-6 max-w-xl mx-auto min-h-[calc(100vh-80px)]">
        <div className="w-full text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-primary mb-2">
            Punto de Acceso
          </h2>
          <p className="text-sm text-stone-500">
            Escanea los pases QR de los invitados para registrar su entrada.
          </p>
        </div>

        {!hasPermission ? (
          <div className="w-full aspect-square bg-white rounded-[2rem] border border-stone-200 shadow-sm flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mb-2">
              <CameraOff size={32} />
            </div>
            <h3 className="font-bold text-charcoal text-lg">
              Cámara no disponible
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              {cameraError ||
                "Necesitamos acceso a la cámara para escanear los códigos QR."}
            </p>
            <button
              onClick={requestCameraAccess}
              className="mt-4 px-6 py-3 bg-primary text-paper rounded-xl font-bold hover:bg-charcoal-700 transition-colors shadow-md"
            >
              Solicitar Permiso
            </button>
          </div>
        ) : (
          <>
            {/* CONTROLES DE CÁMARA: Selector + Switch de Encendido */}
            <div className="w-full flex items-center gap-3 mb-4 relative z-10">
              {devices.length > 1 ? (
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                    <Camera size={16} />
                  </div>
                  <select
                    value={selectedDeviceId}
                    onChange={handleCameraChange}
                    disabled={!isCameraOn}
                    className="w-full pl-10 pr-8 py-3.5 bg-white border border-sand rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50 disabled:bg-stone-50"
                  >
                    {devices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Cámara ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              ) : (
                <div className="flex-1" /> // Espaciador si solo hay 1 cámara
              )}

              {/* Botón de Encendido/Apagado */}
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                title={isCameraOn ? "Apagar cámara" : "Encender cámara"}
                className={cn(
                  "w-[50px] h-[50px] shrink-0 flex items-center justify-center rounded-xl border transition-all shadow-sm",
                  isCameraOn
                    ? "bg-white border-sand text-charcoal hover:bg-stone-50"
                    : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100",
                )}
              >
                <Power size={20} />
              </button>
            </div>

            <div className="w-full aspect-square bg-stone-100 rounded-[2rem] overflow-hidden relative border-4 border-white shadow-xl shadow-stone-200/50">
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
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-200/50">
                  <CameraOff size={40} className="mb-4 opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Cámara Apagada
                  </p>
                  <button
                    onClick={() => setIsCameraOn(true)}
                    className="mt-4 px-4 py-2 bg-white rounded-lg shadow-sm text-charcoal text-xs font-bold border border-sand hover:bg-stone-50 transition-colors"
                  >
                    Encender Escáner
                  </button>
                </div>
              )}

              {isCameraOn && (
                <div className="absolute inset-0 pointer-events-none border-[2px] border-white/20 m-6 rounded-3xl" />
              )}

              {modalState === "loading" && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-gold rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Validando Pase...
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <CheckInConfirmModal
          isOpen={modalState === "confirm"}
          family={scannedFamily}
          isSubmitting={isSubmitting}
          isEventDay={isEventDay}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />

        {/* MODAL 2: YA INGRESÓ */}
        <Modal
          isOpen={modalState === "already_entered"}
          onBackdropPress={handleCloseModal}
        >
          {scannedFamily && (
            <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-stone-100 text-stone-400 mb-6">
                <Info size={32} />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
                Pase Ya Utilizado
              </h3>

              <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-6">
                El código QR de la familia{" "}
                <b className="text-[#2C2C29]">{scannedFamily.nombre}</b> ya fue
                escaneado anteriormente.
              </p>

              <div className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-4 flex items-center justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Personas ingresadas
                </span>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CheckCircle2 size={16} className="text-gold" />
                  {scannedFamily.pasesUsados || scannedFamily.confirmados} de{" "}
                  {scannedFamily.confirmados} pases
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-stone-50 transition-colors shadow-sm text-sm"
                >
                  Volver
                </button>
                <button
                  onClick={() => setModalState("confirm")}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#C5A669] bg-[#FDFBF7] text-[#C5A669] font-bold hover:bg-[#C5A669] hover:text-white transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 mb-6">
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

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-stone-50 transition-colors shadow-sm text-sm"
                >
                  Volver
                </button>
                <button
                  onClick={() => setModalState("confirm")}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-[#C5A669] bg-[#FDFBF7] text-[#C5A669] font-bold hover:bg-[#C5A669] hover:text-white transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Autorizar
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 mb-6">
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
              className="w-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-stone-50 transition-colors shadow-sm text-sm"
            >
              Escanear de nuevo
            </button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
