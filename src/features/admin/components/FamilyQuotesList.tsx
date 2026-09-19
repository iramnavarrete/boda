"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  useMasonry,
  usePositioner,
  type RenderComponentProps,
} from "masonic";
import { CheckCircle2, Mail, MailOpen, MessageCircle, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import AdminPageShell from "@/features/shared/layouts/admin-page-shell";
import FamilyQuoteCard from "./FamilyQuoteCard";
import Loader from "@/features/front/components/Loader";
import {
  FamilyQuoteMap,
  FamilyQuotesService,
} from "@/services/familyQuotesService";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

type FilterType = "all" | "unread" | "read";

/** Gap entre cards del masonry (px). */
const MASONRY_GAP = 20;

/** Ancho mínimo de cada columna del masonry (masonic deriva las reales). */
const MASONRY_COLUMN_WIDTH = 280;

/** Estimación inicial de altura para que masonic no salte en el primer render. */
const ITEM_HEIGHT_ESTIMATE = 220;

const FamilyQuotesList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<FamilyQuoteMap[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const invitationData = useInvitationStore((state) => state.invitationData);

  // Escuchar a Firebase en tiempo real
  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationData) {
      unsubscribe = FamilyQuotesService.subscribeToQuoteMessages(
        invitationData.id,
        (fetchedMessages) => {
          setMessages([...fetchedMessages]);
          setIsLoading(false);
        },
      );
    }

    return () => unsubscribe();
  }, [invitationData]);

  const handleManualToggle = useCallback(
    async (id: string, currentStatus: boolean) => {
      if (invitationData) {
        await FamilyQuotesService.toggleMessageReadStatus(
          invitationData.id,
          id,
          currentStatus,
        );
      }
    },
    [invitationData],
  );

  const markAllAsRead = async () => {
    const unreadIds = messages.filter((m) => !m.leido).map((m) => m.id);
    if (invitationData) {
      await FamilyQuotesService.markAllMessagesAsRead(
        invitationData.id,
        unreadIds,
      );
    }
  };

  const filteredMessages = useMemo(
    () =>
      messages.filter((msg) => {
        const matchesSearch =
          msg.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.mensaje.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "unread"
              ? !msg.leido
              : msg.leido;
        return matchesSearch && matchesFilter;
      }),
    [messages, filter, searchQuery],
  );

  const counts = useMemo(
    () => ({
      all: messages.length,
      unread: messages.filter((m) => !m.leido).length,
      read: messages.filter((m) => m.leido).length,
    }),
    [messages],
  );

  const clearFilters = () => {
    setFilter("all");
    setSearchQuery("");
  };

  const hasUnread = counts.unread > 0;
  const markAllButton = (
    <button
      onClick={markAllAsRead}
      disabled={!hasUnread}
      aria-label="Marcar todos los mensajes como leídos"
      title={
        hasUnread
          ? `Marcar ${counts.unread} mensaje${counts.unread === 1 ? "" : "s"} como leídos`
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
          {counts.unread}
        </span>
      )}
    </button>
  );

  return (
    <>
      <AdminPageShell
        title={
          <>
            Mensajes &{" "}
            <span className="italic text-gold-500 font-light">Bendiciones</span>
          </>
        }
        subtitle="Una colección curada de amor, risas y sabiduría de nuestros invitados más queridos."
      >
        <div className="flex flex-col h-full min-h-0 gap-4">
          {/* ── Barra de filtros + búsqueda ── */}
          <div className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-3 shrink-0">
          <div className="flex gap-1.5 overflow-hidden w-full md:w-auto p-1 bg-white/40 rounded-full border border-sand-200/60 self-start">
            {(["all", "unread", "read"] as const).map((f) => {
              const isActive = filter === f;
              const tabs: Record<
                FilterType,
                { label: string; icon: ReactNode }
              > = {
                all: { label: "Todos", icon: null },
                unread: { label: "Nuevos", icon: <Mail size={12} /> },
                read: { label: "Leídos", icon: <MailOpen size={12} /> },
              };
              const tab = tabs[f];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative px-3.5 py-1.5 text-xs whitespace-nowrap transition-all flex items-center gap-1.5 rounded-full font-medium ${
                    isActive
                      ? "text-primary bg-white shadow-sm border border-sand-200"
                      : "text-charcoal-500 hover:text-charcoal-800 hover:bg-white/50 border border-transparent"
                  }`}
                >
                  {tab.icon && (
                    <span
                      className={
                        isActive ? "text-gold-500" : "text-charcoal-400"
                      }
                    >
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-gold-500/10 text-gold-500"
                        : "bg-white/80 text-charcoal-400 border border-sand-200"
                    }`}
                  >
                    {counts[f]}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterTab"
                      className="absolute inset-0 rounded-full ring-1 ring-gold-500/30 pointer-events-none"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto mb-3 md:mb-2">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gold text-stone-custom">
                <Search size={15} />
              </div>
              <input
                className="w-full pl-9 pr-9 py-2 bg-white/90 border border-sand rounded-xl outline-none focus:ring-0 focus:ring-gold focus:border-gold/50 transition-all duration-300 text-xs text-charcoal placeholder:text-stone-light shadow-sm"
                placeholder={`Buscar entre ${filteredMessages.length} mensaje${filteredMessages.length >= 2 ? "s" : ""}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery !== "" && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-custom hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Contenido scrollable: empty / loader / masonry ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="h-full w-full">
              <Loader />
            </div>
          ) : filteredMessages.length === 0 ? (
            <EmptyQuotesState onClear={clearFilters} />
          ) : (
            <QuotesMasonry
              messages={filteredMessages}
              onManualToggle={handleManualToggle}
            />
          )}
        </div>
        </div>
      </AdminPageShell>

      {/* ── FAB: Marcar todos como leídos ── */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
        <div className="pointer-events-auto">{markAllButton}</div>
      </div>
    </>
  );
};

export default FamilyQuotesList;

// ────────────────────────────────────────────────────────────────────────────
// Masonry virtualizado (mismo patrón que ActivityCards)
// ────────────────────────────────────────────────────────────────────────────

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      setWrapperWidth(el.clientWidth);
      setWrapperHeight(el.clientHeight);
    };

    measure();

    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", handleScroll, { passive: true });

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro.disconnect();
    };
  }, []);

  // Hash estable para invalidar el positioner cuando cambia el orden o filtro.
  const orderHash = useMemo(() => messages.map((m) => m.id).join("|"), [messages]);

  const positioner = usePositioner(
    {
      width:
        wrapperWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200),
      columnWidth: MASONRY_COLUMN_WIDTH,
      columnGutter: MASONRY_GAP,
      rowGutter: MASONRY_GAP,
    },
    [orderHash],
  );

  // El render closure captura `onManualToggle` para que masonic siempre use
  // la versión vigente del handler sin necesidad de refs externas.
  const renderCard = (
    props: RenderComponentProps<FamilyQuoteMap>,
  ) => (
    <FamilyQuoteCard
      msg={props.data}
      onManualToggle={onManualToggle}
    />
  );

  const rendered = useMasonry<FamilyQuoteMap>({
    items: messages,
    positioner,
    height: wrapperHeight || 800,
    scrollTop,
    itemKey: (m) => m.id,
    itemHeightEstimate: ITEM_HEIGHT_ESTIMATE,
    overscanBy: 2,
    render: renderCard,
  });

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] pr-1"
    >
      {rendered}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Empty state
// ────────────────────────────────────────────────────────────────────────────

const EmptyQuotesState = ({ onClear }: { onClear: () => void }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-sand-200">
      <div className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center text-stone-300 mb-4 border border-sand-200">
        <MessageCircle size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-2xl text-charcoal-800 mb-2">
        Ningún mensaje encontrado
      </h3>
      <p className="text-stone-custom">
        Intenta cambiar los filtros o los términos de búsqueda.
      </p>
      <button
        onClick={onClear}
        className="mt-6 px-6 py-2 bg-white border border-sand-200 rounded-full text-sm font-bold hover:text-gold-500 transition-colors shadow-sm"
      >
        Limpiar filtros
      </button>
    </div>
  );
};
