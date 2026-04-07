import { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatToEventDate } from "@/utils/formatters";
import { cn } from "@heroui/theme";

type Props = {
  containerClassName?: string;
  btnClassName?: string;
  qrImage?: string;
  urlPhotos?: string;
}

const QrPhotos: FC<Props> = ({containerClassName = '', btnClassName = '', qrImage, urlPhotos}) => {
  const invitationData = useInvitationStore((state) => state.invitationData);
  return (
    <div className={cn("px-8 bg-primary w-full py-16", containerClassName)}>
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
          className=" flex flex-col gap-5 justify-center items-center text-accent text-center leading-5 font-nourdLight text-md"
        >
          <p>
            Comparte con nosotros todas las fotografías del evento, puedes
            hacerlo escaneando el siguiente código QR
          </p>
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="w-48 h-48">
              <Image
                alt="Sello de carta"
                className="w-full h-full"
                width={0}
                height={0}
                sizes="100vw"
                src={qrImage || `/img/qr-album.png`}
              />
            </div>
            <p>O sólo haz click en este botón</p>
            <a
              className={cn("border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary", btnClassName)}
              href={urlPhotos || "https://photos.app.goo.gl/sDAssibZmqngTZmz8"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir album
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
          className="flex flex-col justify-center items-center mt-12 gap-2 text-accent"
        >
          <p className="font-nourdLight text-md">
            {formatToEventDate(invitationData?.fechaISO)}
          </p>
          <p className="font-newIconScript text-2xl">{invitationData?.nombre}</p>
          <p className="font-nourdLight text-md">¡Te esperamos!</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QrPhotos;
