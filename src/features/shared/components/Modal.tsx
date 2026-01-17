import { cn } from "@heroui/theme";
import { PropsWithChildren } from "react";

export interface ModalProps {
  isOpen: boolean;
  onBackdropPress?: () => void;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onBackdropPress,
  children
}) => {
  return (
    <div
      data-state={isOpen ? "backdrop-open" : "backdrop-closed"}
      onClick={() => {
        onBackdropPress?.();
      }}
      className={cn(
        "fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        "transition-all data-[state=backdrop-open]:opacity-100 duration-200 data-[state=backdrop-closed]:opacity-0 data-[state=backdrop-closed]:pointer-events-none"
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-state={isOpen ? "modal-open" : "modal-closed"}
        className={cn(
          "bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden",
          "transition-all data-[state=modal-open]:opacity-100 data-[state=modal-open]:translate-y-0 duration-300 data-[state=modal-closed]:opacity-0 data-[state=modal-closed]:translate-y-4 data-[state=modal-closed]:pointer-events-none"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
