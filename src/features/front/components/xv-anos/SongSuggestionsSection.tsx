"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2,
  Plus,
  Copy,
  Check,
  X,
  ListMusic,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { useFamilyContext } from "@/features/front/components/FamilyContext";
import { SongsService } from "@/services/songsService";
import { useClipboard } from "@/features/front/hooks/useClipboard";
import type { SongSuggestion } from "@/types";
import { cn } from "@heroui/theme";

/* ============================================================================
 * Repertorio por defecto. Sólo se siembra cuando la prop
 * `useDefaultRepertoire === true` (default retro-compat con invitaciones
 * que aún no tienen canciones reales en Firestore).
 * ========================================================================== */
const DEFAULT_REPERTOIRE: SongSuggestion[] = [
  {
    id: "default-1",
    title: "Danza Kuduro",
    artist: "Don Omar",
    suggestedBy: "Familia Rivas",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "default-2",
    title: "Levitating",
    artist: "Dua Lipa",
    suggestedBy: "Vale",
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: "default-3",
    title: "No Se Va",
    artist: "Grupo Frontera",
    suggestedBy: "Familia Rivas",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "default-4",
    title: "Vivir Mi Vida",
    artist: "Marc Anthony",
    suggestedBy: "Tía Lupita",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "default-5",
    title: "As It Was",
    artist: "Harry Styles",
    suggestedBy: "Primo Diego",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "default-6",
    title: "Bailando",
    artist: "Enrique Iglesias",
    suggestedBy: "Familia Morales",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "default-7",
    title: "Un x100to",
    artist: "Bad Bunny & Grupo Frontera",
    suggestedBy: "Sofía",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "default-8",
    title: "Flaca",
    artist: "Andrés Calamaro",
    suggestedBy: "Familia González",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "default-9",
    title: "Cariño",
    artist: "The Marías",
    suggestedBy: "Cami",
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: "default-10",
    title: "Hawái",
    artist: "Maluma",
    suggestedBy: "Familia Reyes",
    createdAt: Date.now() - 1000 * 60 * 5,
  },
];

interface Props {
  /**
   * Si `true` (default), los visitantes anónimos ven el repertorio
   * por defecto mientras no haya canciones en Firestore. Útil para
   * invitaciones en preview/dev.
   *
   * Si `false`, la lista SIEMPRE arranca vacía y sólo se llena desde
   * Firestore (invitados) o desde lo que el usuario agregue
   * localmente (anónimos). Recomendado para invitaciones reales.
   */
  useDefaultRepertoire?: boolean;
}

/* ============================================================================
 * Componente principal: SongSuggestionsSection
 *
 * Dos modos ortogonales según la prop `useDefaultRepertoire`:
 *
 * - **Modo memoria** (`useDefaultRepertoire === true`, default):
 *   La invitación NO usa Firestore para canciones. Se siembra el
 *   `DEFAULT_REPERTOIRE` para que la página no se sienta vacía. Cualquier
 *   visitante puede agregar canciones — la persistencia es sólo RAM y se
 *   pierde al recargar. Sin suscripción a Firestore.
 *
 * - **Modo Firestore** (`useDefaultRepertoire === false`):
 *   La invitación SÍ usa Firestore. Firestore es la ÚNICA fuente de
 *   canciones. TODOS los visitantes (incluso anónimos) se suscriben
 *   para VER las canciones. Sólo familias válidas (ID que existe en
 *   Firestore) pueden AGREGAR. Para los demás el form está oculto.
 * ========================================================================== */
