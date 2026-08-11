import {
  Info,
  Ban,
  Clock,
  XCircle,
  CheckCircle2,
  MapPin,
  Edit,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { Family } from "@/types";
import { ModalState } from "./types";

interface Props {
  modalState: ModalState;
  family: Family | null;
  tableAssignments: Record<string, number>;
  onClose: () => void;
  onEdit: () => void;
}

export default function CheckInFeedbackModals({
  modalState,
  family,
  tableAssignments,
  onClose,
  onEdit,
}: Props) {
  return (
    <>
      {/* MODAL 2: YA INGRESÓ (O INGRESO PARCIAL COMPLETADO) */}
      <Modal
        isOpen={modalState === "already_entered"}
        onBackdropPress={onClose}
      >
        {family && (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#FDFBF7] border border-[#EBE5DA] text-[#A8A29E] mb-6 shadow-sm">
              <Info size={32} />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
              Todos los pases de esta familia ya fueron utilizados
            </h3>

            <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-6">
              El acceso para la familia{" "}
              <b className="text-[#2C2C29]">{family.nombre}</b> ya fue
              registrado anteriormente.
            </p>

            <div className="w-full flex flex-col gap-2 mb-8">
              <div className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-4 flex items-center justify-between shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
                  Personas ingresadas
                </span>
                <div className="flex items-center gap-2 text-[#2C2C29] font-bold text-sm">
                  <CheckCircle2 size={16} className="text-green-500" />
                  {family.pasesUsados || family.confirmados} de{" "}
                  {family.confirmados} pases
                </div>
              </div>

              {Object.keys(tableAssignments).length > 0 && (
                <div className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
                    Mesas asignadas
                  </span>
                  <div className="flex items-center gap-2 text-[#2C2C29] font-bold text-sm">
                    <MapPin size={16} className="text-[#C5A669]" />
                    {Object.keys(tableAssignments).join(", ")}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
              >
                Volver
              </button>
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-3.5 rounded-xl border border-[#C5A669] bg-[#C5A669] text-white font-bold hover:bg-[#b09255] transition-colors shadow-md shadow-[#C5A669]/20 text-sm flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Ver detalles
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: INGRESO NO PERMITIDO */}
      <Modal isOpen={modalState === "not_allowed"} onBackdropPress={onClose}>
        {family && (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100 mb-6 shadow-sm">
              <Ban size={32} />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
              Ingreso No Permitido
            </h3>

            <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-8">
              La familia <b className="text-[#2C2C29]">{family.nombre}</b>{" "}
              declinó la invitación o cuenta con 0 pases confirmados para el
              evento.
            </p>

            <button
              onClick={onClose}
              className="w-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
            >
              Volver
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL 3.5: RESPUESTA PENDIENTE */}
      <Modal
        isOpen={modalState === "pending_response"}
        onBackdropPress={onClose}
      >
        {family && (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-50 text-amber-500 border border-amber-100 mb-6 shadow-sm">
              <Clock size={32} />
            </div>

            <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4 text-center">
              Respuesta Pendiente
            </h3>

            <p className="text-sm text-[#5A5A5A] leading-relaxed text-center mb-8">
              La familia <b className="text-[#2C2C29]">{family.nombre}</b> nunca
              respondió a la invitación en tiempo y forma, por lo que no cuenta
              con pases asignados para el evento.
            </p>

            <button
              onClick={onClose}
              className="w-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
            >
              Volver
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL 4: PASE INVÁLIDO O NO ENCONTRADO */}
      <Modal isOpen={modalState === "not_found"} onBackdropPress={onClose}>
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
            onClick={onClose}
            className="w-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] font-bold hover:bg-[#F9F7F2] transition-colors shadow-sm text-sm"
          >
            Cerrar y volver a intentar
          </button>
        </div>
      </Modal>
    </>
  );
}
