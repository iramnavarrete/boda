import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { cn } from "@heroui/theme";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  isDanger?: boolean;
  confirmText?: string;
  onBackdropPress?: () => void;
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
  onBackdropPress,
}) => {
  return (
    <Modal isOpen={isOpen} onBackdropPress={onBackdropPress || onClose}>
      {/* Header */}
      <div className="px-6 py-5 flex gap-3 items-start bg-white">
        <div
          className={`p-3 rounded-2xl shrink-0 border transition-colors ${
            isDanger
              ? "bg-danger-50 text-danger-700 border-danger-100"
              : "bg-sand-light text-gold border-sand"
          }`}
        >
          {isDanger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
        </div>

        <div className="flex-1 pt-1">
          <h3 className="text-lg font-serif font-bold text-charcoal leading-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm text-stone-custom leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="group bg-transparent hover:bg-danger-50 border border-transparent hover:border-danger-100 text-stone-400 hover:text-danger-700 rounded-xl p-2 transition-all ml-1"
          title="Cancelar selección"
        >
          <X
            size={20}
            className="transform group-hover:rotate-90 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* Footer / Actions */}
      <div className="px-6 py-5 bg-sand-light/50 border-t border-sand flex gap-3 justify-end items-center">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-sand text-stone-custom font-medium hover:bg-white hover:text-charcoal hover:border-gold/30 transition-all disabled:opacity-50 text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "px-6 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm transform active:scale-95",
            isDanger
              ? "bg-danger-600 hover:bg-danger-700 shadow-danger-200/20"
              : "bg-gold hover:bg-gold-600 shadow-charcoal/20",
          )}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
          )}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
