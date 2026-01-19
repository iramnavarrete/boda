import {
  Users,
  ArrowRight,
  Heart,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";
import Header from "./Header";
import Link from "next/link";

export const InvitationDashboard = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        {/* Sección de Bienvenida */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800 mb-1">
              Resumen del Evento
            </h1>
            <p className="text-stone-500">
              Última actualización: hace 5 minutos
            </p>
          </div>
          <Link
            href={`/admin/invitations/${invitationId}`}
            className="bg-[#C5A669] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#C5A669]/20 hover:bg-[#B39358] transition-all flex items-center gap-2 font-medium"
          >
            <Users size={18} />
            Gestionar Invitados
          </Link>
        </div>

        {/* KPIs / Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Invitados"
            value="250"
            icon={<Users className="text-blue-500" />}
            bg="bg-blue-50"
            trend="+5 nuevos hoy"
          />
          <StatCard
            title="Confirmados"
            value="120"
            icon={<CheckCircle2 className="text-green-600" />}
            bg="bg-green-50"
            trend="48% del total"
          />
          <StatCard
            title="Pendientes"
            value="130"
            icon={<Clock className="text-yellow-600" />}
            bg="bg-yellow-50"
            trend="Acción requerida"
          />
        </div>

        {/* Sección Dividida: Actividad y Accesos Rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed de Actividad */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-[#C5A669]" size={20} />
              <h2 className="text-lg font-bold text-stone-800">
                Actividad Reciente
              </h2>
            </div>

            <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:h-full before:w-px before:bg-stone-100">
              <ActivityItem
                initials="JP"
                text={
                  <>
                    <strong>Juan Pérez</strong> confirmó asistencia para{" "}
                    <strong>2 personas</strong>
                  </>
                }
                time="Hace 10 min"
                type="success"
              />
              <ActivityItem
                initials="ML"
                text={
                  <>
                    <strong>María López</strong> vio la invitación
                  </>
                }
                time="Hace 1 hora"
                type="neutral"
              />
              <ActivityItem
                initials="CR"
                text={
                  <>
                    <strong>Carlos Ruiz</strong> declinó la invitación
                  </>
                }
                time="Hace 3 horas"
                type="danger"
              />
            </div>
          </div>

          {/* Accesos Rápidos / Detalles */}
          <div className="space-y-6">
            <div className="bg-[#2C2C29] text-stone-300 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart size={100} />
              </div>
              <h3 className="text-white font-serif text-lg mb-4 relative z-10">
                Estado de la Cuenta
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-sm">
                  <span>Plan</span>
                  <span className="text-white font-medium">Premium Boda</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expiración</span>
                  <span className="text-white font-medium">Nov 2025</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <button className="text-[#C5A669] text-sm hover:text-white transition-colors flex items-center gap-1">
                  Ver configuración <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTES DE UI ---

const StatCard = ({ title, value, icon, bg, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-stone-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-stone-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
    </div>
    <div className="flex items-center gap-1 text-xs font-medium text-stone-400 bg-stone-50 inline-block px-2 py-1 rounded-md">
      <TrendingUp size={12} /> {trend}
    </div>
  </div>
);

const ActivityItem = ({ initials, text, time, type }: any) => {
  let colorClass = "bg-stone-100 text-stone-600";
  if (type === "success") colorClass = "bg-green-100 text-green-700";
  if (type === "danger") colorClass = "bg-red-100 text-red-700";

  return (
    <div className="flex gap-4 relative">
      <div
        className={`w-6 h-6 shrink-0 rounded-full border-2 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold ${colorClass}`}
      >
        {initials}
      </div>
      <div className="pb-1">
        <p className="text-sm text-stone-700">{text}</p>
        <p className="text-xs text-stone-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
};
