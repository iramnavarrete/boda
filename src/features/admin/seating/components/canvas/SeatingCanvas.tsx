import React, { useRef, useEffect, useCallback } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import TableElement from "./TableElement";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

export default function SeatingCanvas() {
  const {
    elements,
    zoom,
    setZoom,
    setSelectedElementId,
    canvasOffset,
    setCanvasOffset,
  } = useSeatingStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const { setNodeRef: setDroppableCanvasRef } = useDroppable({
    id: "canvas",
    data: { type: "canvas" },
  });

  const setCursor = useCallback((cursor: string) => {
    if (containerRef.current) containerRef.current.style.cursor = cursor;
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(Math.min(zoom + 0.1, 3));
  };
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(Math.max(zoom - 0.1, 0.2));
  };
  const handleZoomReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.06 : 0.94;
      const currentZoom = useSeatingStore.getState().zoom;
      const newZoom = Math.min(Math.max(currentZoom * factor, 0.2), 3);
      const ratio = newZoom / currentZoom;

      const off = useSeatingStore.getState().canvasOffset ?? { x: 0, y: 0 };
      useSeatingStore.getState().setZoom(newZoom);
      useSeatingStore.getState().setCanvasOffset({
        x: mouseX - ratio * (mouseX - off.x),
        y: mouseY - ratio * (mouseY - off.y),
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const isBackground =
        !target.closest(".table-element-card") &&
        !target.closest(".settings-popover") &&
        !target.closest(".zoom-controls");

      if (!isBackground) return;

      isPanning.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setCursor("grabbing");
      e.preventDefault();
    },
    [setCursor],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning.current) return;
      e.preventDefault();

      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      const off = useSeatingStore.getState().canvasOffset ?? { x: 0, y: 0 };
      useSeatingStore
        .getState()
        .setCanvasOffset({ x: off.x + dx, y: off.y + dy });
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning.current) return;
      isPanning.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setCursor("grab");
    },
    [setCursor],
  );

  const gridSize = 20 * zoom;
  const offX = canvasOffset?.x ?? 0;
  const offY = canvasOffset?.y ?? 0;
  const gridOffsetX = ((offX % gridSize) + gridSize) % gridSize;
  const gridOffsetY = ((offY % gridSize) + gridSize) % gridSize;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full overflow-hidden bg-[#F9F7F2] select-none cursor-grab"
      style={{
        backgroundImage: `linear-gradient(#EBE5DA 1px, transparent 1px), linear-gradient(90deg, #EBE5DA 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
      }}
      onClick={() => setSelectedElementId(null)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="zoom-controls absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-[#EBE5DA] z-20">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-semibold w-12 text-center text-[#2C2C29]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-[#EBE5DA] mx-0.5" />
        <button
          onClick={handleZoomReset}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] transition-colors"
          title="Restablecer vista"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[#A8A29E] font-medium tracking-wide pointer-events-none select-none z-10">
        Arrastra para navegar · Ctrl+scroll para zoom
      </div>

      <div
        ref={setDroppableCanvasRef}
        className="absolute top-0 left-0 origin-top-left w-[5000px] h-[5000px] canvas-droppable-area"
        style={{
          transform: `translate(${offX}px, ${offY}px) scale(${zoom})`,
          willChange: "transform",
        }}
      >
        {elements.map((el) => (
          <TableElement key={el.id} element={el} />
        ))}
      </div>
    </div>
  );
}
