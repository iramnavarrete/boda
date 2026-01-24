import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// TODO Mover esto al AuthService
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { AuthService } from "@/services/authService";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/features/shared/components/Toast";
import dynamic from "next/dynamic";
import { LottieRefCurrentProps } from "lottie-react";
import { useInView } from "framer-motion";
import animationData from "../../lottie/logojn.json";
import GoogleIcon from "@/icons/google-icon";
import EnvelopeIcon from "@/icons/envelope-icon";
import LoginFlowersIcon from "@/icons/login-flowers-icon";
import Loader from "@/features/front/components/Loader";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="h-14 w-14 bg-[#fefefe]" />,
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const playerRef = useRef<LottieRefCurrentProps>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(divRef);

  // Verificar sesión iniciada
  useEffect(() => {
    const unsubscribe = AuthService.onUserChange((user) => {
      if (user) {
        router.replace("/admin");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const animation = async () => {
      const player = playerRef.current;

      if (!player) return;

      if (isInView) {
        player.goToAndStop(30, true);
        await new Promise((res) => setTimeout(res, 500)); // espera a que termine la animación más 200 de delay
        player.goToAndPlay(30, true);
      } else {
        player.stop();
      }
    };
    animation();
  }, [isInView]);

  // Handlers
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Por favor ingresa tus credenciales", "error");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = "Error al iniciar sesión";
      if (error.code === "auth/invalid-credential")
        msg = "Credenciales incorrectas";
      toast(msg, "error");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast("No se pudo conectar con Google", "error");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <Loader fullscreen />;
  }

  return (
    <div className="min-h-screen w-full bg-paper flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Textura de papel (Patrón SVG sutil) */}
      <svg
        className="absolute inset-0 w-screen h-screen opacity-30 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Decoración Floral: Esquina Superior Izquierda */}
      <LoginFlowersIcon className="absolute top-0 left-0 w-64 h-64 text-gold/20 pointer-events-none -translate-x-10 -translate-y-10" />

      {/* Decoración Floral: Esquina Inferior Derecha (Rotada) */}
      <LoginFlowersIcon className="absolute bottom-0 right-0 w-64 h-64 text-gold/20 pointer-events-none translate-x-10 translate-y-10 rotate-180" />

      {/* --- TARJETA PRINCIPAL --- */}
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-[900px] rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in duration-500">
        {/* LADO IZQUIERDO: DECORACIÓN */}
        <div className="hidden md:flex flex-col justify-center items-center w-5/12 bg-paper p-10 text-center border-r border-[#E8E0D5]">
          <div className="mb-6 relative">
            <div className="w-48 h-48 rounded-full border border-sand-400 flex items-center justify-center bg-white p-6 shadow-sm">
              {/* Icono de Invitación SVG Personalizado */}
              <EnvelopeIcon className="w-24 h-24 text-gold opacity-80" />
            </div>
          </div>
          <h3 className="font-serif text-2xl text-stone-custom mb-2">
            Panel de Control
          </h3>
          <p className="text-sm text-charcoal-400 leading-relaxed">
            Gestiona tu lista de invitados, confirma asistencias y organiza tu
            gran día desde un solo lugar.
          </p>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          {/* LOGO */}
          <div className="text-center mb-10">
            <div
              ref={divRef}
              className="flex justify-center items-center gap-2 mb-3"
            >
              <Lottie
                className=" h-14"
                animationData={animationData}
                lottieRef={playerRef}
                autoPlay={false}
                loop={false}
              />
            </div>
            <p className="text-xs font-medium text-gold uppercase tracking-[0.2em]">
              Administración de Invitados
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="group relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full pl-10 pr-4 py-3.5 bg-paper/30 border border-sand rounded-xl text-stone-700 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder-transparent"
                placeholder="Correo"
                id="email"
              />
              <label
                htmlFor="email"
                className="absolute left-10 -top-2.5 bg-paper/30 px-1 text-xs text-[#9CA3AF] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#9CA3AF] peer-placeholder-shown:top-4 peer-placeholder-shown:left-10 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-gold"
              >
                Correo Electrónico
              </label>
              <Mail
                className="absolute left-4 top-4 text-[#C5C5C5] peer-focus:text-gold transition-colors"
                size={20}
              />
            </div>

            <div className="group relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full pl-10 pr-4 py-3.5 bg-paper/30 border border-sand rounded-xl text-stone-700 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder-transparent"
                placeholder="Contraseña"
                id="password"
              />
              <label
                htmlFor="password"
                className="absolute left-10 -top-2.5 bg-paper/30 px-1 text-xs text-[#9CA3AF] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#9CA3AF] peer-placeholder-shown:top-4 peer-placeholder-shown:left-10 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-gold"
              >
                Contraseña
              </label>
              <Lock
                className="absolute left-4 top-4 text-[#C5C5C5] peer-focus:text-gold transition-colors"
                size={20}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-600 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Iniciar Sesión"
              )}
              {!loading && <ArrowRight size={18} className="opacity-80" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gold">
                O ingresa con
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-stone-600 font-medium py-3 rounded-xl border border-sand hover:bg-paper/30 hover:border-sand-400 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <GoogleIcon className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-xs text-gold">
            © {new Date().getFullYear()} JN INVITACIONES
          </p>
        </div>
      </div>
    </div>
  );
}
