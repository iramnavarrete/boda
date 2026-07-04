import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useInvitationStore } from "../stores/invitationStore";

interface FamilyContextProps {
  family: Family | null;
  isLoadingFamily: boolean;
  setFamily: React.Dispatch<React.SetStateAction<Family | null>>;
}

const FamilyContext = createContext<FamilyContextProps>({
  family: null,
  isLoadingFamily: true,
  setFamily: () => {},
});

export const FamilyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const id = searchParams?.get("family");
  const preview = searchParams?.get("preview");
  const invitationData = useInvitationStore((state) => state.invitationData);

  const [family, setFamily] = useState<Family | null>(null);
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);

 useEffect(() => {
   const fetchFamily = async () => {
     // 🔥 Lógica movida ADENTRO de la función async para evitar el error de "cascading renders"
     if (!invitationData?.id || !id || id === "_" || preview) {
       setIsLoadingFamily(false);
       return;
     }

     setIsLoadingFamily(true);
     const { family: fetchedFamily, error } = await FamiliesService.getFamily(
       invitationData.id,
       id,
     );
     if (fetchedFamily && !error) {
       setFamily(fetchedFamily);
     }
     setIsLoadingFamily(false);
   };

   fetchFamily();
 }, [invitationData?.id, id, preview]);

  return (
    <FamilyContext.Provider
      value={{ family, isLoadingFamily, setFamily }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamilyContext = () => useContext(FamilyContext);