export default function SongSuggestionsSection({
  useDefaultRepertoire = true,
}: Props) {
  const searchParams = useSearchParams();
  const familyId = searchParams?.get("family");
  const hasFamilyParam = Boolean(familyId && familyId !== "_");

  const invitationData = useInvitationStore((s) => s.invitationData);
  const invitationId = invitationData?.id;

  const { family, isLoadingFamily } = useFamilyContext();

  /**
   * Flags ortogonales (state machine explícito):
   * - `useFirestoreMode`: ¿la invitación usa Firestore como fuente?
   * - `isValidFamily`: ¿hay una familia autenticada que existe en Firestore?
   * - `canAddSongs`: ¿el visitante actual puede agregar canciones?
   *
   * Reglas:
   * - Modo memoria → cualquier visitante puede agregar.
   * - Modo Firestore → sólo familias válidas pueden agregar.
   */
  const useFirestoreMode = !useDefaultRepertoire;
  const isValidFamily = family !== null;
  const canAddSongs = useFirestoreMode ? isValidFamily : true;

  /** Nombre que se autollenará para familias invitadas. */
  const familyName = useMemo(
    () =>
      family?.nombre?.trim() ||
      (hasFamilyParam ? `Familia ${familyId!.slice(0, 4)}` : ""),
    [family?.nombre, hasFamilyParam, familyId],
  );

  // Lazy initializer: se evalúa UNA sola vez en el mount.
  // - Modo Firestore: SIEMPRE arranca vacío (la suscripción trae los temas).
  // - Modo memoria: SIEMPRE arranca con `DEFAULT_REPERTOIRE`.
  const [songs, setSongs] = useState<SongSuggestion[]>(() =>
    useFirestoreMode ? [] : DEFAULT_REPERTOIRE,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ───── Suscripción a Firestore (modo Firestore, todos los visitantes) ──
     En modo Firestore queremos que CUALQUIER visitante pueda ver el
     playlist compartido, así que la suscripción está habilitada
     globalmente (no se restringe por familia). Sólo la escritura está
     restringida via `canAddSongs`. */
  useEffect(() => {
    if (useFirestoreMode && invitationId) {
      return SongsService.subscribeToSongs(invitationId, setSongs);
    }
    return undefined;
  }, [useFirestoreMode, invitationId]);

  /* ───── Handlers ──────────────────────────────────────────────── */
  const handleAdd = useCallback(
    async (title: string, artist: string, name: string) => {
      // Defensa en profundidad: si por alguna razón se llama sin
      // autorización, abortamos silenciosamente.
      if (!canAddSongs) return;

      const trimmedTitle = title.trim();
      const trimmedArtist = artist.trim();
      if (!trimmedTitle || !trimmedArtist) return;

      if (useFirestoreMode) {
        // Modo Firestore: persistir al collection.
        if (!invitationId) return;
        const suggestedBy = familyName || name.trim();
        if (!suggestedBy) return;
        await SongsService.addSong(invitationId, {
          title: trimmedTitle,
          artist: trimmedArtist,
          suggestedBy,
        });
        // La suscripción onSnapshot actualizará la lista.
      } else {
        // Modo memoria: local add (no se persiste).
        const suggestedBy = name.trim();
        if (!suggestedBy) return;
        const newSong: SongSuggestion = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: trimmedTitle,
          artist: trimmedArtist,
          suggestedBy,
          createdAt: Date.now(),
        };
        setSongs((prev) => [newSong, ...prev]);
      }
    },
    [canAddSongs, useFirestoreMode, invitationId, familyName],
  );

  const recent = useMemo(() => songs.slice(0, 3), [songs]);
  const totalCount = songs.length;

  return (
    <section
      id="xv-songs-section"
      className="bg-xv-bg-deepest px-6 py-12 text-center relative"
      aria-labelledby="xv-songs-heading"
    >
      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-xv-accent-soft/10 border border-xv-accent-soft/30 text-xv-accent-soft mb-4">
          <Music2 className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold">
            Música & Fiesta
          </span>
        </div>
        <h2
          id="xv-songs-heading"
          className="font-cormorant text-3xl sm:text-4xl text-white xv-glow mb-3"
        >
          ¿Qué canción no puede faltar?
        </h2>
        <p className="font-cormorant italic text-sm text-xv-accent-soft/85 max-w-xs mx-auto leading-relaxed mb-6 whitespace-pre-line">
          Ayúdanos a armar la playlist perfecta para celebrar en la pista
          de baile.{"\n"}¡Sugiéremos tu tema favorito!
        </p>
      </motion.div>

      {/* ─── Form ────────────────────────────────────────────── */}
      {/* Render condicional: en modo Firestore sólo se muestra si el
          visitante es una familia válida. En modo memoria se muestra
          siempre (cualquiera puede agregar en RAM). */}
      {canAddSongs && (
        <SongForm
          key={`form-${isValidFamily ? familyName : "guest"}`}
          useFirestore={useFirestoreMode}
          defaultName={familyName}
          onSubmit={handleAdd}
        />
      )}

      {/* ─── Recent suggestions ──────────────────────────────── */}
      <motion.div
        className="mt-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-xv-accent-soft" />
            <h3 className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft font-bold">
              Sugerencias Recientes
            </h3>
          </div>
          <span className="font-montserrat text-[9px] tracking-[0.1em] uppercase text-xv-accent-soft/70 px-2.5 py-0.5 rounded-full bg-xv-accent-soft/10 border border-xv-accent-soft/25">
            {totalCount} {totalCount === 1 ? "tema agregado" : "temas agregados"}
          </span>
        </div>

        {/* Empty state SOLO en modo Firestore (esperando sugerencias).
            En modo memoria siempre hay DEFAULT_REPERTOIRE. */}
        {recent.length === 0 && useFirestoreMode ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2.5">
            {recent.map((song) => (
              <SongRow key={song.id} song={song} />
            ))}
          </ul>
        )}

        {totalCount > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-xv-accent-soft/30 text-xv-accent-soft font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-xv-accent-soft/10 transition-colors"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Ver todas las canciones ({totalCount})</span>
          </button>
        )}
      </motion.div>

      {/* ─── Modal "Ver todas" ────────────────────────────────── */}
      <SongsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        songs={songs}
      />
    </section>
  );
}

