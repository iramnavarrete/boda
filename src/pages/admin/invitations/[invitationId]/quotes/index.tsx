"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  Search,
  Sparkles,
  MailOpen,
  Mail,
  MessageCircle,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion"; // Solo conservamos motion para el subrayado de los filtros
import AdminLayout from "@/features/shared/layouts/admin";

interface GuestMessage {
  id: string;
  author: string;
  relationship: string;
  text: string;
  date: string;
  isRead: boolean;
  visualIsRead?: boolean;
  imageUrl?: string;
}

const INITIAL_MESSAGES: GuestMessage[] = [
  {
    id: "1",
    author: "Eleanor & Jasper",
    relationship: "Familia",
    text: "Wishing you a lifetime of joy and endless laughter. May your journey together be as beautiful as this day. We are so honored to be here.",
    date: "Hace 2 hrs",
    isRead: false,
  },
  {
    id: "2",
    author: "Sophia Chen",
    relationship: "Amigos",
    text: "So honored to witness such a beautiful union. Your love is truly inspiring. Sending all my love from London!",
    date: "Ayer",
    isRead: true,
  },
  {
    id: "8",
    author: "The Sterling Family",
    relationship: "Amigos",
    text: "To a perfect couple, may your love grow stronger with each passing year. Congratulations! This celebration is just like you: stunning.",
    date: "Hace 5 horas",
    isRead: false,
    imageUrl:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    author: "The Millers",
    relationship: "Amigos",
    text: "Warmest congratulations on your wedding day. We are so happy for both of you! Looking forward to many more family gatherings.",
    date: "Hace 2 días",
    isRead: true,
  },
  {
    id: "4",
    author: "Marcus Wright",
    relationship: "Colegas",
    text: "Cheers to the new Mr. and Mrs.! May your home be filled with happiness and your hearts with love. Let's party tonight!",
    date: "Ayer",
    isRead: true,
    imageUrl:
      "https://images.unsplash.com/photo-1583939000572-c28892c9f52f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    author: "Isabella Rossi",
    relationship: "Familia",
    text: "May the years ahead be filled with lasting joy. What a magnificent celebration of love. Truly a fairy tale come true.",
    date: "Hace 3 días",
    isRead: true,
    imageUrl:
      "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "6",
    author: "Dr. Martínez",
    relationship: "Colegas",
    text: "Mis mejores deseos en esta nueva etapa. Lamento no poder acompañarlos físicamente, pero estaré con ustedes en pensamiento. ¡Disfruten su día al máximo!",
    date: "Hace 1 semana",
    isRead: false,
  },
];

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

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

