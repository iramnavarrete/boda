import { useEffect, useState } from "react";
import "photoswipe/dist/photoswipe.css";

import Cover from "@/features/front/components/sections/cover";
import Quote from "@/features/front/components/sections/quote";
import ParentsGodFathers from "@/features/front/components/sections/parents";
import CountDown from "@/features/front/components/sections/countdown";
import CeremonyToast from "@/features/front/components/sections/ceremony-toast";
import Gallery from "@/features/front/components/sections/gallery";
import Assistants from "@/features/front/components/sections/Assistants";
import GiftsTable from "@/features/front/components/sections/gifts-table";
import QrPhotos from "@/features/front/components/sections/qr-photos";
import { AudioController } from "@/features/front/components/sections/music";
import Footer from "@/features/front/components/sections/footer";

import EnvelopeSplash from "@/features/front/components/openingAnimations/EnvelopeSplash";
import DesktopSidebars from "@/features/shared/components/DesktopSidebars";
import {
  newIconScript,
  nourdBold,
  nourdLight,
  nourdMedium,
} from "@/features/shared/fonts";

export default function Home() {
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  return (
    <main
      className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable}`}
    >
      {/* Componente que maneja la apertura del Lottie inicial */}
      <EnvelopeSplash onOpen={() => setIsEnvelopeOpened(true)} />

      <div style={{ overflow: "hidden" }}>
        <div className="flex flex-col items-center overflow-hidden bg-texture">
          <DesktopSidebars />

          {/* Contenido Central (Secciones de la Invitación) */}
          <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
            <Cover isSealVisible={!isEnvelopeOpened} />
            <Quote />
            <ParentsGodFathers />
            <CountDown />
            <CeremonyToast />
            <Gallery />
            <GiftsTable />
            <Assistants />
            <QrPhotos />
            <Footer />
            <AudioController />
          </div>
        </div>
      </div>
    </main>
  );
}
