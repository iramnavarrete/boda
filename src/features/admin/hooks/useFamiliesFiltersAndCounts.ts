import { useMemo } from "react";
import {
  FilterCounts,
  Family,
  TagCounts,
  TagFilterType,
  WhatsappCounts,
  WhatsappFilterType,
} from "@/types";
import { isPartialConfirmation } from "@/utils/family";

export function useFamiliesFiltersAndCounts(
  filteredFamilies: Family[],
  whatsappFilter: WhatsappFilterType,
  tagFilter: TagFilterType,
) {
  const finalFilteredFamilies = useMemo(
    () =>
      filteredFamilies.filter((g) => {
        const passWhatsapp =
          whatsappFilter === "sent"
            ? !!(g.whatsappEnviado && g.tieneTelefono)
            : whatsappFilter === "not_sent"
              ? !!(!g.whatsappEnviado && g.tieneTelefono)
              : whatsappFilter === "empty"
                ? !g.tieneTelefono
                : true;

        const passTag = tagFilter === "all" || g.etiqueta === tagFilter;
        return passWhatsapp && passTag;
      }),
    [filteredFamilies, whatsappFilter, tagFilter],
  );

  const counts = useMemo(() => {
    const filterCounts: FilterCounts = finalFilteredFamilies.reduce(
      (acc, g) => {
        const partial = isPartialConfirmation(g);
        return {
          all: acc.all + 1,
          confirmed:
            acc.confirmed + (g.asistencia === true && !partial ? 1 : 0),
          partial: acc.partial + (partial ? 1 : 0),
          rejected: acc.rejected + (g.asistencia === false ? 1 : 0),
          pending: acc.pending + (g.asistencia == null ? 1 : 0),
        };
      },
      { all: 0, confirmed: 0, rejected: 0, pending: 0, partial: 0 },
    );

    const whatsappCounts: WhatsappCounts = {
      all: finalFilteredFamilies.length,
      sent: finalFilteredFamilies.filter(
        (g) => g.whatsappEnviado && g.tieneTelefono,
      ).length,
      not_sent: finalFilteredFamilies.filter(
        (g) => !g.whatsappEnviado && g.tieneTelefono,
      ).length,
      empty: finalFilteredFamilies.filter((g) => !g.tieneTelefono).length,
    };

    const tagCounts: TagCounts = {
      all: finalFilteredFamilies.length,
      Novia: finalFilteredFamilies.filter((g) => g.etiqueta === "Novia").length,
      Novio: finalFilteredFamilies.filter((g) => g.etiqueta === "Novio").length,
      Ambos: finalFilteredFamilies.filter((g) => g.etiqueta === "Ambos").length,
    };

    return { filterCounts, whatsappCounts, tagCounts };
  }, [finalFilteredFamilies]);

  return { finalFilteredFamilies, ...counts };
}
