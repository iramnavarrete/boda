import { ArrowLeft, Home, Mail, MessageCircle } from "lucide-react";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import TextureButton from "@/features/shared/components/TextureButton";
import JnInvitacionesIcon from "@/icons/jn-invitaciones-icon";

// Número de contacto de JN Invitaciones (mismo que se usa en el Footer público
// y en la landing).
const WHATSAPP_CONTACT_URL =
  "https://wa.me/+526148750265?text=" +
  encodeURIComponent(
    "Hola, necesito ayuda con una página que no encuentro en el panel de JN Invitaciones.",
  );

// Colores institucionales extraídos del theme para reutilizar el logo.
const PRIMARY = "#58624F";
const GOLD_500 = "#C5A669";

export default function Custom404() {
  const router = useRouter();

  // `window.history.length` siempre es >= 1 (la página actual). Si hay
  // entradas adicionales significa que el usuario navegó desde otra URL
  // dentro del sitio y podemos mandarlo de vuelta con `router.back()`. Si
  // solo hay 1 entrada, llegó directo a la 404 (link compartido, refresh,
  // etc.) y no hay a dónde "volver", así que lo mandamos al inicio.
  //
  // Usamos `useSyncExternalStore` en lugar de `useState` + `useEffect`:
  //   • Lee `window.history` en el cliente sin causar flash de contenido
  //     (SSR devuelve `false`, el cliente actualiza sincrónicamente).
  //   • Evita el warning de eslint "calling setState during render" y el
  //     re-render extra que produce `useEffect`.
  //   • Es la forma idiomática en React 19 para leer valores del browser.
  const hasHistory = useSyncExternalStore(
    // No necesitamos suscribirnos a cambios (history no cambia durante la
    // vida útil de esta página). Devolvemos un no-op unsubscribe.
    () => () => {},
    // Snapshot en cliente: ¿hay historial al que volver?
    () =>
      typeof window !== "undefined" && window.history.length > 1,
    // Snapshot en SSR: siempre false para que el HTML inicial sea estable.
    () => false,
  );

  const handleNavigation = () => {
    if (hasHistory) {
      router.back();
      return;
    }
    if (router.asPath.includes("/admin")) {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1] font-sans relative overflow-hidden flex flex-col">
      {/* Textura de fondo (mismo patrón que el resto de páginas públicas) */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" />

      {/* ─── Header con logo ───────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-center py-5 md:py-6 border-b border-sand-200 bg-white/70 backdrop-blur-sm">
        <JnInvitacionesIcon
          primaryColor={PRIMARY}
          secondaryColor={GOLD_500}
          onClick={() => router.replace("/")}
          className="h-7 md:h-8 w-auto cursor-pointer"
        />
      </header>

      {/* ─── Contenido principal ───────────────────────────────────────── */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-6 py-10 md:py-16 lg:py-20">
        <div className="max-w-6xl md:max-w-4xl sm:max-w-xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Columna izquierda: texto + CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
            <h1 className="font-serif text-[5.5rem] sm:text-[7rem] md:text-[8rem] lg:text-[9rem] text-charcoal-800 leading-none tracking-tight">
              404
            </h1>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-charcoal-800 mt-3 md:mt-4">
              Página no encontrada
            </h2>

            {/* Divisor decorativo */}
            <div
              className="flex items-center justify-center md:justify-start gap-3 my-5 md:my-6"
              aria-hidden="true"
            >
              <div className="h-px w-10 md:w-14 bg-gold-300" />
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-gold-500"
              >
                <path
                  d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z"
                  fill="currentColor"
                />
              </svg>
              <div className="h-px w-10 md:w-14 bg-gold-300" />
            </div>

            <p className="text-stone-custom text-base leading-relaxed max-w-md">
              La página que buscas no existe o ha sido movida.
              <br className="hidden sm:block" />
              Verifica la URL o regresa al panel de control.
            </p>

            <div className="mt-7 md:mt-8">
              <TextureButton
                icon={hasHistory ? <ArrowLeft size={16} /> : <Home size={16} />}
                onClick={handleNavigation}
                className="px-8 py-3.5 rounded-full font-bold tracking-widest uppercase text-xs"
              >
                {hasHistory ? "Volver atrás" : "Ir al inicio"}
              </TextureButton>
            </div>
          </div>

          {/* Columna derecha: ilustración */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <Image
              src="/img/page-not-found.webp"
              alt="Página no encontrada"
              width={720}
              height={900}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto select-none pointer-events-none"
              draggable={false}
              priority
            />
          </div>
        </div>
      </main>

      {/* ─── Footer: card de ayuda ─────────────────────────────────────── */}
      <footer className="relative z-10 px-4 sm:px-6 pb-6 md:pb-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-sand-200 p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 shadow-[0_4px_20px_rgba(44,44,41,0.04)]">
          <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
            <div className="w-12 h-12 shrink-0 bg-paper rounded-full flex items-center justify-center text-gold-500 border border-gold-100">
              <MessageCircle size={20} />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-base md:text-lg text-charcoal-800 font-bold leading-tight">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-stone-custom text-sm leading-snug">
                Contáctanos y con gusto te ayudamos.
              </p>
            </div>
          </div>
          <TextureButton
            primary={false}
            icon={<Mail size={14} />}
            onClick={() =>
              typeof window !== "undefined" &&
              window.open(WHATSAPP_CONTACT_URL, "_blank", "noopener,noreferrer")
            }
            className="px-6 py-3 rounded-full font-bold tracking-widest uppercase text-xs whitespace-nowrap w-full sm:w-auto"
          >
            Contactar soporte
          </TextureButton>
        </div>
      </footer>
    </div>
  );
}
