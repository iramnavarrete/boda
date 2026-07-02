import React, { useEffect } from "react";
import {
  FilterCounts,
  Family,
  TagCounts,
  TagFilterType,
  WhatsappCounts,
  WhatsappFilterType,
} from "@/types";
import SearchAndFilterBar from "../../SearchAndFilterBar";
import FamiliesGridView from "../../FamiliesGridView";
import FamiliesTableView from "../../FamiliesTableView";

interface FamiliesMainSectionProps {
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: keyof FilterCounts;
  setFilterStatus: (status: keyof FilterCounts) => void;
  filterCounts: FilterCounts;
  whatsappFilter: WhatsappFilterType;
  setWhatsappFilter: (filter: WhatsappFilterType) => void;
  whatsappCounts: WhatsappCounts;
  tagFilter: TagFilterType;
  setTagFilter: (filter: TagFilterType) => void;
  tagCounts: TagCounts;
  selectedFamilies: Set<string>;
  filteredFamilies: Family[];
  isLoadingFamilies: boolean;
  disabled: boolean;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onNewFamily: () => void;
  onSelectFamily: (id: string) => void;
  onSendReminder: (family: Family) => void;
  onEdit: (family: Family) => void;
  onDelete: (family: Family) => void;
  onSendWhatsApp: (family: Family) => void;
  onLockToggle: (family: Family) => void;
}

const FamiliesMainSection: React.FC<FamiliesMainSectionProps> = ({
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
  selectedFamilies,
  filteredFamilies,
  isLoadingFamilies,
  disabled,
  onImportExcel,
  onExportExcel,
  onNewFamily,
  onSelectFamily,
  onSendReminder,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onLockToggle,
}) => {
  // Reiniciamos filtros al recargar
  useEffect(() => {
    setSearchTerm?.("");
  }, [setSearchTerm]);

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
        onNewFamily={onNewFamily}
        disabled={disabled}
        filteredFamiliesCount={filteredFamilies.length}
        setViewMode={setViewMode}
        viewMode={viewMode}
      />

      {viewMode === "grid" ? (
        <FamiliesGridView
          filteredFamilies={filteredFamilies}
          selectedFamilies={selectedFamilies}
          onSelectFamily={onSelectFamily}
          onSendReminder={onSendReminder}
          onEdit={onEdit}
          onDelete={onDelete}
          onSendWhatsApp={onSendWhatsApp}
          onLockToggle={onLockToggle}
          isLoading={isLoadingFamilies}
        />
      ) : (
        <FamiliesTableView
          filteredFamilies={filteredFamilies}
          selectedFamilies={selectedFamilies}
          onSelectFamily={onSelectFamily}
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

export default FamiliesMainSection;
