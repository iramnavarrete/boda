import { memo } from "react";
import StatsSidebar from "@/features/admin/components/families/bars/StatsSidebar";
import FloatingBulkActionsBar from "@/features/admin/components/families/bars/FloatingBulkActionsBar";
import FamiliesMainSection from "@/features/admin/components/families/views/FamiliesMainSection";
import { useWeddingAdminContext } from "@/features/admin/context/WeddingAdminContext";

export const WeddingAdminLayout = memo(function WeddingAdminLayout() {
  const { isFilterActive } = useWeddingAdminContext();

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

            <FamiliesMainSection />
          </main>
        </div>
      </section>

      {/* Barra flotante de acciones masivas */}
      <FloatingBulkActionsBar />
    </div>
  );
});
