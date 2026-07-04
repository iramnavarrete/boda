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
            label: "Declinadas",
            value: stats.familias.rechazadas,
            color: theme.colors.danger.DEFAULT,
          },
          {
            label: "Pendientes",
            value: stats.familias.sinResponder,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Sin Abrir",
            value: stats.familias.sinAbrir,
            color: theme.colors.stone[500],
          },
        ];
      case "logistica":
        return [
          {
            label: "Ocupados",
            value: stats.logistica.asientosOcupados,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Disponibles",
            value: stats.logistica.asientosDisponibles,
            color: theme.colors.gold.DEFAULT,
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

  return (
    <DashboardCard
      icon={PieChart}
      title="Métricas del Evento"
      className="h-full"
      subtitle="Análisis detallado"
      headerRight={
        <div className="hidden md:flex bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#2C3627] shadow-sm"
                  : "text-[#A8A29E] hover:text-[#5A5A5A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="w-full flex md:hidden justify-center mb-8 shrink-0">
        <div className="flex w-full sm:w-auto bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] p-1">
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
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 h-full">
        {/* Gráfico a la izquierda */}
        <div className="w-full lg:w-[45%] flex justify-center py-4">
          <AnimatedDonutChart
            data={chartData}
            total={totalNumber}
            centerNumber={totalNumber}
            centerLabel={centerLabel}
            size={220}
          />
        </div>

        {/* Lista en Vertical a la derecha */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center gap-1">
          {activeTab === "invitados" && (
            <>
              <StatRow
                icon={CheckCircle2}
                label="Total Confirmados"
                value={stats.invitados.confirmados}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Clock}
                label="En espera de respuesta"
                value={stats.invitados.pendientes}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />
              <StatRow
                icon={XCircle}
                label="Total Rechazados"
                value={stats.invitados.rechazados}
                colorClass="text-[#853935]"
                isWarning={true}
                showBorder={false}
              />
            </>
          )}

          {activeTab === "familias" && (
            <>
              <StatRow
                icon={CheckCircle2}
                label="Asistencia al 100%"
                value={stats.familias.completas}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Users}
                label="Confirmación Parcial"
                value={stats.familias.parciales}
                colorClass="text-[#60a5fa]"
                showBorder={false}
              />
              <StatRow
                icon={XCircle}
                label="Familias Declinadas"
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
              <StatRow
                icon={Mail}
                label="Sin Abrir Invitación"
                value={stats.familias.sinAbrir}
                colorClass="text-[#A8A29E]"
                showBorder={false}
              />
            </>
          )}

          {activeTab === "logistica" && (
            <>
              <StatRow
                icon={CheckCircle2}
                label="Asientos Ocupados"
                value={stats.logistica.asientosOcupados}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Armchair}
                label="Asientos Disponibles"
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

              {stats.logistica.asientosAtencion > 0 && (
                <div className="sm:col-span-2 mt-2">
                  <StatRow
                    icon={AlertTriangle}
                    label="Asientos declinados que requieren liberación"
                    value={stats.logistica.asientosAtencion}
                    isWarning={true}
                    showBorder={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default React.memo(UnifiedStatsCard);
