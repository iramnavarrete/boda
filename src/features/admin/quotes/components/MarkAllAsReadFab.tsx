import { CheckCircle2 } from "lucide-react";

interface MarkAllAsReadFabProps {
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

/**
 * FAB (Floating Action Button) para marcar todos los mensajes como leídos.
 *
 *  - Siempre visible (incluso si no hay mensajes sin leer) → el admin sabe
 *    dónde está la acción.
 *  - Disabled cuando `unreadCount === 0` (sand-100, cursor-not-allowed).
 *  - Cuando hay mensajes sin leer, muestra un count badge dorado y shadow
 *    elevado con hover animado.
 *  - En mobile el label se oculta para compactar.
 */
const MarkAllAsReadFab = ({
  onMarkAllAsRead,
  unreadCount,
}: MarkAllAsReadFabProps) => {
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onMarkAllAsRead}
      disabled={!hasUnread}
      aria-label="Marcar todos los mensajes como leídos"
      title={
        hasUnread
          ? `Marcar ${unreadCount} mensaje${unreadCount === 1 ? "" : "s"} como leídos`
          : "No hay mensajes sin leer"
      }
      className={`group relative flex items-center gap-2 pl-4 pr-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ease-out duration-300 ${
        hasUnread
          ? "bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-xl hover:bg-black hover:-translate-y-1"
          : "bg-sand-100 text-stone-400 cursor-not-allowed border border-sand-200 shadow-none"
      }`}
    >
      <CheckCircle2 size={16} className="shrink-0" />
      <span className="hidden sm:inline">Marcar todos leídos</span>
      {hasUnread && (
        <span className="ml-1 px-2 py-0.5 rounded-full bg-gold-500 text-primary text-[10px] tabular-nums font-extrabold shadow-inner">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default MarkAllAsReadFab;
