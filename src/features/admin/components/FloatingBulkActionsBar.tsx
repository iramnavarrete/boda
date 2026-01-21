import React, { useState, useRef, useEffect } from "react";
import { X, Lock, Unlock, Trash2, ChevronUp, CheckSquare } from "lucide-react";
import { cn } from "@heroui/theme";

interface BulkActionsProps {
  count: number;
  isSelectedAll: boolean;
  onUpdateLock: (lock: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSelectAll: () => void;
  className?: string;
}

const FloatingBulkActionsBar: React.FC<BulkActionsProps> = ({
  count,
  isSelectedAll,
  onUpdateLock,
  onDelete,
  onCancel,
  onSelectAll,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        // Animación elástica rápida
        "transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        count > 0
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95 pointer-events-none",
        className,
      )}
    >
      {/* BARRA FLOTANTE - SOMBRA DIFUMINADA */}
      <div className="bg-white text-stone-800 border border-[#C5A669]/50 rounded-2xl shadow-[0_12px_40px_-8px_rgba(197,166,105,0.4)] p-2 pr-3 flex items-center gap-3 md:gap-5 w-full md:w-auto max-w-2xl relative">
        {/* CONTADOR - Fondo Dorado */}
        <div className="flex items-center gap-3 pl-1.5">
          <span className="bg-[#C5A669] text-white px-3 py-1.5 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 shadow-sm">
            <span className="bg-white/20 px-1.5 rounded text-xs font-mono min-w-[20px] text-center text-white">
              {count}
            </span>
            <span className="hidden sm:inline font-sans tracking-wide text-white">
              seleccionados
            </span>
            <span className="sm:hidden font-sans tracking-wide text-white">
              selecc.
            </span>
          </span>
        </div>

        {/* SEPARADOR VERTICAL */}
        <div className="flex flex-1 justify-center">
          <div className="h-8 w-px bg-stone-100" />
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-2 justify-end" ref={menuRef}>
          {/* TOGGLE MENÚ */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border text-[#C5A669]",
                isOpen
                  ? "bg-sand-light border-[#C5A669] shadow-inner"
                  : "bg-transparent hover:bg-sand-light/50 border-[#C5A669]/50 hover:border-[#C5A669]",
              )}
            >
              <span>Acciones</span>
              <ChevronUp
                size={16}
                className={`transition-transform duration-300 stroke-[3px] ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* MENÚ DESPLEGABLE - Sombra Difuminada Coherente */}
            <div
              className={cn(
                "absolute bottom-full right-0 mb-4 w-52 bg-white text-stone-800 rounded-2xl border border-[#C5A669]/50 shadow-[0_20px_40px_-5px_rgba(197,166,105,0.2)] overflow-hidden origin-bottom-right",
                "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) translate-x-16 right-0.5",
                isOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95 pointer-events-none",
              )}
            >
              <div className="p-2 space-y-1">
                {!isSelectedAll && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Selección
                    </div>
                    <button
                      onClick={() => handleAction(onSelectAll)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-sand-light/50 hover:text-[#C5A669] hover:border hover:border-[#C5A669]/30 border border-transparent transition-all text-left group"
                    >
                      <div className="text-stone-300 group-hover:text-[#C5A669] transition-colors">
                        <CheckSquare size={18} strokeWidth={2} />
                      </div>
                      <span>Seleccionar todos</span>
                    </button>
                  </>
                )}

                <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                  Edición
                </div>
                <button
                  onClick={() => handleAction(() => onUpdateLock(true))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-sand-light/50 hover:text-[#C5A669] hover:border hover:border-[#C5A669]/30 border border-transparent transition-all text-left group"
                >
                  <div className="text-stone-300 group-hover:text-[#C5A669] transition-colors">
                    <Lock size={18} strokeWidth={2} />
                  </div>
                  <span>Bloquear edición</span>
                </button>

                <button
                  onClick={() => handleAction(() => onUpdateLock(false))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-sand-light/50 hover:text-[#C5A669] hover:border hover:border-[#C5A669]/30 border border-transparent transition-all text-left group"
                >
                  <div className="text-stone-300 group-hover:text-[#C5A669] transition-colors">
                    <Unlock size={18} strokeWidth={2} />
                  </div>
                  <span>Permitir Edición</span>
                </button>

                <div className="my-1.5 border-t border-stone-100 mx-3 border-dashed" />

                <div className="px-3 py-1.5 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                  Zona de Peligro
                </div>
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:border hover:border-red-100 border border-transparent transition-all text-left group"
                >
                  <div className="text-red-300 group-hover:text-red-600 transition-colors">
                    <Trash2 size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span>Eliminar</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            onClick={onCancel}
            className="group bg-transparent hover:bg-red-50 border border-transparent hover:border-red-100 text-stone-400 hover:text-red-500 rounded-xl p-2 transition-all ml-1"
            title="Cancelar selección"
          >
            <X
              size={20}
              className="transform group-hover:rotate-90 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingBulkActionsBar;
