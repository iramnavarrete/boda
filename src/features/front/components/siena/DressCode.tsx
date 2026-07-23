import TieIcon from "@/icons/tie-icon";
import { cn } from "@heroui/theme";
import AnimatedEntrance from "../AnimatedEntrance";
import LadiesShoeIcon from "@/icons/ladies-shoe-icon";

export type ColorPalette = {
  hex: string;
  name: string;
}[];

export interface DressCodeSection {
  title: string;
  description: string;
  restrictions: string;
}

interface DressCodeProps {
  title: string;
  text: string;
  womenConfig: DressCodeSection;
  menConfig: DressCodeSection;
  forbiddenColors: ColorPalette;
  textClassName?: string;
}

const DressCode: React.FC<DressCodeProps> = ({
  title,
  text,
  womenConfig,
  menConfig,
  forbiddenColors,
  textClassName,
}) => {
  // Lógica para distribuir los colores simétricamente
  const getColorRows = (colors: ColorPalette) => {
    if (!colors || colors.length === 0) return [];
    if (colors.length <= 6) return [colors]; // Si son 6 o menos, 1 sola fila

    // Si son más de 6, partimos el arreglo en 2 mitades balanceadas
    const half = Math.ceil(colors.length / 2);
    return [colors.slice(0, half), colors.slice(half)];
  };

  const colorRows = getColorRows(forbiddenColors || []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full mx-auto z-10 pt-10",
        textClassName,
      )}
    >
      <AnimatedEntrance classname="w-full flex flex-col items-center">
        {/* Overline & Título Principal */}
        <p className="text-[10px] font-nourdMedium text-current opacity-70 uppercase tracking-[0.3em] mb-4 text-center">
          — La etiqueta del evento —
        </p>
        <h2 className="text-4xl md:text-5xl text-current mb-4 text-center font-newIconScript drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]">
          {title}
        </h2>

        {/* Separador Sutil */}
        <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
          <span className="text-current opacity-50 text-xs">✦</span>
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
        </div>

        {/* Texto de Descripción General */}
        <p className="text-current opacity-90 font-nourdLight text-center max-w-md mb-14 leading-relaxed text-base px-4">
          {text}
        </p>

        {/* Estilos (Mujeres y Hombres) */}
        <div className="flex flex-col gap-16 w-full max-w-md mx-auto px-4 mb-16">
          {/* Bloque Mujeres */}
          <div className="flex flex-col items-center text-center">
            <LadiesShoeIcon
              className="text-current opacity-60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-current mb-3">
              {womenConfig.title}
            </h3>
            <p className="text-current opacity-80 text-sm leading-relaxed mb-5 font-nourdLight px-2">
              {womenConfig.description}
            </p>
            {womenConfig.restrictions && (
              <span className="text-[10px] font-nourdMedium uppercase tracking-[0.1em] text-current opacity-90 bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-5 py-2 rounded-md mb-6 border border-[color-mix(in_srgb,currentColor_20%,transparent)]">
                {womenConfig.restrictions}
              </span>
            )}

            {/* Paleta de Colores Prohibidos Integrada en Mujeres */}
            {colorRows.length > 0 && (
              <div className="flex flex-col items-center border border-[color-mix(in_srgb,currentColor_20%,transparent)] bg-[color-mix(in_srgb,currentColor_5%,transparent)] rounded-2xl py-6 w-full relative mt-2">
                <p className="text-[9px] font-nourdMedium text-current opacity-80 uppercase tracking-[0.2em] text-center mb-5">
                  Colores Exclusivos (No Permitidos)
                </p>

                {/* Contenedor de Filas Dinámicas */}
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                  {colorRows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
                    >
                      {row.map((color, idx) => (
                        <div
                          key={idx}
                          className="relative group flex flex-col items-center justify-center"
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow-sm border-2 border-white transition-transform group-hover:scale-110 cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                          />
                          {/* Tooltip animado */}
                          <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 flex flex-col items-center translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-[9px] font-nourdMedium uppercase tracking-widest shadow-lg border border-primary/10 whitespace-nowrap">
                              {color.name}
                            </div>
                            <div className="w-2 h-2 bg-white/95 border-r border-b border-primary/10 rotate-45 -mt-1 shadow-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <p className="text-current opacity-60 text-[11px] italic font-serif mt-5 text-center px-4">
                  *Tonalidades reservadas estrictamente para la novia y las
                  damas de honor.
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex justify-center opacity-30">
            <div className="w-24 h-px bg-current"></div>
          </div>

          {/* Bloque Hombres */}
          <div className="flex flex-col items-center text-center">
            <TieIcon
              className="text-current opacity-60 w-8 h-8 mb-4"
              strokeWidth={1.2}
            />
            <h3 className="font-newIconScript text-3xl text-current mb-3">
              {menConfig.title}
            </h3>
            <p className="text-current opacity-80 text-sm leading-relaxed mb-5 font-nourdLight px-2">
              {menConfig.description}
            </p>
            {menConfig.restrictions && (
              <span className="text-[10px] font-nourdMedium uppercase tracking-[0.1em] text-current opacity-90 bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-5 py-2 rounded-md border border-[color-mix(in_srgb,currentColor_20%,transparent)]">
                {menConfig.restrictions}
              </span>
            )}
          </div>
        </div>
      </AnimatedEntrance>
    </div>
  );
};

export default DressCode;
