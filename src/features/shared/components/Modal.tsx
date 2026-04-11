import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  onBackdropPress?: () => void;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onBackdropPress,
  children,
}) => {
  const [shouldRenderChildren, setShouldRenderChildren] = useState(isOpen);

  if (isOpen && !shouldRenderChildren) {
    setShouldRenderChildren(true);
  }

  return (
    <AnimatePresence onExitComplete={() => setShouldRenderChildren(false)}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onBackdropPress?.()}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[5000] flex items-center justify-center p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden z-[5001]"
          >
            {shouldRenderChildren && children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
