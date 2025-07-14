import AmazonIcon from "@/icons/amazon-icon";
import BbvaIcon from "@/icons/bbva-icon";
import GiftIcon from "@/icons/gift-icon";
import { FC } from "react";

const GiftsTable: FC = () => {
  return (
    <div className="px-5 bg-primary w-full py-16">
      <div className=" flex flex-col gap-5 justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-accent">
            Mesa de regalos
          </p>
        </div>
        <div className="text-accent text-center leading-5 text-md font-nourdLight px-2">
          <p>
            El regalo es opcional, la asistencia obligatoria, pero si quieres
            tener un detalle con nosotros, que mejor que muestra luna de miel.
          </p>
        </div>
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center">
            <AmazonIcon className="h-8 mb-6" />
            <a
              className="border-border-button border-1 px-8 py-3 rounded-2xl bg-button font-nourdMedium text-primary"
              href="https://www.amazon.com.mx"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver mesa
            </a>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GiftIcon className="h-12" />
            <div className="text-accent text-center leading-5 text-md font-nourdLight">
              <p>En efectivo el día de la boda</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BbvaIcon className="h-12" />
            <div className="text-accent text-center leading-8 text-md font-nourdMedium">
              <p>Transferencia de fondos</p>
            </div>
            <div className="text-accent text-center leading-7 text-md font-nourdLight">
              <p>
                <span className="font-nourdMedium">Banco: </span>BBVA
              </p>
              <p>
                <span className="font-nourdMedium">Numero tarjeta: </span> 5741 4600 5879 5461
              </p>
              <p>
                <span className="font-nourdMedium">Beneficiario: </span>Iram Navarrete
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftsTable;
