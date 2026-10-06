"use client";

import { FC } from "react";
import Assistants from "@/features/front/components/siena/Assistants";

/* ============================================================================
 * XvAssitants — wrapper DRY sobre `siena/Assistants` con variant="xv".
 *
 * Comparte el 100% de la lógica de carga/validación/persistencia
 * (Firestore + Activity + FamilyQuotes) con la versión de bodas — sólo
 * cambia el look & feel visual, que ahora vive en un único componente
 * con dos variantes.
 *
 * Si en el futuro hay que ajustar el formulario, los fixes se hacen
 * UNA sola vez en `siena/Assistants.tsx` y aplican para bodas + XV.
 * ========================================================================== */

interface Props {
  containerClassName?: string;
  textClassName?: string;
}

const XvAssitants: FC<Props> = (props) => {
  return <Assistants variant="xv" {...props} />;
};

export default XvAssitants;