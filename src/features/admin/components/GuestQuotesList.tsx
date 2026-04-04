import { GuestService } from "@/services/guestService";
import { GuestQuote } from "@/types";
import { CheckCircle2, MessageCircle, Search, X } from "lucide-react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GuestQuoteCard from "./GuestQuoteCard";
import { GuestQuotesService } from "@/services/guestQuotesService";
import Loader from "@/features/front/components/Loader";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

type FilterType = "all" | "unread" | "read";

const useMasonryColumns = () => {
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setColumns(4);
      else if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 768) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columns;
};

const GuestQuotesList: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<GuestQuote[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const colCount = useMasonryColumns();

  const invitationData = useInvitationStore((state) => state.invitationData);

  // Escuchar a Firebase en tiempo real
  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationData) {
      unsubscribe = GuestQuotesService.subscribeToGuestMessages(
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
        await GuestQuotesService.toggleMessageReadStatus(
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
      await GuestQuotesService.markAllMessagesAsRead(
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

  const masonryColumns = useMemo(() => {
    const cols: GuestQuote[][] = Array.from({ length: colCount }, () => []);
    filteredMessages.forEach((msg, idx) => cols[idx % colCount].push(msg));
    return cols;
  }, [filteredMessages, colCount]);

  return (
    <section className="flex-1 relative z-10">
      <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-16 flex flex-col">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif text-primary mb-3 leading-tight">
                Mensajes &{" "}
                <span className="italic text-gold-500 font-light">
                  Bendiciones
                </span>
              </h2>
              <p className="text-[#8F8F8B] text-base md:text-lg font-light leading-relaxed">
                Una colección curada de amor, risas y sabiduría de nuestros
                invitados más queridos.
              </p>
            </div>
            {counts.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-0.5"
              >
                <CheckCircle2 size={16} /> Marcar todos como leídos
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-4 border-b border-sand-200]">
            <div className="flex gap-6 overflow-hidden w-full md:w-auto">
              {(["all", "unread", "read"] as const).map((f) => {
                const isActive = filter === f;
                const labels = {
                  all: "Todos",
                  unread: "Nuevos",
                  read: "Leídos",
                };
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`relative pb-4 text-sm md:text-base whitespace-nowrap transition-colors flex items-center gap-2 ${
                      isActive
                        ? "text-charcoal-800 font-serif font-bold"
                        : "text-charcoal-500 font-serif hover:text-stone-custom"
                    }`}
                  >
                    {labels[f]}
                    <span
                      className={`text-[10px] font-sans px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-gold-500/10 text-gold-500"
                          : "bg-white/70 text-charcoal-500 border border-sand-200]"
                      }`}
                    >
                      {counts[f]}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterTab"
                        className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gold-500"
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
            <div className="relative w-full md:w-64 mb-4 md:mb-3">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gold text-stone-custom">
                <Search size={18} />
              </div>
              <input
                className="w-full pl-10 pr-10 py-3 bg-white/90 border border-sand rounded-xl outline-none focus:ring-0 focus:ring-gold focus:border-gold/50 transition-all duration-300 text-sm text-charcoal placeholder:text-stone-light shadow-sm"
                placeholder={`Buscar entre ${filteredMessages.length} mensaje${filteredMessages.length >= 2 ? "s" : ""}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery !== "" && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-custom hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredMessages.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-sand-200]">
            <div className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center text-stone-300 mb-4 border border-sand-200]">
              <MessageCircle size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-charcoal-800 mb-2">
              Ningún mensaje encontrado
            </h3>
            <p className="text-stone-custom">
              Intenta cambiar los filtros o los términos de búsqueda.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2 bg-white border border-sand-200] rounded-full text-sm font-bold hover:text-gold-500 transition-colors shadow-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
        {isLoading && (
          <div className="w-full h-full">
            <Loader />
          </div>
        )}

        <div className="flex items-start gap-6 pb-12 w-full">
          {masonryColumns.map((column, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 flex flex-col gap-6 w-full min-w-0"
            >
              {column.map((msg) => (
                <GuestQuoteCard
                  key={msg.id}
                  msg={msg}
                  onManualToggle={handleManualToggle}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestQuotesList;
