import { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatToEventDate } from "@/utils/formatters";
import { cn } from "@heroui/theme";
import { ReactQRCode } from "@lglab/react-qr-code";

/**
 * Variante visual de la sección QR de fotos.
 *
 * - `"wedding"` (default) — estilo clásico: fondo `bg-primary` (theme),
 *   tipografía `font-nourdLight` + `font-newIconScript` para el nombre.
 * - `"xv"` — fondo `bg-xv-bg-deepest` (dark navy de XV), tipografía
 *   `font-cormorant italic` para el tagline y el nombre, accent del
 *   tema en todos los textos.
 */
export type QrPhotosVariant = "wedding" | "xv";

type Props = {
  containerClassName?: string;
  btnClassName?: string;
  urlPhotos?: string;
  variant?: QrPhotosVariant;
}

const QrPhotos: FC<Props> = ({
  containerClassName = "",
  btnClassName = "",
  urlPhotos,
  variant = "wedding",
}) => {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const isXv = variant === "xv";

  // QR siempre con módulos blancos — el fondo (oscuro) los hace contrastar
  // en ambas variantes.
  const qrModulesColor = "#fff";

  // Clases condicionales por variant
  const wrapperClass = isXv
    ? "px-8 bg-xv-bg-deepest w-full py-16"
    : "px-8 bg-primary w-full py-16";

  const mainTextClass = isXv
    ? "flex flex-col gap-5 justify-center items-center text-xv-accent-soft text-center leading-5 font-cormorant italic text-base"
    : "flex flex-col gap-5 justify-center items-center text-accent text-center leading-5 font-nourdLight text-md";

  const ctaClass = isXv
    ? "flex items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.2em] text-xv-accent-soft border-b border-xv-accent-soft/40 pb-1 hover:border-xv-accent-soft transition-all"
    : "flex items-center gap-2 text-[10px] font-nourdMedium uppercase tracking-[0.2em] border-b border-[color-mix(in_srgb,currentColor_20%,transparent)] pb-1 hover:border-current transition-all";

  const footerTextClass = isXv
    ? "flex flex-col justify-center items-center mt-12 gap-2 text-xv-accent-soft"
    : "flex flex-col justify-center items-center mt-12 gap-2 text-accent";

  const footerNameClass = isXv
    ? "font-cormorant text-2xl italic"
    : "font-newIconScript text-2xl";

  return (
    <div className={cn(wrapperClass, containerClassName)}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              duration: 1.5,
            },
          }}
          viewport={{ once: true, amount: "some" }}
          className={mainTextClass}
        >
          <p>
            Comparte con nosotros todas las fotografías del evento, puedes
            hacerlo escaneando el siguiente código QR
          </p>
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="w-48 h-48">
              <div className="w-full h-full flex items-center justify-center">
                <ReactQRCode
                  value={
                    urlPhotos || "https://photos.app.goo.gl/sDAssibZmqngTZmz8"
                  }
                  size={300}
                  dataModulesSettings={{
                    style: "rounded",
                    color: qrModulesColor,
                    lineWidth: 0.9,
                  }}
                  finderPatternInnerSettings={{
                    style: "inpoint-lg",
                    color: qrModulesColor,
                  }}
                  finderPatternOuterSettings={{
                    style: "inpoint-lg",
                    color: qrModulesColor,
                  }}
                />
              </div>
            </div>
            <p>O sólo haz click en este botón</p>
            <a
              href={urlPhotos || "https://photos.app.goo.gl/sDAssibZmqngTZmz8"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ctaClass, btnClassName)}
            >
              Abrir álbum
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              duration: 1.5,
            },
          }}
          viewport={{ once: true, amount: "some" }}
          className={footerTextClass}
        >
          <p
            className={
              isXv ? "font-cormorant text-md" : "font-nourdLight text-md"
            }
          >
            {formatToEventDate(invitationData?.fechaISO)}
          </p>
          <p className={footerNameClass}>
            {isXv ? "XV · " : null}
            {invitationData?.nombre}
          </p>
          <p
            className={
              isXv ? "font-cormorant italic text-md" : "font-nourdLight text-md"
            }
          >
            ¡Te esperamos!
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QrPhotos;
