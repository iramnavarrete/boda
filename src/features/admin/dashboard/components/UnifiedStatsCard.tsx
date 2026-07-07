import React, { useState, useMemo } from "react";
import {
  PieChart,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Mail,
  Armchair,
  LayoutTemplate,
  AlertTriangle,
} from "lucide-react";
import theme from "@/utils/theme";
import DashboardCard from "./DashboardCard";
import AnimatedDonutChart from "./AnimatedDonutChart";
import StatRow from "./StatRow";
import { EventStats } from "../../hooks/useEventStats";

type TabType = "invitados" | "familias" | "logistica";

interface ChartDataSlice {
  label: string;
  value: number;
  color: string;
}

interface UnifiedStatsCardProps {
  stats: EventStats;
}

const UnifiedStatsCard: React.FC<UnifiedStatsCardProps> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<TabType>("invitados");

  const tabs: { id: TabType; label: string }[] = [
    { id: "invitados", label: "Invitados" },
    { id: "familias", label: "Familias" },
    { id: "logistica", label: "Logística" },
  ];

  const chartData = useMemo<ChartDataSlice[]>(() => {
    switch (activeTab) {
      case "invitados":
        return [
          {
            label: "Confirmados",
            value: stats.invitados.confirmados,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Pendientes",
            value: stats.invitados.pendientes,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Rechazados",
            value: stats.invitados.rechazados,
            color: theme.colors.danger.DEFAULT,
          },
        ];
      case "familias":
        return [
          {
            label: "Completas",
            value: stats.familias.completas,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Parciales",
            value: stats.familias.parciales,
            color: theme.colors.blue[500],
          },
          {
            label: "Sin Responder",
            value: stats.familias.sinResponder,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Declinadas",
            value: stats.familias.rechazadas,
            color: theme.colors.danger.DEFAULT,
          },
        ];
      case "logistica":
        return [
          {
            label: "Ocupados",
            value: Math.max(
              0,
              stats.logistica.asientosOcupados -
                stats.logistica.asientosAtencion,
            ),
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Libres",
            value: stats.logistica.asientosDisponibles,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Por Liberar",
            value: stats.logistica.asientosAtencion,
            color: "#d97706",
          },
        ];
      default:
        return [];
    }
  }, [activeTab, stats]);

  const totalNumber = useMemo(() => {
    switch (activeTab) {
      case "invitados":
        return stats.invitados.total;
      case "familias":
        return stats.familias.total;
      case "logistica":
        return stats.logistica.asientosTotal;
      default:
        return 0;
    }
  }, [activeTab, stats]);

  const centerLabel = activeTab === "logistica" ? "ASIENTOS" : "TOTAL";

  const renderTabsList = (className: string) => (
    <div className={className}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === tab.id
              ? "bg-white text-[#2C3627] shadow-sm"
              : "text-[#A8A29E] hover:text-[#5A5A5A]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardCard
      icon={PieChart}
      title="Métricas del Evento"
      className="h-full flex flex-col"
      subtitle="Análisis detallado"
      headerRight={renderTabsList(
        "hidden md:flex bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] p-1",
      )}
    >
      <div className="w-full flex md:hidden justify-center mb-5 shrink-0">
        {renderTabsList(
          "flex w-full sm:w-auto bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] p-1",
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 flex-1 min-h-0 w-full">
        {/* Gráfico a la izquierda */}
        <div className="w-full lg:w-[30%] flex justify-center shrink-0 py-2">
          <AnimatedDonutChart
            data={chartData}
            total={totalNumber}
            centerNumber={totalNumber}
            centerLabel={centerLabel}
            size={190}
          />
        </div>

        {/* Lista de Datos a la derecha */}
        <div className="w-full lg:w-[70%] flex flex-col justify-center gap-3 flex-1">
          {/* ==============================================
              SECCIÓN INVITADOS
          ============================================== */}
          {activeTab === "invitados" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-300">
              <StatRow
                icon={CheckCircle2}
                label="Confirmados"
                value={stats.invitados.confirmados}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Clock}
                label="En espera"
                value={stats.invitados.pendientes}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />
              <StatRow
                icon={XCircle}
                label="Rechazados"
                value={stats.invitados.rechazados}
                colorClass="text-[#853935]"
                isWarning={true}
                showBorder={false}
              />
            </div>
          )}

          {/* ==============================================
              SECCIÓN FAMILIAS
          ============================================== */}
          {activeTab === "familias" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <StatRow
                    icon={CheckCircle2}
                    label="Completas"
                    value={stats.familias.completas}
                    colorClass="text-[#2C3627]"
                    showBorder={false}
                  />
                <StatRow
                  icon={Users}
                  label="Parciales"
                  value={stats.familias.parciales}
                  colorClass="text-[#60a5fa]"
                  showBorder={false}
                />
                <StatRow
                  icon={XCircle}
                  label="Declinadas"
                  value={stats.familias.rechazadas}
                  colorClass="text-[#853935]"
                  isWarning={true}
                  showBorder={false}
                />
                <StatRow
                  icon={Clock}
                  label="Sin Responder"
                  value={stats.familias.sinResponder}
                  colorClass="text-[#C5A669]"
                  showBorder={false}
                />
              </div>

              {/* 🔥 Sub-alerta informativa que explica claramente la intersección */}
              {stats.familias.sinAbrir > 0 && (
                <div className="bg-[#F9F7F2] border border-[#EBE5DA] p-3 rounded-2xl flex items-start gap-2.5 shadow-sm mt-1">
                  <Mail size={14} className="text-[#A8A29E] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#5A5A5A] leading-relaxed">
                    De las familias sin responder, hay{" "}
                    <strong className="text-[#2C2C29]">
                      {stats.familias.sinAbrir}
                    </strong>{" "}
                    que aún no abren su invitación.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              SECCIÓN LOGÍSTICA
          ============================================== */}
          {activeTab === "logistica" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              {(stats.logistica.invitadosSinAsignar > 0 ||
                stats.logistica.asientosAtencion > 0) && (
                <div className="bg-orange-50 border border-orange-100/50 p-3 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-orange-600 px-1">
                    <AlertTriangle size={12} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Atención Requerida
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stats.logistica.invitadosSinAsignar > 0 && (
                      <StatRow
                        icon={Users}
                        label="Sin mesa asignada"
                        value={stats.logistica.invitadosSinAsignar}
                        colorClass="text-[#d97706]"
                        isWarning={true}
                        showBorder={false}
                      />
                    )}
                    {stats.logistica.asientosAtencion > 0 && (
                      <StatRow
                        icon={AlertTriangle}
                        label="Lugares por liberar"
                        value={stats.logistica.asientosAtencion}
                        isWarning={true}
                        showBorder={false}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* MÉTRICAS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <StatRow
                  icon={Users}
                  label="Asientos Ocupados"
                  value={stats.logistica.asientosOcupados}
                  colorClass="text-[#2C3627]"
                  showBorder={false}
                />
                <StatRow
                  icon={Armchair}
                  label="Asientos Libres"
                  value={stats.logistica.asientosDisponibles}
                  colorClass="text-[#C5A669]"
                  showBorder={false}
                />
                <StatRow
                  icon={LayoutTemplate}
                  label="Mesas Llenas"
                  value={stats.logistica.mesasLlenas}
                  colorClass="text-[#2C3627]"
                  showBorder={false}
                />
                <StatRow
                  icon={LayoutTemplate}
                  label="Mesas Incompletas"
                  value={stats.logistica.mesasIncompletas}
                  colorClass="text-[#C5A669]"
                  showBorder={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default React.memo(UnifiedStatsCard);
