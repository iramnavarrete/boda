import { memo } from "react";
import FamilyFormModal from "@/features/admin/components/families/modals/FamilyFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import SendWhatsappModal from "@/features/admin/components/families/modals/SendWhatsappModal";
import UnlockChangesModal from "@/features/admin/components/UnlockChangesModal";
import ImportFamiliesModal from "@/features/admin/components/families/modals/ImportFamiliesModal";
import { useWeddingAdminContext } from "@/features/admin/context/WeddingAdminContext";

/**
 * Capa pura de UI para los modales del módulo WeddingAdmin.
 * Lee su estado desde el contexto; no recibe props directas.
 * Envuelto en `memo` para evitar re-renders cuando el contexto
 * actualiza partes que no afectan a los modales.
 */
export const WeddingAdminModals = memo(function WeddingAdminModals() {
  const {
    // Form modal
    isModalOpen,
    currentFamilyId,
    formData,
    handleCloseModal,
    onSaveFamily,

    // Confirmation modal
    confirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,

    // WhatsApp modal
    whatsapp,

    // Unlock modal
    unlock,

    // Import modal
    isImportModalOpen,
    isImporting,
    closeImportModal,
    handleImport,
  } = useWeddingAdminContext();

  return (
    <>
      <FamilyFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={formData}
        onSubmit={onSaveFamily}
        isEdit={!!currentFamilyId}
        onBackdropPress={handleCloseModal}
      />

      <SendWhatsappModal
        isOpen={whatsapp.modal.isOpen}
        type={whatsapp.modal.type}
        familyName={whatsapp.modal.family?.nombre ?? ""}
        onClose={whatsapp.close}
        onConfirm={whatsapp.handleSubmit}
      />

      <UnlockChangesModal
        isOpen={unlock.modal.isOpen}
        family={unlock.modal.family}
        isBulk={unlock.modal.isBulk}
        onClose={unlock.close}
        onConfirm={unlock.execute}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteConfirmation}
        isLoading={confirmModal.isLoading}
        isDanger={confirmModal.isDanger}
        confirmText={confirmModal.isDanger ? "Eliminar" : "Confirmar"}
        onBackdropPress={closeConfirmModal}
      />

      <ImportFamiliesModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </>
  );
});