interface MessageCardProps {
  msg: GuestMessage;
  onAutoRead: (id: string) => void;
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

function MessageCard({ msg, onAutoRead, onManualToggle }: MessageCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRead = msg.visualIsRead;

  useEffect(() => {
    if (isRead) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timerRef.current = setTimeout(() => onAutoRead(msg.id), 1500);
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [msg.id, isRead, onAutoRead]);

  return (
    <div
      ref={ref}
      // Reemplazamos motion.div por div normal, eliminando initial, animate y exit
      className={`
        relative rounded-[20px] group flex flex-col w-full overflow-hidden
        transition-[box-shadow,transform] duration-300
        ${
          isRead
            ? "bg-white shadow-[0_4px_20px_rgba(44,44,41,0.04)] hover:shadow-[0_8px_30px_rgba(44,44,41,0.08)]"
            : "bg-[#FDFBF7] shadow-[0_8px_30px_rgba(197,166,105,0.15)] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(197,166,105,0.22)]"
        }
      `}
    >
      <div className="p-6 md:p-8 flex flex-col flex-1 relative">
        {!isRead && (
          <div className="absolute top-4 right-4 bg-[#C5A669] text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-10 animate-bounce">
            <Sparkles size={10} /> Nuevo
          </div>
        )}

        <div className="text-[#C5A669] opacity-60 mb-4">
          <Quote size={24} className="fill-current" />
        </div>

        <p
          className={`font-serif text-lg md:text-xl italic leading-relaxed mb-8 flex-1 ${isRead ? "text-[#5A5A5A]" : "text-[#2C2C29]"}`}
        >
          "{msg.text}"
        </p>

        <div className="flex items-center justify-between pt-5 mt-auto border-t border-[#EBE5DA]/60">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isRead ? "bg-[#F5F5F4] text-[#A8A29E]" : "bg-[#C5A669] text-white"}`}
            >
              {getInitials(msg.author)}
            </div>
            <div>
              <p className="font-bold text-[#2C2C29] text-sm tracking-wide uppercase">
                {msg.author}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A669] font-bold">
                  {msg.relationship}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[10px] text-stone-light">{msg.date}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onManualToggle(msg.id, isRead || false)}
            className={`p-2.5 rounded-full transition-colors z-20 ${isRead ? "text-stone-300 hover:text-[#C5A669] hover:bg-[#FDFBF7]" : "text-[#C5A669] bg-white shadow-sm border border-[#EBE5DA] hover:bg-[#C5A669] hover:text-white"}`}
            title={isRead ? "Marcar como no leído" : "Marcar como leído"}
          >
            {isRead ? <MailOpen size={16} /> : <Mail size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuestMessagesPage() {
  const [messages, setMessages] = useState<GuestMessage[]>(INITIAL_MESSAGES);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const colCount = useMasonryColumns();
  const sessionAutoReadIds = useRef<Set<string>>(new Set());

  const handleAutoRead = useCallback((id: string) => {
    if (!sessionAutoReadIds.current.has(id)) sessionAutoReadIds.current.add(id);
  }, []);

  const handleManualToggle = useCallback(
    (id: string, currentVisualStatus: boolean) => {
      sessionAutoReadIds.current.delete(id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, isRead: !currentVisualStatus } : m,
        ),
      );
    },
    [],
  );

  const markAllAsRead = () => {
    sessionAutoReadIds.current.clear();
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  };

  const visualMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        visualIsRead: sessionAutoReadIds.current.has(msg.id)
          ? false
          : msg.isRead,
      })),
    [messages],
  );

  const filteredMessages = useMemo(
    () =>
      visualMessages.filter((msg) => {
        const matchesSearch =
          msg.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "unread"
              ? !msg.visualIsRead
              : msg.visualIsRead;
        return matchesSearch && matchesFilter;
      }),
    [visualMessages, filter, searchQuery],
  );

  const counts = useMemo(
    () => ({
      all: visualMessages.length,
      unread: visualMessages.filter((m) => !m.visualIsRead).length,
      read: visualMessages.filter((m) => m.visualIsRead).length,
    }),
    [visualMessages],
  );

  const masonryColumns = useMemo(() => {
    const cols: GuestMessage[][] = Array.from({ length: colCount }, () => []);
    filteredMessages.forEach((msg, idx) => cols[idx % colCount].push(msg));
    return cols;
  }, [filteredMessages, colCount]);

  return (
    <AdminLayout>
      <section className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-16 flex flex-col">
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-serif text-[#2C2C29] mb-3 leading-tight">
                  Mensajes &{" "}
                  <span className="italic text-[#C5A669] font-light">
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
                  className="hidden md:flex items-center gap-2 bg-[#2C2C29] text-white px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-0.5"
                >
                  <CheckCircle2 size={16} /> Marcar Leídos
                </button>
              )}
            </div>

            <div className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-4 border-b border-[#EBE5DA]">
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
                          ? "text-[#2C2C29] font-serif font-bold"
                          : "text-[#A8A29E] font-serif hover:text-[#5A5A5A]"
                      }`}
                    >
                      {labels[f]}
                      <span
                        className={`text-[10px] font-sans px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#C5A669]/10 text-[#C5A669]"
                            : "bg-[#FDFBF7] text-[#A8A29E] border border-[#EBE5DA]"
                        }`}
                      >
                        {counts[f]}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterTab"
                          className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-[#C5A669]"
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

              <div className="relative w-full md:w-64 pb-4 md:pb-3">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 md:-translate-y-[calc(50%+6px)] text-[#A8A29E]"
                />
                <input
                  type="text"
                  placeholder="Buscar remitente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] hover:bg-white focus:bg-white border border-[#EBE5DA] focus:border-[#C5A669]/50 rounded-lg text-sm outline-none transition-all placeholder:text-[#A8A29E] text-[#2C2C29] shadow-sm focus:shadow-md"
                />
              </div>
            </div>

            {counts.unread > 0 && (
              <div className="mt-6 md:hidden flex justify-end">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#C5A669] hover:text-[#8F7546]"
                >
                  <CheckCircle2 size={14} /> Marcar Leídos
                </button>
              </div>
            )}
          </div>

          {filteredMessages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-[#EBE5DA]">
              <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center text-stone-300 mb-4 border border-[#EBE5DA]">
                <MessageCircle size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-[#2C2C29] mb-2">
                Ningún mensaje encontrado
              </h3>
              <p className="text-[#5A5A5A]">
                Intenta cambiar los filtros o los términos de búsqueda.
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="mt-6 px-6 py-2 bg-white border border-[#EBE5DA] rounded-full text-sm font-bold hover:text-[#C5A669] transition-colors shadow-sm"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="flex items-start gap-6 pb-12 w-full">
            {masonryColumns.map((column, colIdx) => (
              <div
                key={colIdx}
                className="flex-1 flex flex-col gap-6 w-full min-w-0"
              >
                {/* Eliminamos <AnimatePresence> y renderizamos directamente el array */}
                {column.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    onAutoRead={handleAutoRead}
                    onManualToggle={handleManualToggle}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
