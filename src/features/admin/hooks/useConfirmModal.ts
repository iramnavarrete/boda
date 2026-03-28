import { useState } from "react";
import { useToast } from "@/features/shared/components/Toast";
import { ConfirmModalState } from "@/types";

const initialState: ConfirmModalState = {
  isOpen: false,
  title: "",
  message: "",
  isDanger: false,
  isLoading: false,
  action: null,
};

export function useConfirmModal() {
  const [confirmModal, setConfirmModal] =
    useState<ConfirmModalState>(initialState);
  const { toast } = useToast();

  const openConfirmModal = (config: Omit<ConfirmModalState, "isLoading">) => {
    setConfirmModal({ ...config, isLoading: false });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleExecuteConfirmation = async () => {
    if (!confirmModal.action) return;

    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmModal.action();
      toast("Acción completada exitosamente", "success");
      setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (error) {
      console.error(error);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
      toast("No se pudo completar la acción", "error");
    }
  };

  return {
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,
  };
}
