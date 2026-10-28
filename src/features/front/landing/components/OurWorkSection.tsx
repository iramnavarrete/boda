"use client";
import PhoneFrame from "@/features/shared/components/PhoneFrame";
import TextureButton from "@/features/shared/components/TextureButton";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import SectionTitle from "./SectionTitle";

interface WorkModel {
  id: string;
  name: string;
  type: string;
  image: string;
  url: string;
}

const WORK_MODELS: WorkModel[] = [
  {
    id: "andrea-adrian",
    name: "Andrea & Adrián",
    type: "Boda",
    image: "/img/landing/samples/andrea-adrian.webp",
    url: "/i/andrea-adrian",
  },
  {
    id: "sofia",
    name: "Sofía",
    type: "XV Años",
    image: "/img/landing/samples/sofia.webp",
    url: "/i/sofia-xv",
  },
  {
    id: "valentina",
    name: "Valentina",
    type: "XV Años",
    image: "/img/landing/samples/valentina.webp",
    url: "/i/valentina-xv-sapphire",
  },
];

const OurWorkSection: React.FC = () => (
  <section id="trabajo" className="py-24 md:py-32 bg-white relative">
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <SectionTitle subtitle="Nuestro Trabajo">
        Cada historia merece una invitación a la medida
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 justify-items-center">
        {WORK_MODELS.map((model, idx) => (
          <motion.article
            key={model.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: idx * 0.12, ease: "easeOut" }}
            className="group flex flex-col items-center text-center"
          >
            {/* Marco de teléfono con la miniatura de la invitación */}
            <div className="transition-transform duration-500 group-hover:-translate-y-2">
              <PhoneFrame>
                <Image
                  src={model.image}
                  alt={`Invitación de ${model.name}`}
                  fill
                  className="object-cover object-top"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </PhoneFrame>
            </div>

            {/* Etiqueta */}
            <span className="mt-7 px-4 py-1.5 rounded-full border border-gold/40 bg-paper text-[10px] font-bold tracking-[0.25em] uppercase text-primary">
              {model.type}
            </span>

            {/* Nombre */}
            <h3 className="mt-4 font-serif text-2xl text-primary">{model.name}</h3>

            {/* Botón de demo */}
            <div className="mt-6">
              <TextureButton
                icon={<ExternalLink size={16} />}
                onClick={() => window.open(model.url, "_blank", "noopener")}
              >
                Ver en vivo
              </TextureButton>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default OurWorkSection;
