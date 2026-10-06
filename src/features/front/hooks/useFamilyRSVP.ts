"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Family, FamilyFormData } from "@/types";
import { useFamilyContext } from "@/features/front/components/FamilyContext";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { FamiliesService } from "@/services/familiesService";
import { FamilyQuotesService } from "@/services/familyQuotesService";
import { ActivityService } from "@/services/activityService";

/**
 * Default "Invitado genérico" — usado cuando NO hay `?family=` en la URL
 * o cuando aún no se ha cargado Firestore.
 */
export const defaultFamily: Family = {
  asistencia: null,
  confirmados: 1,
  id: "_",
  notaInvitado: "",
  nombre: "Invitado genérico",
  invitados: 1,
  cambiosPermitidos: true,
  fechaCreacion: null,
  notaAnfitrion: "",
  tieneTelefono: false,
  ultimaModificacion: null,
};

/** `true` cuando el id es el placeholder genérico. */
export const isDefaultId = (id?: string) => id === "_";

/**
 * Estado + handlers del flujo de RSVP. Compartido por Siona/XV sin tocar
 * estilos. Web RSVP es siempre write público (visitante sin auth) → el
 * save se hace con la rama pública de `FamiliesService.saveFamily`, que
 * sólo escribe campos en `allowedPublicWriteFields` de las rules.
 */
export function useFamilyRSVP() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("family") ?? undefined;
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { family, isLoadingFamily, setFamily } = useFamilyContext();

  const [familyData, setFamilyData] = useState<Family>(defaultFamily);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const isExpiredLocal = () => {
    if (!familyData?.fechaLimiteConfirmacion) return false;
    const dateFormatted = new Date().toLocaleDateString("en-CA");
    return familyData.fechaLimiteConfirmacion < dateFormatted;
  };

  const isFormLocked =
    familyData.cambiosPermitidos === false || isExpiredLocal();

  const deadlineString = familyData?.fechaLimiteConfirmacion
    ? familyData.fechaLimiteConfirmacion.includes("T")
      ? familyData.fechaLimiteConfirmacion
      : `${familyData.fechaLimiteConfirmacion}T23:59:59`
    : undefined;

  const formattedDeadline = useMemo(() => {
    if (!deadlineString) return "";
    const d = new Date(deadlineString);
    const datePart = new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${datePart} a las ${timePart}`;
  }, [deadlineString]);

  // Carga la familia + nota desde Firestore al montar / cambiar id.
  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!id || isDefaultId(id) || !invitationData) return;
      if (familyData.id === id) return;

      if (family && family.id === id) {
        const { result, error } = await FamilyQuotesService.getFamilyQuote(
          invitationData.id,
          id,
        );
        const familyDataCopy = { ...family };
        if (!error && result !== null) {
          familyDataCopy.notaInvitado = result.mensaje;
        }
        setFamilyData(familyDataCopy);
        if (familyDataCopy.asistencia !== null) {
          setIsFormSubmitted(true);
        }
      } else if (!isLoadingFamily) {
        setFamilyData(defaultFamily);
      }
    };
    fetchFamilyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invitationData, family, isLoadingFamily]);

  /** Submit handler — llama a saveFamily (rama pública) + Quote + Activity */
  const handleSubmit = async (data: FamilyFormData) => {
    setIsDisabled(true);
    if (!isDefaultId(data.id) && invitationData) {
      try {
        await FamiliesService.saveFamily(
          invitationData.id,
          familyData,
          data,
          false,
          true, // isPublic: web RSVP es siempre write público
        );

        setIsFormSubmitted(true);

        if (data.notaInvitado && data.notaInvitado.trim() !== "") {
          FamilyQuotesService.saveFamilyQuote(invitationData.id, data.id!, {
            autor: data.nombre,
            mensaje: data.notaInvitado || "",
            asistencia: data.asistencia,
          });
        }

        ActivityService.logActivity(invitationData.id, {
          action: data.asistencia === true ? "confirm" : "decline",
          familyId: data.id!,
          familyName: data.nombre,
          confirmedGuests:
            data.asistencia === true && data.confirmados && data.confirmados > 0
              ? data.confirmados
              : null,
        });

        // Estado local: preservar server-side fields de familyData (no
        // vienen del form, sólo los conoce el hook).
        const newFamilyLocal = {
          ...familyData,
          ...data,
          id: data.id!,
          tieneTelefono: familyData.tieneTelefono,
          fechaCreacion: familyData.fechaCreacion,
          ultimaModificacion: familyData.ultimaModificacion,
        };
        setFamilyData(newFamilyLocal);
        setFamily(newFamilyLocal);
      } catch {
        setIsDisabled(false);
      }
    } else {
      // Visitante genérico: sólo memoria local.
      setIsFormSubmitted(true);
      setFamilyData({
        ...defaultFamily,
        asistencia: data.asistencia,
        confirmados: data.confirmados,
        notaInvitado: data.notaInvitado,
      });
      setIsDisabled(false);
    }
  };

  /** Reset del formulario (volver a editar). */
  const handleModify = () => {
    setIsFormSubmitted(false);
    setIsDisabled(false);
  };

  return {
    familyData,
    isFormSubmitted,
    isDisabled,
    isFormLocked,
    formattedDeadline,
    handleSubmit,
    handleModify,
    invitationData,
  };
}