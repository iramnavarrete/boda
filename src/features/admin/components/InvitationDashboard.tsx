"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  PieChart,
  ChevronRight,
  MessageCircle,
  ChevronLeft,
  Quote,
  Gem,
} from "lucide-react";
import Link from "next/link";
import theme from "@/utils/theme";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import { useToast } from "@/features/shared/components/Toast";
import { useGuestsData } from "../hooks/useGuestData";
import { useGuestsStats } from "../hooks/useGuestsStats";
import Loader from "@/features/front/components/Loader";
import Header from "@/features/shared/components/Header";
import TextureButton from "@/features/shared/components/TextureButton";
import { useRouter } from "next/router";

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
    <div className="bg-white/80 p-6 rounded-2xl border border-sand shadow-sm flex flex-col h-full hover:shadow-[0_8px_30px_rgb(197,166,105,0.1)] transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-paper rounded-lg text-gold border border-sand">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary leading-none">
              Felicitaciones
            </h3>
            <p className="text-[10px] text-charcoal-400 mt-1 uppercase tracking-wider">
              Muro de deseos
            </p>
          </div>
        </div>
        <Link
          href="/admin/invitations/inv-123/messages"
          className="text-xs font-medium text-gold hover:text-primary transition-colors flex items-center gap-1 tracking-wider"
        >
          VER TODOS <ChevronRight size={12} />
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
            <span className="text-xs font-bold text-primary bg-paper border border-[#EBE5DA] px-4 py-1.5 rounded-full uppercase tracking-widest">
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
        color: theme.colors.primary[600],
      },
      {
        label: "Pendientes",
        value: stats.pending,
        color: theme.colors.gold[500],
      },
      {
        label: "Rechazados",
        value: stats.rejected,
        color: theme.colors.danger[500],
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
    <div className="bg-white/80 relative p-6 rounded-2xl border border-sand shadow-sm flex flex-col md:flex-row items-center gap-6 w-full hover:shadow-[0_8px_30px_rgb(197,166,105,0.1)] transition-all duration-300 h-full">
      <div className="flex h-full flex-1 flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-paper rounded-lg text-gold border border-sand">
              <PieChart size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-primary leading-none">
                Estatus asistencia
              </h3>
              <p className="text-[10px] text-charcoal-400 mt-1 uppercase tracking-wider">
                Resumen
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-full items-center justify-center">
          <div className="relative flex-shrink-0 flex items-center justify-center p-2">
            <canvas ref={canvasRef} />
          </div>

          <div className="flex-1 w-full space-y-4">
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
      </div>
    </div>
  );
};

const ActivityItem = ({ initials, text, time, type }: any) => {
  let colorClass = "bg-stone-100 text-stone-600 border-stone-200";
  if (type === "success")
    colorClass = "bg-primary/10 text-primary-500/80 border-primary-500/80";
  if (type === "danger") colorClass = "bg-danger/10 text-danger/80 border-danger/80";
  if (type === "neutral")
    colorClass = "bg-gold/10 text-gold/80 border-gold/80";

  return (
    <div className="flex gap-4 relative">
      <div
        className={`w-9 h-9 shrink-0 rounded-full border shadow-sm z-10 flex items-center justify-center text-xs font-bold transition-transform ${colorClass}`}
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
  const router = useRouter();

  const { guests, isLoadingGuests, error } = useGuestsData(invitationId, user);
  const stats = useGuestsStats(guests);

  if (isLoadingGuests) return <Loader fullscreen />;
  if (error) toast("Ocurrió un error", "error");

  return (
    <div className="min-h-screen bg-paper font-sans text-stone-600 relative ">
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('/img/textures/cream-paper.png')] pointer-events-none"></div>
      <Header />

      <main className="max-w-6xl mx-auto p-4 md:px-6 py-4 md:py-10 space-y-6 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-8 rounded-3xl border border-sand relative overflow-hidden border-white/40 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-primary mb-2">
              Resumen del Evento
            </h1>
            <div className="flex items-center gap-2 text-primary/70 text-sm font-semibold">
              <Clock className="text-gold" size={14} />
              <span>Última actualización: hace un momento</span>
            </div>
          </div>
          <TextureButton
            className="relative z-10 text-white font-semibold px-8 py-3.5 rounded-xl"
            icon={<Users size={16} />}
            onClick={() => {
              const element = document.getElementById("paquetes");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Gestionar invitados
          </TextureButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <MessagesCarousel />
          <GuestStatsPieChart stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 rounded-2xl shadow-sm border border-sand p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand-light">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-paper rounded-lg border border-sand text-gold">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-primary">
                  Actividad Reciente
                </h2>
              </div>
              <span className="text-xs font-medium text-primary bg-paper border border-sand-200 px-4 py-1.5 rounded-full uppercase tracking-wider">
                Hoy
              </span>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 flex-col gap-5 mx-2">
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

          <div className="bg-primary-800/85 rounded-2xl p-8 shadow-xl relative overflow-hidden text-[#F9F7F2] group">
            {/* Decoración Fondo */}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Gem size={140} />
            </div>

            <h3 className="text-white font-serif text-2xl mb-8 relative z-10 border-b border-white/20 pb-4">
              Detalles del Evento
            </h3>

            <div className="space-y-8 relative z-10">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-charcoal/10 rounded-xl border border-white/20 backdrop-blur-sm">
                  <Calendar size={20} className="text-gold" />
                </div>
                <div>
                  <p className="text-[10px] text-gold font-bold uppercase tracking-[0.15em] mb-1">
                    Fecha
                  </p>
                  <p className="text-white font-medium text-lg leading-tight">
                    Sábado, 22 Oct 2025
                  </p>
                  <p className="text-xs text-white/60 mt-1">18:00 hrs</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-3 bg-charcoal/10 rounded-xl border border-white/20 backdrop-blur-sm">
                  <MapPin size={20} className="text-gold" />
                </div>
                <div>
                  <p className="text-[10px] text-gold font-bold uppercase tracking-[0.15em] mb-1">
                    Lugar
                  </p>
                  <p className="text-white font-medium text-lg leading-tight">
                    Hacienda Los Arcángeles
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    San Miguel de Allende, Gto.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link
                 href={`${router.basePath}/${invitationId}`}
                 className="w-full py-4 rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group/btn">
                  Ver invitación{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
