import TextureButton from "@/features/shared/components/TextureButton";
import {
  ExternalLink,
  Heart,
  Infinity,
  PlayCircle,
  Puzzle,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";

function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlaying(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section
      id="demo"
      className="py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <SectionTitle subtitle="Más que una invitación">
          <span className="text-3xl md:text-5xl lg:text-4xl font-serif text-primary leading-tight">
            Lo mismo que el papel...
            <br />
            <span className="text-gold italic">pero con alma propia</span>
          </span>
        </SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">
          {/* COLUMNA IZQUIERDA: VIDEO DEMO */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-end relative">
            <div
              ref={containerRef}
              className="relative z-20 transform transition-all duration-700 cursor-pointer group"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div className="relative mx-auto w-[280px] h-[580px] bg-charcoal-900 rounded-[45px] shadow-[0_30px_60px_-15px_rgba(88,98,79,0.3)] border-[8px] border-charcoal-900 ring-1 ring-black/10">
                <div className="absolute top-24 -left-[10px] w-[3px] h-[32px] bg-charcoal-900 rounded-l-md" />
                <div className="absolute top-36 -left-[10px] w-[3px] h-[50px] bg-charcoal-900 rounded-l-md" />
                <div className="absolute top-36 -right-[10px] w-[3px] h-[80px] bg-charcoal-900 rounded-r-md" />

                <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-black">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-charcoal-900 rounded-b-[16px] z-30 flex justify-center pt-1">
                    <div className="w-12 h-1 rounded-full bg-stone-950" />
                  </div>

                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src="/video/example.mp4"
                      poster="/img/example.jpg"
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20 transition-opacity duration-500 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 text-white shadow-xl animate-pulse">
                        <PlayCircle
                          size={32}
                          fill="currentColor"
                          className="opacity-90"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleRestart}
                      className="absolute bottom-4 left-3 z-30 p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-95"
                      title="Reiniciar video"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-40 pointer-events-none z-40 rounded-[48px]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center mt-16">
              <TextureButton
                className="lg:hidden"
                onClick={() => window.open("https://bodajy.info", "_blank")}
              >
                <div className="flex gap-2">
                  Ver Demo en Vivo <ExternalLink size={16} />
                </div>
              </TextureButton>

              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TEXTO Y VENTAJAS */}
          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="text-stone-500 text-lg font-light leading-relaxed mb-16 max-w-lg">
              Sorprende a tus invitados con una experiencia interactiva
              inolvidable. Diseño fluido, lleno de vida y con todo lo que
              necesitan saber de tu evento en la palma de su mano.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
              <div className="flex gap-4 p-4 rounded-2xl hover:bg-paper/50 transition-colors duration-300 border border-transparent hover:border-border-button/30">
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-gold shrink-0">
                  <Smartphone size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-serif text-lg text-primary mb-1">
                    Adaptable
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Diseño perfecto en cualquier dispositivo móvil.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl hover:bg-paper/50 transition-colors duration-300 border border-transparent hover:border-border-button/30">
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-gold shrink-0">
                  <Heart size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-serif text-lg text-primary mb-1">
                    Emocional
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Música, video y animaciones que transmiten la esencia de tu
                    evento.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl hover:bg-paper/50 transition-colors duration-300 border border-transparent hover:border-border-button/30">
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-gold shrink-0">
                  <Puzzle size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-serif text-lg text-primary mb-1">
                    Personalizado
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Adaptamos los colores y estilo de tu evento.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl hover:bg-paper/50 transition-colors duration-300 border border-transparent hover:border-border-button/30">
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-gold shrink-0">
                  <Infinity size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-serif text-lg text-primary mb-1">
                    Sin límite de envíos
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Comparte la invitación de tu evento las veces que quieras,
                    100% ilimitado.
                  </p>
                </div>
              </div>
            </div>

            <TextureButton
              className="hidden lg:block"
              onClick={() => window.open("https://bodajy.info", "_blank")}
            >
              <div className="flex gap-2">
                Ver Demo en Vivo <ExternalLink size={16} />
              </div>
            </TextureButton>
          </div>
        </div>
      </div>
    </section>
  );
}
export default DemoSection;
