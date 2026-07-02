import React, { useState, useMemo } from "react";
import { PieChart, CheckCircle2, Clock, XCircle, Users, Mail, Armchair, LayoutTemplate, AlertTriangle } from "lucide-react";
import theme from "@/utils/theme";
import DashboardCard from "./DashboardCard";
import AnimatedDonutChart from "./AnimatedDonutChart";
import StatRow from "./StatRow";

const MOCK_STATS = {
  invitados: {
    total: 154,
    confirmados: 120,
    pendientes: 29,
    rechazados: 5,
  },
  familias: {
    total: 80,
    completas: 41,
    parciales: 12,
    sinResponder: 25,
    sinAbrir: 2,
  },
  logistica: {
    mesasTotal: 15,
    mesasLlenas: 10,
    mesasIncompletas: 5,
    asientosTotal: 150,
    asientosOcupados: 100,
    asientosDisponibles: 50,
    asientosAtencion: 3,
  },
};

type TabType = "invitados" | "familias" | "logistica";

interface ChartDataSlice {
  label: string;
  value: number;
  color: string;
}

const UnifiedStatsCard: React.FC = () => {
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
            value: MOCK_STATS.invitados.confirmados,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Pendientes",
            value: MOCK_STATS.invitados.pendientes,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Rechazados",
            value: MOCK_STATS.invitados.rechazados,
            color: theme.colors.danger.DEFAULT,
          },
        ];
      case "familias":
        return [
          {
            label: "Completas",
            value: MOCK_STATS.familias.completas,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Parciales",
            value: MOCK_STATS.familias.parciales,
            color: theme.colors.blue[500],
          },
          {
            label: "Pendientes",
            value: MOCK_STATS.familias.sinResponder,
            color: theme.colors.gold.DEFAULT,
          },
          {
            label: "Sin Abrir",
            value: MOCK_STATS.familias.sinAbrir,
            color: theme.colors.stone[500],
          },
        ];
      case "logistica":
        return [
          {
            label: "Ocupados",
            value: MOCK_STATS.logistica.asientosOcupados,
            color: theme.colors.primary.DEFAULT,
          },
          {
            label: "Disponibles",
            value: MOCK_STATS.logistica.asientosDisponibles,
            color: theme.colors.gold.DEFAULT,
          },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  const totalNumber = useMemo(() => {
    switch (activeTab) {
      case "invitados":
        return MOCK_STATS.invitados.total;
      case "familias":
        return MOCK_STATS.familias.total;
      case "logistica":
        return MOCK_STATS.logistica.asientosTotal;
      default:
        return 0;
    }
  }, [activeTab]);

  const centerLabel = activeTab === "logistica" ? "ASIENTOS" : "TOTAL";

  return (
    <DashboardCard
      icon={PieChart}
      title="Métricas del Evento"
      subtitle="Análisis detallado"
      className="h-full"
      headerRight={
        <div className="flex bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] p-1">
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
                value={MOCK_STATS.invitados.confirmados}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Clock}
                label="En espera de respuesta"
                value={MOCK_STATS.invitados.pendientes}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />
              <StatRow
                icon={XCircle}
                label="Total Rechazados"
                value={MOCK_STATS.invitados.rechazados}
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
                value={MOCK_STATS.familias.completas}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Users}
                label="Confirmación Parcial"
                value={MOCK_STATS.familias.parciales}
                colorClass="text-[#60a5fa]"
                showBorder={false}
              />
              <StatRow
                icon={Clock}
                label="Sin Responder"
                value={MOCK_STATS.familias.sinResponder}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />
              <StatRow
                icon={Mail}
                label="Sin Abrir Invitación"
                value={MOCK_STATS.familias.sinAbrir}
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
                value={MOCK_STATS.logistica.asientosOcupados}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={Armchair}
                label="Asientos Disponibles"
                value={MOCK_STATS.logistica.asientosDisponibles}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />
              <StatRow
                icon={LayoutTemplate}
                label="Mesas Llenas"
                value={MOCK_STATS.logistica.mesasLlenas}
                colorClass="text-[#2C3627]"
                showBorder={false}
              />
              <StatRow
                icon={LayoutTemplate}
                label="Mesas Incompletas"
                value={MOCK_STATS.logistica.mesasIncompletas}
                colorClass="text-[#C5A669]"
                showBorder={false}
              />

              <div className="sm:col-span-2 mt-2">
                <StatRow
                  icon={AlertTriangle}
                  label="Asientos declinados que requieren liberación"
                  value={MOCK_STATS.logistica.asientosAtencion}
                  isWarning={true}
                  showBorder={false}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default React.memo(UnifiedStatsCard);