/* ============================================================================
 * Form: 2 inputs (modo Firestore, familia válida) o 3 (modo memoria/guest).
 *
 * - Modo Firestore (useFirestore=true, familia válida): sólo Canción +
 *   Artista. El nombre de la familia ya viene del contexto.
 * - Modo memoria/guest (useFirestore=false): Canción + Artista + Nombre
 *   del invitado (requerido, no hay familia asociada).
 * ========================================================================== */
function SongForm({
  useFirestore,
  defaultName,
  onSubmit,
}: {
  /**
   * Si `true`, el form está en modo Firestore (familia válida): NO se
   * muestra el campo de nombre (ya viene del contexto).
   * Si `false`, es modo memoria/guest: el visitante escribe su nombre.
   */
  useFirestore: boolean;
  defaultName: string;
  onSubmit: (title: string, artist: string, name: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  // El padre aplica `key={`form-${isValidFamily ? familyName : "guest"}`}`,
  // así que cuando cambia el contexto (familiar ↔ guest o llega el
  // nombre desde Firestore) el form se REMONTA y el state arranca
  // limpio con el `defaultName` actualizado. NO necesitamos un effect
  // que sincronice `name` desde la prop — sería un cascading render.
  const [name, setName] = useState(defaultName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // En modo Firestore el nombre no se pide (input oculto); en modo
  // memoria es requerido.
  const canSubmit =
    title.trim().length > 0 &&
    artist.trim().length > 0 &&
    (useFirestore || name.trim().length > 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(title, artist, name);
      // Limpiar sólo los campos de canción (mantener nombre)
      setTitle("");
      setArtist("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto text-left"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
    >
      <Field
        label="Canción"
        required
        value={title}
        onChange={setTitle}
        placeholder="Título de la canción…"
      />
      <Field
        label="Artista o Grupo"
        required
        value={artist}
        onChange={setArtist}
        placeholder="Artista…"
      />
      {/* Campo de nombre OCULTO en modo Firestore: la familia ya viene
          del contexto, pedirlo sería redundante. */}
      {!useFirestore && (
        <Field
          label="Tu Nombre o Dedicatoria"
          optionalLabel="requerido"
          value={name}
          onChange={setName}
          placeholder="Tu nombre (para saber de quién viene)"
        />
      )}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className={cn(
          "mt-5 w-full py-3.5 px-6 rounded-full font-montserrat text-[11px] font-bold uppercase tracking-[0.2em] inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
          "bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark shadow-[0_4px_22px_rgba(56,189,248,0.35)]",
        )}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {isSubmitting ? "Enviando…" : "Sugerir Canción"}
      </button>
    </motion.form>
  );
}

/* Input field compartido */
function Field({
  label,
  required,
  optionalLabel,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  required?: boolean;
  optionalLabel?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block mb-3">
      <span className="block font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft/80 font-bold mb-1.5">
        {label}
        {required && <span className="text-xv-accent-soft/60"> *</span>}
        {optionalLabel && (
          <span className="ml-1 text-xv-accent-soft/50 font-normal normal-case tracking-normal italic">
            ({optionalLabel})
          </span>
        )}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "w-full bg-transparent border-0 border-b border-xv-accent-soft/30 py-2 text-sm text-white placeholder:text-xv-accent-soft/35",
          "focus:border-xv-accent-soft focus:outline-none focus:ring-0 transition-colors font-montserrat",
          readOnly && "opacity-70 cursor-not-allowed",
        )}
      />
    </label>
  );
}

/* ============================================================================
 * Fila de sugerencia (recientes + dentro del modal).
 * Estilo "card" con icono musical + título + artista + "sugerido por" + chevron.
 * ========================================================================== */
function SongRow({ song }: { song: SongSuggestion }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-xv-bg-mid/40 border border-xv-accent-soft/15 hover:border-xv-accent-soft/35 transition-colors">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-xv-accent-soft/15 border border-xv-accent-soft/30 flex items-center justify-center text-xv-accent-soft">
        <Music2 className="w-4 h-4" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-montserrat text-sm text-white truncate">
          {song.title}
        </p>
        <p className="font-montserrat text-[11px] text-xv-accent-soft/70 truncate">
          <span className="text-xv-accent-soft/55">sugerido por </span>
          {song.suggestedBy}
        </p>
      </div>
    </li>
  );
}

/* Empty state para "SUGERENCIAS RECIENTES" */
function EmptyState() {
  return (
    <div className="px-4 py-6 rounded-2xl border border-dashed border-xv-accent-soft/25 text-center">
      <p className="font-cormorant italic text-sm text-xv-accent-soft/80">
        Sé el primero en sugerir una canción para la pista de baile.
      </p>
    </div>
  );
}

/* ============================================================================
 * Modal: "Ver todas las canciones"
 * - Lista completa
 * - Form rápido para agregar
 * - Botón "Copiar lista completa" (excluye nombres de quien sugiere)
 * ========================================================================== */
function SongsModal({
  isOpen,
  onClose,
  songs,
}: {
  isOpen: boolean;
  onClose: () => void;
  songs: SongSuggestion[];
}) {
  // Hook compartido de portapapeles (mismo que usa `siena/gifts-table`).
  // Vive dentro del modal para que el auto-reset sólo aplique cuando
  // el modal está montado — al cerrarlo, el state se desmonta también.
  const { copied, copy } = useClipboard();

  // Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const handleCopyList = () => {
    if (songs.length === 0) return;
    const lines = songs
      .map((s, i) => `${i + 1}. ${s.title} – ${s.artist}`)
      .join("\n");
    const text = `🎵 Playlist de la XV\n\n${lines}`;
    copy(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="songs-modal"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog (centrado verticalmente, esquinas redondeadas en
              todos los tamaños — un poco más compacto que antes) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="songs-modal-title"
            className="relative w-full sm:max-w-md h-auto max-h-[78svh] flex flex-col bg-xv-bg-deepest border border-xv-accent-soft/25 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header (sin botón de copiar — vive flotante abajo) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-xv-accent-soft/20">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-xv-accent-soft" />
                <h3
                  id="songs-modal-title"
                  className="font-montserrat text-sm font-bold uppercase tracking-[0.2em] text-xv-accent-soft"
                >
                  Playlist ({songs.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-xv-accent-soft/10 text-xv-accent-soft hover:bg-xv-accent-soft/20 inline-flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body scrollable: sólo lista (el form vive arriba, en la
                sección principal; aquí el modal lista y permite copiar). */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {songs.length === 0 ? (
                <div className="px-4 py-8 rounded-2xl border border-dashed border-xv-accent-soft/25 text-center">
                  <p className="font-cormorant italic text-sm text-xv-accent-soft/80">
                    Aún no hay canciones. ¡Sé el primero en sugerir!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {songs.map((song) => (
                    <SongRow key={song.id} song={song} />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>

          {/* Botón flotante "Copiar Lista" — sibling del dialog, vive
              por FUERA del cuadro del modal (no le roba espacio al
              header) y se anima junto al dialog. */}
          <motion.button
            type="button"
            onClick={handleCopyList}
            disabled={songs.length === 0}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg",
              "bg-xv-accent-soft text-xv-bg-deepest hover:bg-xv-accent-primary",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar Lista
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}