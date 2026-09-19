"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminPageShell from "@/features/shared/layouts/admin-page-shell";
import Loader from "@/features/front/components/Loader";
import {
  FamilyQuoteMap,
  FamilyQuotesService,
} from "@/services/familyQuotesService";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import QuotesFilters, {
  type QuotesFilterType,
} from "./QuotesFilters";
import QuotesMasonry from "./QuotesMasonry";
import QuotesEmptyState from "./QuotesEmptyState";
import MarkAllAsReadFab from "./MarkAllAsReadFab";

/**
 * Página "Mensajes & Bendiciones".
 *
 * Orquesta:
 *  - Header (vía AdminPageShell)
 *  - Filtros + búsqueda (QuotesFilters)
 *  - Masonry virtualizado (QuotesMasonry) o empty/loader
 *  - FAB "Marcar todos leídos" (MarkAllAsReadFab) flotante bottom-right
 */
const FamilyQuotesList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<FamilyQuoteMap[]>([]);
  const [filter, setFilter] = useState<QuotesFilterType>("all");
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
          <QuotesFilters
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredCount={filteredMessages.length}
            counts={counts}
          />

          {/* ── Contenido scrollable: empty / loader / masonry ── */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {isLoading ? (
              <div className="h-full w-full">
                <Loader />
              </div>
            ) : filteredMessages.length === 0 ? (
              <QuotesEmptyState onClear={clearFilters} />
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
        <div className="pointer-events-auto">
          <MarkAllAsReadFab
            onMarkAllAsRead={markAllAsRead}
            unreadCount={counts.unread}
          />
        </div>
      </div>
    </>
  );
};

export default FamilyQuotesList;
