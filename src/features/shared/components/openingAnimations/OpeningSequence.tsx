"use client";

import { useState, useEffect } from "react";
import EnvelopeSplash from "./EnvelopeSplash";
import Cover from "@/features/front/components/sections/cover";

export default function OpeningSequence() {
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  // El bloqueo de scroll de la página lo maneja este componente cliente
  useEffect(() => {
    if (!isEnvelopeOpened) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isEnvelopeOpened]);

  return (
    <>
      <EnvelopeSplash
        onOpen={() => setIsEnvelopeOpened(true)}
      />
      <Cover isSealVisible={!isEnvelopeOpened} />
    </>
  );
}
