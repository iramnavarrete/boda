import { X, Lock, Unlock } from "lucide-react";
interface BulkActionsProps {
  count: number;
  onUpdateLock: (lock: boolean) => void;
  onCancel: () => void;
}

const BulkActionsBar: React.FC<BulkActionsProps> = ({
  count,
  onUpdateLock,
  onCancel,
}) => (
  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-2 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">
        {count} seleccionados
      </span>
      <span className="text-sm text-yellow-700 hidden sm:inline">
        Elige una acción grupal:
      </span>
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={() => onUpdateLock(true)}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
      >
        <Lock size={16} /> Bloquear edición
      </button>
      <button
        onClick={() => onUpdateLock(false)}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 hover:text-green-600 hover:border-green-200 transition-all text-sm font-medium"
      >
        <Unlock size={16} /> Permitir edición
      </button>
      <button
        onClick={onCancel}
        className="p-2 text-stone-400 hover:text-stone-600"
        title="Cancelar Selección"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

export default BulkActionsBar;
