import CarroIcon from "@/icons/siena/carro";
import RelojIcon from "@/icons/siena/reloj";
import TazaIcon from "@/icons/siena/taza";
import TelefonoIcon from "@/icons/siena/telefono";
import UbicacionIcon from "@/icons/siena/ubicacion";
import { cn } from "@heroui/theme";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

// 🔥 1. DICCIONARIO DE ÍCONOS POR DEFECTO PARA AMENIDADES
const defaultAmenityIcons = {
  // wifi: Wifi,
  parking: CarroIcon,
  coffee: TazaIcon,
  // pool: Waves,
  // gym: Dumbbell,
  // restaurant: Utensils,
  location: UbicacionIcon,
  clock: RelojIcon
};

export type RoomInfo = {
  title: string;
  price: string;
  image: string;
};

export type AmenityInfo = {
  icon: keyof typeof defaultAmenityIcons | React.ElementType | React.ReactNode;
  title: string;
  desc: string;
};

// Configuración de DATOS del hotel
export type AccommodationConfig = {
  hotelName: string;
  location: string;
  mapsLink?: string;
  reservationCode: string;
  rooms: RoomInfo[];
  phones: string[];
  amenities: AmenityInfo[];
};

// Configuración de ESTILOS (ClassNames)
export type AccommodationStyleConfig = {
  mainContainer?: string;
  headerContainer?: string;
  roomsSectionContainer?: string;
  amenitiesGridContainer?: string;
  contactSectionContainer?: string;
  labelTitle?: string;
  mainTitle?: string;
  subtitle?: string;
  codeBoxContainer?: string;
  codeLabel?: string;
  codeValue?: string;
  roomCard?: string;
  roomTitle?: string;
  roomPrice?: string;
  contactButton?: string;
  contactButtonIconColor?: string;
  contactButtonTextColor?: string;
  mapsButton?: string;
  mapsButtonTextColor?: string;
};

