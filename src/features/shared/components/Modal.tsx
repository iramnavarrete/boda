import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";

export interface ModalProps {
  isOpen: boolean;
  onBackdropPress?: () => void;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onBackdropPress,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onBackdropPress?.()}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* MODAL CONTAINER */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.2,
              }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden"
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
