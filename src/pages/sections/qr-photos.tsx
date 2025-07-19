import { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const QrPhotos: FC = () => {
  return (
    <div className="px-8 bg-primary w-full py-16">
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
                src={`/img/qr-album.png`}
              />
            </div>
            <p>O sólo haz click en este botón</p>
            <a
              className="border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
              href="https://photos.app.goo.gl/sDAssibZmqngTZmz8"
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
          <p className="font-nourdLight text-md">25 / OCT / 2025</p>
          <p className="font-newIconScript text-2xl">Josué & Yaneth</p>
          <p className="font-nourdLight text-md">¡Te esperamos!</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QrPhotos;
