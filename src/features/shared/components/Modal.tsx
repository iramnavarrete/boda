import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";

export interface ModalProps {
  isOpen: boolean;
  onBackdropPress?: () => void;
  maxWidth?: string;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onBackdropPress,
  children,
  maxWidth = "max-w-lg",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onBackdropPress?.()}
          className="fixed inset-0 bg-stone-900/60 z-[5000] flex items-center justify-center p-4"
          // Forzamos aceleración por hardware en el fondo oscuro
          style={{ WebkitTransform: "translateZ(0)" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl flex flex-col max-h-[95svh] overflow-hidden z-[5001]`}
            // Le avisamos al navegador qué propiedades van a cambiar para que las procese en la GPU
            style={{ willChange: "transform, opacity" }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