const AccommodationSection = ({
  config,
  styles,
}: {
  config: AccommodationConfig;
  styles?: AccommodationStyleConfig;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.3, once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-md mx-auto relative z-10 my-8 min-w-0"
    >
      <div
        className={cn(
          "rounded-[2rem] overflow-hidden w-full transform-gpu",
          "bg-primary text-accent shadow-xl border border-primary/20",
          styles?.mainContainer,
        )}
      >
        {/* Cabecera */}
        <div
          className={cn(
            "p-5 sm:p-8 pb-5 flex flex-col items-center text-center",
            "bg-white",
            styles?.headerContainer,
          )}
        >
          <p
            className={cn(
              "text-[9px] font-nourdMedium uppercase tracking-[0.4em] mb-2",
              "opacity-50",
              styles?.labelTitle,
            )}
          >
            Hospedaje Sugerido
          </p>
          <h3
            className={cn(
              "text-3xl sm:text-4xl font-newIconScript mb-2",
              "text-accent",
              styles?.mainTitle,
            )}
          >
            {config.hotelName}
          </h3>
          <p
            className={cn(
              "font-nourdLight text-sm mb-4",
              "opacity-80",
              styles?.subtitle,
            )}
          >
            {config.location}
          </p>

          {/* Caja de Código */}
          <div
            className={cn(
              "w-full py-3 px-3 sm:px-4 rounded-xl",
              "bg-accent/5 border border-accent/10",
              styles?.codeBoxContainer,
            )}
          >
            <p
              className={cn(
                "text-[9px] font-nourdMedium uppercase tracking-widest mb-1",
                "opacity-60",
                styles?.codeLabel,
              )}
            >
              Código de reservación
            </p>
            <p
              className={cn(
                "font-nourdMedium leading-snug",
                "text-xs sm:text-sm",
                styles?.codeValue,
              )}
            >
              {config.reservationCode}
            </p>
          </div>
        </div>

        {/* Carrusel de Habitaciones */}
        <div
          className={cn(
            "w-full py-6 px-4 sm:px-6",
            "bg-[#faf8f5]",
            styles?.roomsSectionContainer,
          )}
        >
          <div
            className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 snap-x snap-mandatory min-w-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {config.rooms.map((room, idx) => (
              <div
                key={idx}
                className={cn(
                  "min-w-[75%] sm:min-w-[220px] snap-center rounded-xl overflow-hidden shadow-sm flex flex-col transform-gpu shrink-0",
                  "bg-white border border-accent/5",
                  styles?.roomCard,
                )}
              >
                <div className="w-full h-28 sm:h-32 relative bg-gray-200">
                  <Image
                    src={room.image}
                    alt={room.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 75vw, 220px"
                  />
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
                  <p
                    className={cn(
                      "font-nourdMedium uppercase tracking-widest mb-1",
                      "text-[9px] sm:text-[10px] opacity-60",
                      styles?.roomTitle,
                    )}
                  >
                    {room.title}
                  </p>
                  <p
                    className={cn(
                      "font-nourdMedium",
                      "text-base sm:text-lg",
                      styles?.roomPrice,
                    )}
                  >
                    {room.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retícula de Amenidades */}
        <div
          className={cn(
            "p-5 sm:p-6 grid grid-cols-2 gap-y-6 gap-x-2 sm:gap-x-4",
            "bg-white",
            styles?.amenitiesGridContainer,
          )}
        >
          {config.amenities.map((item, idx) => {
            // 🔥 Lógica inteligente de renderizado para el ícono
            const renderIcon = () => {
              const sharedClasses = cn("w-8 h-8 opacity-70 stroke-[0.6] stroke-current", item.icon === 'location' ? 'h-7 my-0.5' : '', styles?.labelTitle);

              // 1. Si es un string válido ("wifi", "parking", etc)
              if (typeof item.icon === "string") {
                const DictIcon =
                  defaultAmenityIcons[
                    item.icon as keyof typeof defaultAmenityIcons
                  ];
                if (!DictIcon) return null;
                return (
                  <DictIcon
                    className={sharedClasses}
                  />
                );
              }

              // 2. Si es un componente ya instanciado (ej. <MapPin className="text-red-500" />)
              if (React.isValidElement(item.icon)) {
                return (
                  <span
                    className={cn(
                      "flex items-center justify-center [&>svg]:w-[22px] [&>svg]:h-[22px]",
                      sharedClasses,
                    )}
                  >
                    {item.icon}
                  </span>
                );
              }

              // 3. Si es la referencia al componente (ej. MapPin)
              const CustomIcon = item.icon as React.ElementType;
              return (
                <CustomIcon
                  strokeWidth={1.5}
                  size={22}
                  className={sharedClasses}
                />
              );
            };

            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-1.5 sm:gap-2"
              >
                {renderIcon()}
                <div className="w-full">
                  <p
                    className={cn(
                      "font-nourdMedium uppercase tracking-widest mb-0.5 whitespace-nowrap",
                      "text-[9px] sm:text-[10px] opacity-80",
                      styles?.labelTitle,
                    )}
                  >
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "font-nourdLight leading-snug whitespace-pre-line",
                      "text-[10px] sm:text-xs opacity-60",
                      styles?.subtitle,
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de Contacto */}
        <div
          className={cn(
            "p-5 sm:p-7 flex flex-col items-center text-center",
            "bg-accent text-primary",
            styles?.contactSectionContainer,
          )}
        >
          <p
            className={cn(
              "font-nourdMedium uppercase tracking-widest mb-6 px-2",
              "text-[9px] opacity-70",
              styles?.codeLabel,
            )}
          >
            Reserva directo con tarifa preferencial
          </p>

          <div className="flex flex-col w-full gap-6">
            {/* BLOQUE DE TELÉFONOS */}
            <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
              {/* Ícono a la izquierda */}
              <div className="flex flex-col items-center justify-center w-12 sm:w-16 shrink-0 opacity-80">
                <TelefonoIcon
                  className={cn(
                    "w-10 h-10 stroke-current stroke-[0.4]",
                    styles?.contactButtonIconColor,
                  )}
                />
              </div>

              {/* Botones a la derecha */}
              <div className="flex flex-col flex-1 gap-2.5">
                {config.phones.map((phone, idx) => {
                  const telLink = `tel:+52${phone.replace(/\s+/g, "")}`;
                  return (
                    <a
                      key={idx}
                      href={telLink}
                      className={cn(
                        "flex items-center justify-center w-full transition-all rounded-full transform-gpu",
                        "py-3 border",
                        "border-primary/30 text-current hover:bg-primary hover:text-accent",
                        styles?.contactButton,
                      )}
                    >
                      <span
                        className={cn(
                          "font-nourdMedium tracking-widest",
                          "text-xs sm:text-sm",
                          styles?.contactButtonTextColor,
                        )}
                      >
                        {phone}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* BLOQUE DE MAPS */}
            {config.mapsLink && (
              <>
                {/* Línea divisoria elegante */}
                <div className="w-full h-px bg-primary/10" />

                <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
                  {/* Ícono a la izquierda */}
                  <div className="flex flex-col items-center justify-center w-12 sm:w-16 shrink-0 opacity-80">
                    <UbicacionIcon
                      className={cn(
                        "w-10 h-10 stroke-current stroke-[0.7] overflow-visible",
                        styles?.contactButtonIconColor,
                      )}
                    />
                  </div>
                  {/* Botón a la derecha con estilos dinámicos */}
                  <div className="flex flex-col flex-1">
                    <a
                      href={config.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center justify-center w-full transition-all rounded-full transform-gpu",
                        "py-3 border border-primary",
                        "bg-primary text-accent hover:opacity-90 shadow-sm",
                        styles?.mapsButton,
                      )}
                    >
                      <span
                        className={cn(
                          "font-nourdMedium tracking-widest text-current",
                          "text-xs sm:text-sm",
                          styles?.mapsButtonTextColor,
                        )}
                      >
                        CÓMO LLEGAR
                      </span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccommodationSection;
