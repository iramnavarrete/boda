"use client";

import { useEffect, useState, type ReactNode } from "react";

import FrontLayout from "@/features/shared/layouts/front";
import DesktopSidebars from "@/features/shared/components/DesktopSidebars";
import { FamilyProvider } from "@/features/front/components/FamilyContext";
import EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import type { Invitation } from "@/types";

import type {
  DesktopSidebarsConfig,
  EnvelopeSplashConfig,
} from "./types";

interface EnvelopeState {
  isEnvelopeOpened: boolean;
}

/**
 * Calcula las iniciales del sobre a partir del nombre de la invitación.
 * "Andrea Lara & Adrián" → "A L & A"
 */
function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((el) => el.substring(0, 1))
    .join(" ");
}

/**
 * Resuelve el `sealConfig` final: si no trae `initials` (o `customSvg`),
 * las calcula desde el nombre del evento.
 */
function resolveSealConfig(
  sealConfig: EnvelopeSplashConfig["sealConfig"],
  eventName: string,
): EnvelopeSplashConfig["sealConfig"] {
  if (!sealConfig) return undefined;
  if (sealConfig.customSvg) return sealConfig;
  if (sealConfig.initials) return sealConfig;
  return { ...sealConfig, initials: computeInitials(eventName) };
}

interface InvitationFrameProps {
  invitationData: Invitation & { eventUrl: string; id: string };
  sealConfig: EnvelopeSplashConfig["sealConfig"];
  sidebars: DesktopSidebarsConfig;
  contentWrapperClassName?: string;
  /**
   * Render prop que recibe el estado del sobre y devuelve el contenido
   * principal. Permite que las secciones (p. ej. Cover) reaccionen al
   * estado de apertura sin acoplarse a este componente.
   */
  children: (state: EnvelopeState) => ReactNode;
}

/**
 * Frame común a todas las invitaciones dinámicas.
 *
 * Responsabilidades:
 *  - Carga la invitación en el store de Zustand.
 *  - Maneja el estado de apertura del sello.
 *  - Renderiza: FrontLayout → FamilyProvider → EnvelopeSplash → sidebars
 *    → contenedor central con `max-w-[500px]`.
 *
 * El contenido de cada invitación se pasa por `children` como render prop
 * para que pueda leer `isEnvelopeOpened` sin prop-drilling.
 */
export default function InvitationFrame({
  invitationData,
  sealConfig,
  sidebars,
  contentWrapperClassName,
  children,
}: InvitationFrameProps) {
  // Inicializa el store una sola vez por montaje del cliente.
  useEffect(() => {
    if (!invitationData) return;
    useInvitationStore.setState({ invitationData });
  }, [invitationData]);

  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const finalSealConfig = invitationData
    ? resolveSealConfig(sealConfig, invitationData.nombre)
    : sealConfig;

  return (
    <FrontLayout>
      <FamilyProvider>
        <EnvelopeSplash
          onOpen={() => setIsEnvelopeOpened(true)}
          sealConfig={finalSealConfig}
        />

        <div style={{ overflow: "hidden" }}>
          <div
            className={
              "flex flex-col items-center overflow-hidden " +
              (contentWrapperClassName ?? "bg-texture")
            }
          >
            <DesktopSidebars
              flowersClassName={sidebars.flowersClassName}
              textClassName={sidebars.textClassName}
            />

            <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
              {children({ isEnvelopeOpened })}
            </div>
          </div>
        </div>
      </FamilyProvider>
    </FrontLayout>
  );
}
