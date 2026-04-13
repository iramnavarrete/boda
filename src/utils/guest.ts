import { Guest } from "@/types";

export const isPartialConfirmation = (g: Guest): boolean =>
  g.asistencia === true &&
  typeof g.confirmados === "number" &&
  typeof g.invitados === "number" &&
  g.confirmados < g.invitados;

// Cuántos pases quedaron sin confirmar
export const getRejectedPasses = (g: Guest): number => {
  if (!isPartialConfirmation(g)) return 0;
  return (g.invitados ?? 0) - (g.confirmados ?? 0);
};
