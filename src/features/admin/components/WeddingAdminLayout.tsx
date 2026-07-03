import { memo } from "react";
import StatsSidebar from "@/features/admin/components/StatsSidebar";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import FamiliesMainSection from "@/features/admin/components/families/views/FamiliesMainSection";
import { useWeddingAdminContext } from "@/features/admin/context/WeddingAdminContext";

export const WeddingAdminLayout = memo(function WeddingAdminLayout() {
  const {
    // Datos de familias
    finalFilteredFamilies,
    isLoadingFamilies,

    // Filtros
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    statusCounts,
    whatsappFilter,
    setWhatsappFilter,
    whatsappCounts,
    tagFilter,
    setTagFilter,
    tagCounts,

    // Selección
    selectedFamilies,
    handleSelectFamily,
    handleSelectAll,
    clearSelection,
    isFilterActive,

    // Acciones por familia
    handleNewFamily,
    handleEdit,
    handleDeleteFamily,
    handleLockToggle,
    handleExportExcel,
    openImportModal,
    whatsapp,

    // Acciones masivas
    handleBulkUpdateLock,
    handleBulkDelete,
  } = useWeddingAdminContext();

  const selectedCount = selectedFamilies.size;
  const isSelectedAll =
    selectedCount > 0 && selectedCount === finalFilteredFamilies.length;

  return (
    <div className="bg-[#F9F7F2] min-h-screen font-sans text-[#2C2C29]">
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col lg:flex-row gap-4 items-start mt-2.5">
          {/* Sidebar de estadísticas */}
          <aside className="w-full lg:w-auto">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1 lg:max-w-[12ch]">
                Invitados {isFilterActive && "(filtrado)"}
              </h3>
              <StatsSidebar />
            </div>
          </aside>

          {/* Sección principal de familias */}
          <main className="flex-1 w-full lg:order-1 min-w-0">
            <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1">
              Familias {isFilterActive && "(filtrado)"}
            </h3>

            <FamiliesMainSection
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCounts={statusCounts}
              whatsappFilter={whatsappFilter}
              setWhatsappFilter={setWhatsappFilter}
              whatsappCounts={whatsappCounts}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
              tagCounts={tagCounts}
              selectedFamilies={selectedFamilies}
              filteredFamilies={finalFilteredFamilies}
              isLoadingFamilies={isLoadingFamilies}
              disabled={selectedCount > 0}
              onImportExcel={openImportModal}
              onExportExcel={handleExportExcel}
              onNewFamily={handleNewFamily}
              onSelectFamily={handleSelectFamily}
              onSendReminder={(g) => whatsapp.open(g, "reminder")}
              onEdit={handleEdit}
              onDelete={handleDeleteFamily}
              onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
              onLockToggle={handleLockToggle}
            />
          </main>
        </div>
      </section>

      {/* Barra flotante de acciones masivas */}
      <FloatingBulkActionsBar
        count={selectedCount}
        isSelectedAll={isSelectedAll}
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
});
