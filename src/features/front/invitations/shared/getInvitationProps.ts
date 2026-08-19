import type { GetServerSidePropsContext, GetServerSideProps } from "next";
import { InvitationsService } from "@/services/invitationsService";
import { Invitation } from "@/types";

/**
 * `getServerSideProps` compartido por todas las invitaciones dinámicas.
 *
 * - Lee el slug de la URL (`/i/<slug>`).
 * - Trae la invitación de Firestore.
 * - Genera `fechaISO` con la zona horaria correcta de Chihuahua.
 * - Resuelve URLs absolutas para `imagenPortada` y arma `eventUrl`.
 *
 * Si la invitación no existe o hay error, devuelve `notFound`.
 */
export const getInvitationProps: GetServerSideProps<{
  invitationData: Invitation & { eventUrl: string };
}> = async (context: GetServerSidePropsContext) => {
  try {
    const host = context.req?.headers?.host || "jninvitaciones.com";
    const protocol =
      context.req?.headers?.["x-forwarded-proto"] ||
      (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    // Tomamos el último segmento de la URL como ID de invitación.
    const resolvedUrl = context.resolvedUrl || "/i/josue-yaneth";
    const pathWithoutQuery = resolvedUrl.split("?")[0];
    const pathSegments = pathWithoutQuery.split("/").filter(Boolean);
    const INVITATION_ID = pathSegments[pathSegments.length - 1];

    const { invitation } =
      await InvitationsService.getInvitation(INVITATION_ID);
    if (!invitation) {
      return { notFound: true };
    }

    // ── Fecha ISO con zona horaria correcta de Chihuahua ──────────────────────
    const firestoreDate =
      typeof invitation.fecha?.toDate === "function"
        ? invitation.fecha.toDate()
        : invitation.fecha instanceof Date
          ? invitation.fecha
          : null;

    if (firestoreDate) {
      const horaRecepcion = invitation.recepcion?.hora || "12:00";
      const [horaStr, minStr] = horaRecepcion.split(":");
      const hours = parseInt(horaStr, 10);
      const minutes = parseInt(minStr ?? "0", 10);

      const tz = "America/Chihuahua";
      const fmt = (opts: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-US", { ...opts, timeZone: tz }).format(
          firestoreDate,
        );

      const year = fmt({ year: "numeric" });
      const month = fmt({ month: "2-digit" });
      const day = fmt({ day: "2-digit" });

      const hh = isNaN(hours) ? "12" : String(hours).padStart(2, "0");
      const mm = isNaN(minutes) ? "00" : String(minutes).padStart(2, "0");

      // Offset real de Chihuahua en esa fecha (maneja horario de verano automáticamente)
      const tzNamePart =
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "shortOffset",
        })
          .formatToParts(firestoreDate)
          .find((p) => p.type === "timeZoneName")?.value ?? "GMT-6";

      const offsetMatch = tzNamePart.match(/GMT([+-])(\d+)/);
      const sign = offsetMatch?.[1] ?? "-";
      const offsetH = (offsetMatch?.[2] ?? "6").padStart(2, "0");

      invitation.fechaISO = `${year}-${month}-${day}T${hh}:${mm}:00${sign}${offsetH}:00`;
      // Resultado: "2026-05-10T21:00:00-06:00"
    }
    // ─────────────────────────────────────────────────────────────────────────

    const serializedData = JSON.parse(JSON.stringify(invitation));

    let absoluteImageUrl = `${baseUrl}/img/og-cover.jpg`;
    if (serializedData.imagenPortada) {
      if (serializedData.imagenPortada.startsWith("http")) {
        absoluteImageUrl = serializedData.imagenPortada;
      } else {
        const relativePath = serializedData.imagenPortada.startsWith("/")
          ? serializedData.imagenPortada
          : `/${serializedData.imagenPortada}`;
        absoluteImageUrl = `${baseUrl}${relativePath}`;
      }
    }

    serializedData.imagenPortada = absoluteImageUrl;
    serializedData.eventUrl = `${baseUrl}/i/${INVITATION_ID}`;

    return {
      props: {
        invitationData: { ...serializedData, id: INVITATION_ID },
      },
    };
  } catch (error) {
    console.error(`Error cargando invitación dinámica:`, error);
    return { notFound: true };
  }
};
