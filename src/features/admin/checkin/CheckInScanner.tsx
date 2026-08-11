import { useState, useEffect, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, ChevronDown, CameraOff, Power } from "lucide-react";
import { cn } from "@heroui/theme";
import { ModalState } from "./types";

interface Props {
  onScan: (text: string) => void;
  modalState: ModalState;
}

export default function CheckInScanner({ onScan, modalState }: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  // Quitamos las dependencias problemáticas. La función es autónoma.
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
      } else if (videoDevices.length > 0) {
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
  }, []);

  // El efecto ahora solo corre una única vez cuando el componente se monta
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!mounted) return;
      await requestCameraAccess();
    };

    initCamera();

    return () => {
      mounted = false;
    };
  }, [requestCameraAccess]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    localStorage.setItem("checkin_camera_id", newId);
  };

  return (
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
                onScan={(text) => onScan(text[0].rawValue)}
                onError={(error) => console.log(error?.message)}
                scanDelay={4000}
                allowMultiple={true}
                formats={["qr_code"]}
                constraints={
                  selectedDeviceId ? { deviceId: selectedDeviceId } : undefined
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
  );
}
