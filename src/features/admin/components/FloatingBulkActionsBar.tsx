import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react";
import { cn } from "@nextui-org/theme";

interface BulkActionsProps {
  count: number;
  onUpdateLock: (lock: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
  className?: string;
}

const FloatingBulkActionsBar: React.FC<BulkActionsProps> = ({
  count,
  onUpdateLock,
  onDelete,
  onCancel,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div
      data-state={count > 0 ? "open" : "closed"}
      className={cn(
        "fixed bottom-6 inset-x-4 md:inset-x-auto md:right-8 z-50 flex flex-col items-center",
        "transition-all data-[state=open]:opacity-100 data-[state=open]:translate-y-0 duration-300 data-[state=closed]:opacity-0 data-[state=closed]:translate-y-8",
        className
      )}
    >
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-2xl p-2 pr-3 flex items-center gap-3 md:gap-6 w-full md:w-auto max-w-2xl relative ring-1 ring-black/5">
        {/* CONTADOR */}
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap border border-yellow-200">
            {count} seleccionados
          </span>
        </div>
        {/* SEPARADOR VERTICAL */}
        <div className="h-8 w-px bg-stone-200/75" />

        {/* ACCIONES */}
        <div
          className="flex items-center gap-2 flex-1 justify-end"
          ref={menuRef}
        >
          {/* TOGGLE MENÚ */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                isOpen
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
              )}
            >
              <span>Acciones</span>
              <ChevronUp
                size={14}
                className={`transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* MENÚ DESPLEGABLE */}
            <div
              data-state={isOpen ? "open" : "closed"}
              className={cn(
                "absolute bottom-full right-[-60px] mb-4 w-48 bg-white text-stone-800 rounded-xl shadow-sm border border-stone-100 overflow-hidden ring-1 ring-black/5",
                "transition-all data-[state=open]:opacity-100 data-[state=open]:translate-y-0 duration-300 data-[state=closed]:opacity-0 data-[state=closed]:translate-y-2 data-[state=closed]:pointer-events-none"
              )}
            >
              <div className="p-1.5 space-y-1">
                {/* Grupo Edición */}
                <div className="px-2 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Edición
                </div>
                <button
                  onClick={() => handleAction(() => onUpdateLock(true))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left"
                >
                  <Lock size={16} className="text-stone-400" />
                  <div>
                    <span className="block font-medium">Bloquear edición</span>
                  </div>
                </button>
                <button
                  onClick={() => handleAction(() => onUpdateLock(false))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left"
                >
                  <Unlock size={16} className="text-stone-400" />
                  <div>
                    <span className="block font-medium">Permitir Edición</span>
                  </div>
                </button>

                <div className="h-px bg-stone-100 my-1" />

                {/* Grupo Peligro */}
                <div className="px-2 py-1.5 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                  Zona de Peligro
                </div>
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left group"
                >
                  <Trash2
                    size={16}
                    className="text-red-400 group-hover:text-red-600"
                  />
                  <span className="font-medium">Eliminar Registros</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="bg-white text-stone-700 border-stone-200 hover:text-red-500 rounded-full p-2 transition-colors ml-1 border hover:border-red-100"
            title="Cancelar selección"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingBulkActionsBar;
