"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Heart,
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  PieChart,
  ChevronRight,
  MessageCircle,
  ChevronLeft,
  Quote,
} from "lucide-react";
import Link from "next/link";
import theme from "@/utils/theme";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import { useToast } from "@/features/shared/components/Toast";
import { useGuestsData } from "../hooks/useGuestData";
import { useGuestsStats } from "../hooks/useGuestsStats";
import Loader from "@/features/front/components/Loader";
import Header from "@/features/shared/components/Header";

const useMessages = () => [
  {
    id: 1,
    author: "Tía Carmen",
    text: "¡Muchísimas felicidades! Estamos ansiosos por compartir este día tan especial con ustedes. ¡Que viva el amor!",
    time: "Hace 2 hrs",
  },
  {
    id: 2,
    author: "Los Ramírez",
    text: "Gracias por la invitación. Ahí estaremos sin falta para celebrar su unión.",
    time: "Ayer",
  },
  {
    id: 3,
    author: "Jorge y Ana",
    text: "¡Qué emoción! Ya tenemos listos los boletos de avión. Nos vemos pronto.",
    time: "Hace 2 días",
  },
];

// --- COMPONENTE CARRUSEL ---

const MessagesCarousel = () => {
  const messages = useMessages();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  const currentMessage = messages[currentIndex];

  return (
    <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm flex flex-col h-full hover:shadow-[0_8px_30px_rgb(197,166,105,0.1)] transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sand-light rounded-lg text-gold border border-sand">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-600 leading-none">
              Felicitaciones
            </h3>
            <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">
              Muro de deseos
            </p>
          </div>
        </div>
        <Link
          href="/admin/invitations/inv-123/messages"
          className="text-xs font-medium text-gold hover:text-stone-600 transition-colors flex items-center gap-1"
        >
          Ver todos <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 min-h-[160px]">
        <div className="absolute top-0 left-0 text-gold/10">
          <Quote size={40} className="transform rotate-180" />
        </div>
        <div
          className="px-4 animate-in fade-in slide-in-from-right-4 duration-300 w-full"
          key={currentIndex}
        >
          <p className="text-stone-600 font-serif text-lg italic leading-relaxed mb-4 line-clamp-3">
            "{currentMessage.text}"
          </p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold text-stone-700 bg-sand-light px-3 py-1 rounded-full">
              {currentMessage.author}
            </span>
            <span className="text-[10px] text-stone-400 mt-1">
              {currentMessage.time}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-sand-light relative z-10">
        <div className="flex gap-1">
          {messages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-gold" : "w-1.5 bg-sand"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full border border-sand text-stone-400 hover:text-gold hover:border-gold hover:bg-sand-light transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full border border-sand text-stone-400 hover:text-gold hover:border-gold hover:bg-sand-light transition-all active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gold-10 rounded-tl-full opacity-30 pointer-events-none" />
    </div>
  );
};

const GuestStatsPieChart = ({ stats }: { stats: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AQUÍ usamos los colores importados directamente, sin usar resolveConfig
  const data = useMemo(
    () => [
      {
        label: "Confirmados",
        value: stats.confirmed,
        color: theme.colors.status.confirmed,
      },
      {
        label: "Pendientes",
        value: stats.pending,
        color: theme.colors.status.pending,
      },
      {
        label: "Rechazados",
        value: stats.rejected,
        color: theme.colors.status.rejected,
      },
    ],
    [stats],
  );

  const total = stats.total || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 200;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    let animationFrameId: number;
    let progress = 0;

    const draw = () => {
      const ease = 1 - Math.pow(1 - progress, 3);
      ctx.clearRect(0, 0, size, size);
      let startAngle = -0.5 * Math.PI;

      data.forEach((slice) => {
        const sliceAngle = (slice.value / total) * (2 * Math.PI);
        const animatedSliceAngle = sliceAngle * ease;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          startAngle,
          startAngle + animatedSliceAngle,
        );
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();

        if (slice.value > 0) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = theme.colors.white;
          ctx.stroke();
        }

        startAngle += sliceAngle;
      });

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.65, 0, 2 * Math.PI);
      ctx.fillStyle = theme.colors.white;
      ctx.fill();

      ctx.fillStyle = theme.colors.stone[600];
      ctx.font = "bold 28px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stats.total.toString(), centerX, centerY - 8);

      ctx.fillStyle = theme.colors.stone[400];
      ctx.font = "10px sans-serif";
      ctx.fillText("TOTAL", centerX, centerY + 18);

      if (progress < 1) {
        progress += 0.02;
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [data, stats.total]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm flex flex-col md:flex-row items-center gap-6 w-full hover:shadow-[0_8px_30px_rgb(197,166,105,0.1)] transition-all duration-300 h-full">
      <div className="relative flex-shrink-0 flex items-center justify-center p-2">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Resumen
            </p>
            <h3 className="font-serif text-lg font-bold text-stone-600">
              Estatus Asistencia
            </h3>
          </div>
          <div className="p-2 bg-sand-light rounded-xl text-gold border border-sand">
            <PieChart size={18} />
          </div>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={index}
                className="group flex items-center justify-between p-2 hover:bg-sand-light rounded-lg transition-colors cursor-default border border-transparent hover:border-sand"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-stone-600">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden xl:block text-[10px] text-stone-400 font-medium bg-white px-1.5 py-0.5 rounded border border-sand">
                    {percentage}%
                  </span>
                  <span className="text-sm font-bold text-stone-600 w-6 text-right font-serif">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-sand flex items-center gap-2 text-stone-400">
          <TrendingUp size={14} />
          <p className="text-[10px]">
            <strong>{Math.round((stats.confirmed / total) * 100)}%</strong>{" "}
            confirmados.
          </p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ initials, text, time, type }: any) => {
  let colorClass = "bg-stone-100 text-stone-600 border-stone-200";
  if (type === "success")
    colorClass = "bg-green-50 text-green-700 border-green-200";
  if (type === "danger") colorClass = "bg-red-50 text-red-700 border-red-200";
  if (type === "neutral")
    colorClass = "bg-sand-light text-stone-400 border-sand";

  return (
    <div className="flex gap-4 relative group">
      <div
        className={`w-9 h-9 shrink-0 rounded-full border shadow-sm z-10 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${colorClass}`}
      >
        {initials}
      </div>
      <div className="pb-1 pt-1">
        <p className="text-sm text-stone-600 leading-tight">{text}</p>
        <p className="text-[10px] text-stone-400 mt-1 font-medium uppercase tracking-wide">
          {time}
        </p>
      </div>
    </div>
  );
};

