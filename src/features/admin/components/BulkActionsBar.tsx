import { X, Lock, Unlock, Trash2 } from "lucide-react";

interface BulkActionsProps {
  count: number;
  onUpdateLock: (lock: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const BulkActionsBar: React.FC<BulkActionsProps> = ({
  count,
  onUpdateLock,
  onDelete,
  onCancel,
}) => (
  <div className="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
    {/* Izquierda: Info */}
    <div className="flex items-center gap-3 w-full md:w-auto">
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap">
        {count} seleccionados
      </span>
      <span className="text-sm text-yellow-700 hidden lg:inline">
        Acciones disponibles:
      </span>
    </div>

    {/* Derecha: Grupos de Acciones */}
    <div className="flex flex-wrap justify-end items-center gap-2 w-full md:w-auto">
      {/* GRUPO 1: EDICIÓN */}
      <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => onUpdateLock(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          title="Bloquear edición"
        >
          <Lock size={16} />
          <span>Bloquear edición</span>
        </button>
        <div className="w-px h-4 bg-stone-200 mx-1"></div>
        <button
          onClick={() => onUpdateLock(false)}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          title="Permitir edición"
        >
          <Unlock size={16} />
          <span>Permitir edición</span>
        </button>
      </div>

      {/* GRUPO 2: ZONA DE PELIGRO (Eliminar) */}
      <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-sm border-b-2 border-b-red-100">
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          title="Eliminar seleccionados permanentemente"
        >
          <Trash2 size={16} />
          <span>Eliminar</span>
        </button>
      </div>

      {/* Cancelar */}
      <button
        onClick={onCancel}
        className="p-2 ml-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        title="Cancelar Selección"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

export default BulkActionsBar;
