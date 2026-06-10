import React from "react";
import { Guest } from "@/types";
import SearchAndFilterBar from "../SearchAndFilterBar";
import GuestsGridView from "./GuestsGridView";
import GuestsTableView from "./GuestsTableView";

interface GuestsMainSectionProps {
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterCounts: Record<string, number>;
  whatsappFilter: string;
  setWhatsappFilter: (filter: string) => void;
  whatsappCounts: Record<string, number>;
  tagFilter: string;
  setTagFilter: (filter: string) => void;
  tagCounts: Record<string, number>;
  selectedGuests: Set<string>;
  filteredGuests: Guest[];
  isLoadingGuests: boolean;
  disabled: boolean;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onNewGuest: () => void;
  onSelectGuest: (id: string) => void;
  onSendReminder: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

const GuestsMainSection: React.FC<GuestsMainSectionProps> = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterCounts,
  whatsappFilter,
  setWhatsappFilter,
  whatsappCounts,
  tagFilter,
  setTagFilter,
  tagCounts,
  selectedGuests,
  filteredGuests,
  isLoadingGuests,
  disabled,
  onImportExcel,
  onExportExcel,
  onNewGuest,
  onSelectGuest,
  onSendReminder,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
}) => {
  return (
    <>
      <SearchAndFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCounts={filterCounts}
        whatsappFilter={whatsappFilter}
        setWhatsappFilter={setWhatsappFilter}
        whatsappCounts={whatsappCounts}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        tagCounts={tagCounts}
        onImportExcel={onImportExcel}
        onExportExcel={onExportExcel}
        onNewGuest={onNewGuest}
        disabled={disabled}
        filteredGuestCount={filteredGuests.length}
        setViewMode={setViewMode}
        viewMode={viewMode}
      />

      {viewMode === "grid" ? (
        <GuestsGridView
          filteredGuests={filteredGuests}
          selectedGuests={selectedGuests}
          onSelectGuest={onSelectGuest}
          onSendReminder={onSendReminder}
          onEdit={onEdit}
          onDelete={onDelete}
          onSendWhatsApp={onSendWhatsApp}
          onLockToggle={onLockToggle}
          isLoading={isLoadingGuests}
        />
      ) : (
        <GuestsTableView
          filteredGuests={filteredGuests}
          selectedGuests={selectedGuests}
          onSelectGuest={onSelectGuest}
          onSendReminder={onSendReminder}
          onEdit={onEdit}
          onDelete={onDelete}
          onSendWhatsApp={onSendWhatsApp}
          onLockToggle={onLockToggle}
        />
      )}
    </>
  );
};

export default GuestsMainSection;