export default function InvitationDashboard({
  invitationId,
}: {
  invitationId: string;
}) {
  const user = useAuthUser();
  const { toast } = useToast();

  const { guests, isLoadingGuests, error } = useGuestsData(invitationId, user);
  const stats = useGuestsStats(guests);

  if (isLoadingGuests) return <Loader fullscreen />;
  if (error) toast("Ocurrió un error", "error");

  return (
    <div className="min-h-screen bg-paper font-sans text-stone-600">
      <Header />

      <main className="max-w-6xl mx-auto p-4 md:px-6 py-4 md:py-10 space-y-6 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border border-sand shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-serif text-stone-600 mb-2">
              Resumen del Evento
            </h1>
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <Clock size={14} />
              <span>Última actualización: hace un momento</span>
            </div>
          </div>

          <Link
            href={`/admin/invitations/${invitationId}`}
            className="relative z-10 bg-gold text-white px-8 py-3.5 rounded-xl shadow-[0_10px_20px_-10px_rgba(197,166,105,0.5)] hover:bg-gold-600 hover:shadow-[0_15px_30px_-10px_rgba(197,166,105,0.6)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 font-medium group"
          >
            <Users
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            Gestionar invitados
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <MessagesCarousel />
          <GuestStatsPieChart stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-sand p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-sand-light">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sand-light rounded-lg border border-sand text-gold">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-stone-600">
                  Actividad Reciente
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium px-3 py-1 bg-sand-light rounded-full border border-sand">
                Hoy
              </span>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[35px] before:top-24 before:bottom-10 before:w-px before:bg-sand before:border-l before:border-dashed before:border-gold/30">
              <ActivityItem
                initials={<CheckCircle2 size={16} />}
                text={
                  <>
                    <strong>Familia González</strong> confirmó asistencia
                  </>
                }
                time="Hace 10 min"
                type="success"
              />
              <ActivityItem
                initials={<Clock size={16} />}
                text={
                  <>
                    <strong>María López</strong> vio la invitación
                  </>
                }
                time="Hace 1 hora"
                type="neutral"
              />
              <ActivityItem
                initials={<XCircle size={16} />}
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

          <div className="bg-[#2C2C29] rounded-3xl p-8 shadow-xl relative overflow-hidden text-sand">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Heart size={120} />
            </div>
            <h3 className="text-white font-serif text-xl mb-6 relative z-10 border-b border-white/10 pb-4">
              Detalles del Evento
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <Calendar size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">
                    Fecha
                  </p>
                  <p className="text-white font-medium">Sábado, 22 Oct 2025</p>
                  <p className="text-xs text-white/50">18:00 hrs</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">
                    Lugar
                  </p>
                  <p className="text-white font-medium">
                    Hacienda Los Arcángeles
                  </p>
                  <p className="text-xs text-white/50">
                    San Miguel de Allende, Gto.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2">
                <button className="w-full py-3 rounded-xl border border-gold/30 text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2">
                  Editar Detalles <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
