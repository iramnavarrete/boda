"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import WaxSeal from "@/features/shared/components/WaxSeal"; // Tu componente real
import FrontLayout from "@/features/shared/layouts/front";

export default function GeneradorFavicon() {
  const sealRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!sealRef.current) return;
    setIsGenerating(true);

    // 1. TRUCO ANTI-CORS: Guardaremos el nodo, su padre y su posición exacta
    const problematicNodes: {
      node: HTMLLinkElement | HTMLStyleElement;
      parent: ParentNode;
      nextSibling: ChildNode | null;
    }[] = [];

    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        const rules = sheet.cssRules;
      } catch (e) {
        const node = sheet.ownerNode;
        if (
          (node instanceof HTMLLinkElement ||
            node instanceof HTMLStyleElement) &&
          node.parentNode
        ) {
          problematicNodes.push({
            node,
            parent: node.parentNode,
            nextSibling: node.nextSibling,
          });
          node.parentNode.removeChild(node);
        }
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // 2. Tomamos la foto a tamaño 1:1 (el componente ya mide 256x256)
      const dataUrl = await toPng(sealRef.current, {
        cacheBust: true,
        pixelRatio: 1, // 🔥 Lo dejamos en 1 para que mida exactamente 256x256 px
        backgroundColor: "transparent",
      });

      // 3. Forzamos la descarga como .ico
      const link = document.createElement("a");
      link.download = "favicon.ico"; // 🔥 Extensión cambiada
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al exportar el componente WaxSeal:", err);
      alert("Hubo un error al generar la imagen. Revisa la consola.");
    } finally {
      // 4. RESTAURACIÓN de los CSS
      problematicNodes.forEach(({ node, parent, nextSibling }) => {
        parent.insertBefore(node, nextSibling);
      });

      setIsGenerating(false);
    }
  };

  return (
    <FrontLayout>
      <div className="min-h-screen bg-stone-200 flex flex-col items-center justify-center gap-10 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            Generador de Favicon (WaxSeal Real)
          </h1>
          <p className="text-stone-600 text-sm">
            Exportando directamente tu componente React usando html-to-image.
          </p>
        </div>

        <div className="border-4 border-dashed border-stone-400 rounded-3xl p-12 flex justify-center items-center bg-transparent">
          {/* Este es el div al que le tomamos la foto */}
          <div ref={sealRef}>
            {/* Generación con svg */}
            {/* <WaxSeal
              initials="A & A"
              customSvg={
                <MelissaSantiagoSealLogo className="text-white h-20 w-20 -translate-x-[2px]" />
              }
              size={256} // Tamaño grande para buena calidad
              sealColor="#252a33"
              textColor="#ffffff"
            /> */}
                {/* Generación con iniciales */}
            {/* <WaxSeal
              initials="A & A"
              size={256} // Tamaño grande para buena calidad
              sealColor="#5b0012"
              textColor="#ffffff"
            /> */}
            <WaxSeal
              size={256}
            />
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-8 py-4 bg-[#5b0012] text-white rounded-full font-medium hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl"
        >
          {isGenerating ? "Capturando..." : "Descargar mi WaxSeal (PNG)"}
        </button>
      </div>
    </FrontLayout>
  );
}
