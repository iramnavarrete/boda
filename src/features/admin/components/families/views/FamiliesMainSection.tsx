import React, { useEffect } from "react";
import { useWeddingAdminContext } from "@/features/admin/context/WeddingAdminContext";
import SearchAndFilterBar from "../../SearchAndFilterBar";
import FamiliesGridView from "../../FamiliesGridView";
import FamiliesTableView from "../../FamiliesTableView";

const FamiliesMainSection: React.FC = () => {
  const { viewMode, setSearchTerm } = useWeddingAdminContext();

  // Reiniciamos filtros al recargar
  useEffect(() => {
    setSearchTerm?.("");
  }, [setSearchTerm]);

  return (
    <>
      <SearchAndFilterBar />

      {viewMode === "grid" ? <FamiliesGridView /> : <FamiliesTableView />}
    </>
  );
};

export default FamiliesMainSection;
