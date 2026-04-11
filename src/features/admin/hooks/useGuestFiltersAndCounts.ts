import { useMemo } from "react";
import { FilterCounts, Guest, TagCounts, TagFilterType, WhatsappCounts, WhatsappFilterType } from "@/types";

export function useGuestFiltersAndCounts(
  filteredGuests: Guest[],
  whatsappFilter: WhatsappFilterType,
  tagFilter: TagFilterType
) {
  const finalFilteredGuests = useMemo(
    () =>
      filteredGuests.filter((g) => {
        const passWhatsapp =
          whatsappFilter === "sent"     ? !!(g.whatsappEnviado && g.tieneTelefono) :
          whatsappFilter === "not_sent" ? !!(!g.whatsappEnviado && g.tieneTelefono) :
          whatsappFilter === "empty"    ? !g.tieneTelefono :
          true;

        const passTag = tagFilter === "all" || g.etiqueta === tagFilter;
        return passWhatsapp && passTag;
      }),
    [filteredGuests, whatsappFilter, tagFilter]
  );

  const counts = useMemo(() => {
    const filterCounts: FilterCounts = finalFilteredGuests.reduce(
      (acc, g) => ({
        all:       acc.all + 1,
        confirmed: acc.confirmed + (g.asistencia === true  ? 1 : 0),
        rejected:  acc.rejected  + (g.asistencia === false ? 1 : 0),
        pending:   acc.pending   + (g.asistencia == null   ? 1 : 0),
      }),
      { all: 0, confirmed: 0, rejected: 0, pending: 0 }
    );

    const whatsappCounts: WhatsappCounts = {
      all:      finalFilteredGuests.length,
      sent:     finalFilteredGuests.filter((g) => g.whatsappEnviado && g.tieneTelefono).length,
      not_sent: finalFilteredGuests.filter((g) => !g.whatsappEnviado && g.tieneTelefono).length,
      empty:    finalFilteredGuests.filter((g) => !g.tieneTelefono).length,
    };

    const tagCounts: TagCounts = {
      all:   finalFilteredGuests.length,
      Novia: finalFilteredGuests.filter((g) => g.etiqueta === "Novia").length,
      Novio: finalFilteredGuests.filter((g) => g.etiqueta === "Novio").length,
      Ambos: finalFilteredGuests.filter((g) => g.etiqueta === "Ambos").length,
    };

    return { filterCounts, whatsappCounts, tagCounts };
  }, [finalFilteredGuests]);

  return { finalFilteredGuests, ...counts };
}
