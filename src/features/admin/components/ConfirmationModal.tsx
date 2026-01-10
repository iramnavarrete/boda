import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  isDanger?: boolean; // Para poner el botón rojo si es eliminar
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  isDanger = false,
  confirmText = "Confirmar",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-100 transform transition-all scale-100">
        {/* Header */}
        <div className="px-6 py-4 flex gap-4 items-start border-b border-stone-100 bg-stone-50/50">
          <div
            className={`p-2 rounded-full ${
              isDanger
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-800 leading-6">
              {title}
            </h3>
            <div className="mt-2 text-sm text-stone-500">{message}</div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-white flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
              ${
                isDanger
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                  : "bg-stone-900 hover:bg-stone-800 shadow-stone-900/20"
              }`}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
