import { Family } from "@/types";

export const isPartialConfirmation = (f: Family): boolean =>
  f.asistencia === true &&
  typeof f.confirmados === "number" &&
  typeof f.invitados === "number" &&
  f.confirmados < f.invitados;

// Cuántos pases quedaron sin confirmar
export const getRejectedPasses = (f: Family): number => {
  if (!isPartialConfirmation(f)) return 0;
  return (f.invitados ?? 0) - (f.confirmados ?? 0);
};
