"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  FC,
  Dispatch,
  SetStateAction,
} from "react";
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
  Sparkles,
  Eye,
} from "lucide-react";
import Link from "next/link";
import theme from "@/utils/theme";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import { useToast } from "@/features/shared/components/Toast";
import { useGuestsData } from "../hooks/useGuestData";
import { useGuestsStats } from "../hooks/useGuestsStats";
import Loader from "@/features/front/components/Loader";
import TextureButton from "@/features/shared/components/TextureButton";
import { useRouter } from "next/router";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { GuestQuotesService } from "@/services/guestQuotesService";
import { DashboardStats, GuestActivity, GuestQuote } from "@/types";
import { formatTimeStamp } from "@/utils/formatters";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { ActivityService } from "@/services/activityService";

export const MessagesCarousel: FC = () => {
  const [messages, setMessages] = useState<GuestQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const invitationData = useInvitationStore((state) => state.invitationData);

  // Suscripción a Firestore en tiempo real
  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationData) {
      unsubscribe = GuestQuotesService.subscribeToGuestMessages(
        invitationData.id,
        (allMessages: GuestQuote[]) => {
          // Extraemos solo los primeros 5 mensajes del arreglo ordenado
          const top5Messages = allMessages.slice(0, 5);
          setMessages(top5Messages);
          setIsLoading(false);

          // Si el índice actual quedó fuera de rango tras una actualización, lo reiniciamos
          setCurrentIndex((prev) => {
            if (top5Messages.length === 0) return 0;
            return prev >= top5Messages.length ? 0 : prev;
          });
        },
        (error) => {
          console.error("Error cargando mensajes:", error);
          setIsLoading(false);
        },
      );
    }

    return () => unsubscribe();
  }, [invitationData]);

  const currentMessage = messages[currentIndex];

  // Uso del hook de tiempo (se actualiza cuando cambia el mensaje actual)
  const timeAgoString = useTimeAgo(currentMessage?.fechaModificacion);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);

  return (
    <div className="bg-white/80 p-6 rounded-[24px] border border-sand shadow-sm flex flex-col h-full hover:shadow-[0_8px_30px_rgba(197,166,105,0.1)] transition-all duration-300 relative overflow-hidden group font-sans min-h-[320px]">
      {/* HEADER DEL CARRUSEL */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-paper rounded-lg text-gold border border-sand shadow-sm">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary leading-none">
              Felicitaciones
            </h3>
            <p className="text-[10px] text-charcoal-400 mt-1 uppercase tracking-widest font-bold">
              Muro de deseos
            </p>
          </div>
        </div>
        <Link
          href={`/admin/invitations/${invitationData?.id}/quotes`}
          className="text-xs font-bold text-gold hover:text-primary transition-colors flex items-center gap-1 tracking-wider uppercase"
        >
          Ver Todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* ESTADO DE CARGA */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10 min-h-[160px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold/30 border-t-gold"></div>
        </div>
      ) : messages.length === 0 ? (
        /* ESTADO VACÍO */
        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 min-h-[160px] opacity-70">
          <div className="w-12 h-12 bg-sand-light border border-sand rounded-full flex items-center justify-center mb-3 text-stone-300">
            <MessageCircle size={20} />
          </div>
          <p className="text-sm font-medium text-stone-500">
            Aún no hay mensajes
          </p>
          <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
            Los buenos deseos de tus invitados aparecerán aquí.
          </p>
        </div>
      ) : (
        /* CONTENIDO DEL CARRUSEL */
        <>
          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 min-h-[160px]">
            <div className="absolute top-0 left-0 text-gold/10 pointer-events-none">
              <Quote size={40} className="transform rotate-180" />
            </div>

            <div
              className="px-4 animate-in fade-in slide-in-from-right-4 duration-300 w-full relative pt-8"
              key={currentMessage.id} // Forza re-render de animación al cambiar
            >
              {/* Etiqueta Nuevo (Centrada en la parte superior) */}
              {!currentMessage.leido && (
                <div className="absolute top-0 right-0 flex justify-center">
                  <span className="bg-gold text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pulse">
                    <Sparkles size={10} /> Nuevo
                  </span>
                </div>
              )}

              <p className="text-stone-600 font-serif text-lg md:text-xl italic leading-relaxed mb-6 line-clamp-3">
                {`"${currentMessage.mensaje}"`}
              </p>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-primary bg-paper border border-sand px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  {currentMessage.autor}
                </span>

                <span className="text-[10px] text-stone-400 font-medium capitalize-first mt-1">
                  {timeAgoString || currentMessage.fechaCreacion}
                </span>
              </div>
            </div>
          </div>

          {/* CONTROLES DEL CARRUSEL (Solo si hay más de 1 mensaje) */}
          {messages.length > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-sand relative z-10">
              <div className="flex gap-1.5">
                {messages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-gold"
                        : "w-1.5 bg-stone-200 hover:bg-gold/50"
                    }`}
                    aria-label={`Ir al mensaje ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full border border-sand text-stone-400 hover:text-gold hover:border-gold hover:bg-sand-light transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full border border-sand text-stone-400 hover:text-gold hover:border-gold hover:bg-sand-light transition-all active:scale-95 shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Decoración de Fondo (Esquina inferior derecha) */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gold/5 rounded-tl-full pointer-events-none" />
    </div>
  );
};

const GuestStatsPieChart = ({ stats }: { stats: DashboardStats }) => {
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
        <div className="flex h-full items-center justify-center w-full flex-wrap">
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

const ActivityItem = ({ activity }: { activity: GuestActivity }) => {
  const timeAgo = useTimeAgo(activity.timestamp);

  // Configuramos colores y textos dependiendo del tipo de acción
  let config = {
    icon: <Eye size={16} />,
    text: "vio la invitación",
    bgColor: "bg-stone-100",
    iconColor: "text-stone-500",
  };

  if (activity.action === "confirm") {
    config = {
      icon: <CheckCircle2 size={16} />,
      text: "confirmó asistencia",
      bgColor: "bg-[#E7F3EF]", // Verde suave
      iconColor: "text-[#2D5B4F]",
    };
  } else if (activity.action === "decline") {
    config = {
      icon: <XCircle size={16} />,
      text: "declinó la invitación",
      bgColor: "bg-[#F9EAE9]", // Rojo suave
      iconColor: "text-[#853935]",
    };
  }

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-sand-light rounded-lg transition-colors cursor-default border border-transparent hover:border-sand group">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgColor} ${config.iconColor} shadow-sm border border-black/5 group-hover:scale-110 transition-transform`}
      >
        {config.icon}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm text-stone-600 leading-snug">
          <strong className="text-charcoal-800 font-bold">
            {activity.guestName}
          </strong>{" "}
          {config.text}
        </p>
        <span className="text-[10px] text-stone-400 font-medium capitalize-first mt-1">
          {timeAgo}
        </span>
      </div>
    </div>
  );
};

function RecentActivity({
  setLastActivity,
}: {
  setLastActivity: Dispatch<SetStateAction<GuestActivity | null>>;
}) {
  const [activities, setActivities] = useState<GuestActivity[]>([]);

  const invitationData = useInvitationStore((state) => state.invitationData);

  useEffect(() => {
    if (!invitationData) return;

    // Se suscribe a los últimos 20 eventos
    const unsubscribe = ActivityService.subscribeToRecentActivity(
      invitationData.id,
      20,
      (data) => {
        setLastActivity(data[0] || null);
        setActivities(data);
      },
    );

    return () => unsubscribe();
  }, [invitationData]);

  return (
    <div className="lg:col-span-2 bg-white/80 rounded-2xl shadow-[0_8px_30px_rgba(44,44,41,0.04)] border border-sand-200 p-6 relative overflow-hidden flex flex-col max-h-[420px]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-sand-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FDFBF7] rounded-lg border border-sand-200 text-gold-500">
            <Activity size={18} />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary leading-none">
            Actividad Reciente
          </h2>
        </div>
        <span className="text-[10px] font-bold text-gold-500 bg-[#FDFBF7] border border-sand-200 px-3 py-1 rounded-full uppercase tracking-wider">
          En vivo
        </span>
      </div>

      {/* CONTENEDOR CON SCROLL PARA LOS ITEMS */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 py-10">
            <Activity size={32} className="opacity-20 mb-3" />
            <p className="text-sm">Aún no hay actividad registrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-4">
            {activities.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitationDashboard() {
  const user = useAuthUser();
  const [lastActivity, setLastActivity] = useState<GuestActivity | null>(null);
  const { toast } = useToast();

  const timeAgo = useTimeAgo(lastActivity?.timestamp);

  const router = useRouter();

  const invitationData = useInvitationStore((state) => state.invitationData);

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);

  const stats = useGuestsStats(guests);

  useEffect(() => {
    if (error) {
      if (error === "permission-denied" || error === "unauthenticated") {
        router.replace("/admin/invitations");
      } else {
        toast("Ocurrió un error", "error");
      }
    }
  }, [error, router]);

  if (isLoadingGuests) return <Loader fullscreen />;

  if (error === "permission-denied") return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:px-6 py-4 md:py-10 space-y-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-8 rounded-3xl border border-sand relative overflow-hidden border-white/40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-primary mb-2">
            Resumen del Evento
          </h1>
          {timeAgo && (
            <div className="flex items-center gap-2 text-primary/70 text-sm font-semibold">
              <Clock className="text-gold" size={14} />
              <span>{`Última actualización: ${timeAgo}`}</span>
            </div>
          )}
        </div>
        <TextureButton
          className="relative z-10 text-white font-semibold px-8 py-3.5 rounded-xl"
          icon={<Users size={16} />}
          onClick={() => {
            router.push(`/admin/invitations/${invitationData?.id}`);
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
        <RecentActivity setLastActivity={setLastActivity} />

        <div className="bg-primary-800/85 rounded-2xl p-8 shadow-xl relative overflow-hidden text-paper group">
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
                  {invitationData &&
                    formatTimeStamp(invitationData.fecha)
                      .replaceAll("/", "")
                      .toLocaleLowerCase()}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {invitationData?.recepcion.hora}
                </p>
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
                  {invitationData?.recepcion.nombreSalon || "Salón de eventos"}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {invitationData?.recepcion.direccion || "Salón de eventos"}
                </p>
              </div>
            </div>

            <div>
              <Link
                href={`${router.basePath}/i/${invitationData?.id}`}
                className="w-full py-4 rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
              >
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
    </div>
  );
}
