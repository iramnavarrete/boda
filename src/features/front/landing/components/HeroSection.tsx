import TextureButton from "@/features/shared/components/TextureButton";
import Image from "next/image";

const svgClassNames = "w-40 h-40 lg:w-48 lg:h-48 ";

// --- COMPONENTES UI ---

const IconRings: React.FC = () => (
  <div className={svgClassNames + "animate-float-1"}>
    <Image
      alt="Boda"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/boda-religiosa-verde.svg`}
    />
    <p className=" text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Bodas
    </p>
  </div>
);

const IconDress: React.FC = () => (
  <div className={svgClassNames + "animate-float-2"}>
    <Image
      alt="Quinceañera"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/quinceanera-verde.svg`}
    />
    <p className=" text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Quinceañeras
    </p>
  </div>
);

const IconCups: React.FC = () => (
  <div className={svgClassNames + "animate-float-3"}>
    <Image
      alt="Cualquier evento"
      className="w-full h-full"
      width={0}
      height={0}
      src={`/img/svg/celebracion-verde.svg`}
    />
    <p className=" text-center pt-4 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
      Momentos especiales
    </p>
  </div>
);

const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="min-h-screen pt-16 pb-20 px-4 flex flex-col items-center justify-center bg-paper relative overflow-hidden"
    >
      {/* TEXTURA */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('/img/textures/cream-paper.png')] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center z-10 relative mt-6">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-7xl text-primary leading-[1.05] mb-8 drop-shadow-sm">
          Tu invitación soñada
          <br />
          <span className="italic font-light text-gold text-3xl sm:text-4xl md:text-7xl relative inline-block">
            llena de vida
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-gold opacity-40"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="text-cool-gray text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed px-8 sm:px-16 md:px-20">
          Invitaciones digitales diseñadas para hacer tu evento inolvidable
          desde la primera impresión.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <TextureButton
            onClick={() => {
              const element = document.getElementById("paquetes");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Ver paquetes
          </TextureButton>
        </div>
      </div>

      {/* --- GRID DE ÍCONOS EN TARJETA DE CRISTAL --- */}
      <div className="mt-16 relative w-full max-w-6xl mx-auto px-4 perspective-1000">
        <div className="relative rounded-[40px] border border-white/40 bg-white/20 backdrop-blur-md shadow-[0_30px_60px_-15px_rgba(88,98,79,0.15)] overflow-hidden">
          {/* Iluminación Superior */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

          {/* Contenedor Flex/Grid Real */}
          <div className="w-full relative z-10 px-8 py-8">
            <p className="text-center pt-2 italic font-light font-serif text-base text-primary leading-[1.05] mb-8 drop-shadow-sm">
              Cuenta con nosotros para todo tipo de eventos.
            </p>
            <div className="py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-center justify-items-center">
              <IconRings />
              <IconDress />
              <IconCups />
            </div>
          </div>

          {/* Brillo de Fondo Radial */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent rounded-[40px] pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
