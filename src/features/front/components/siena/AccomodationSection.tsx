import { cn } from "@heroui/theme";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";


export type RoomInfo = {
  title: string;
  price: string;
  image: string;
};

export type AmenityInfo = {
  icon: React.ElementType; // Recibe el componente del icono (ej. MapPin, Coffee)
  title: string;
  desc: string; // 🔥 Aquí aceptaremos saltos de línea '\n'
};

// 1. Configuración de DATOS del hotel
export type AccommodationConfig = {
  hotelName: string;
  location: string;
  reservationCode: string;
  rooms: RoomInfo[];
  phones: string[];
  amenities: AmenityInfo[];
};

// 2. Configuración de ESTILOS (ClassNames) para personalización total
export type AccommodationStyleConfig = {
  // Contenedores
  mainContainer?: string; // El Card completo (sombra, redondeado, borde principal)
  headerContainer?: string; // Fondo de la cabecera (donde va el nombre)
  roomsSectionContainer?: string; // Fondo de la zona de carrusel
  amenitiesGridContainer?: string; // Fondo de la zona de amenidades
  contactSectionContainer?: string; // Fondo de la zona de botones

  // Textos Generales
  labelTitle?: string; // "Hospedaje Sugerido" / "Ubicación"
  mainTitle?: string; // "Highland Hotel"
  subtitle?: string; // "Chihuahua" / Descripciones de amenidades

  // Caja de Código
  codeBoxContainer?: string; // Fondo y borde de la caja del código
  codeLabel?: string; // "Código de reservación"
  codeValue?: string; // El código en sí

  // Tarjetas de Habitaciones
  roomCard?: string; // Contenedor de la tarjeta individual
  roomTitle?: string; // Título de la habitación
  roomPrice?: string; // Precio de la habitación

  // Botones/Enlaces
  contactButton?: string; // Estilo del botón (borde, fondo, hover)
  contactButtonIconColor?: string; // Color específico para el icono del teléfono
  contactButtonTextColor?: string; // Color específico para el texto del teléfono
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
            className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 snap-x snap-mandatory min-w-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              .flex::-webkit-scrollbar { display: none; }
            `}</style>

            {config.rooms.map((room, idx) => (
              <div
                key={idx}
                className={cn(
                  "min-w-[75%] sm:min-w-[220px] snap-center rounded-xl overflow-hidden shadow-sm flex flex-col transform-gpu",
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
          {config.amenities.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center gap-1.5 sm:gap-2"
            >
              <item.icon
                strokeWidth={1.5}
                size={22}
                className={cn("opacity-70", styles?.labelTitle)}
              />
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
          ))}
        </div>

        {/* Botones de Contacto */}
        <div
          className={cn(
            "p-5 sm:p-6 flex flex-col items-center text-center",
            "bg-accent text-primary",
            styles?.contactSectionContainer,
          )}
        >
          <p
            className={cn(
              "font-nourdMedium uppercase tracking-widest mb-4 px-2",
              "text-[9px] opacity-70",
              styles?.codeLabel,
            )}
          >
            Reserva directo con tarifa preferencial
          </p>
          <div className="flex flex-col w-full gap-2 sm:gap-3">
            {config.phones.map((phone, idx) => {
              const telLink = `tel:+52${phone.replace(/\s+/g, "")}`;
              return (
                <a
                  key={idx}
                  href={telLink}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full transition-all rounded-full transform-gpu",
                    "py-2.5 sm:py-3 border",
                    "border-primary/30 text-current hover:bg-primary hover:text-accent",
                    styles?.contactButton,
                  )}
                >
                  <Phone
                    size={14}
                    className={cn(styles?.contactButtonIconColor)}
                  />
                  <span
                    className={cn(
                      "font-nourdMedium tracking-widest",
                      "text-[11px] sm:text-sm",
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
      </div>
    </motion.div>
  );
};

export default AccommodationSection;
