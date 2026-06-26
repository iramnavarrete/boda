"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { generateCustomLayout } from "../../utils/layoutGenerator";
import { useSeatingStore } from "../../stores/useSeatingStore";

interface LayoutSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropX: number;
  dropY: number;
}

export default function LayoutSetupModal({
  isOpen,
  onClose,
  dropX,
  dropY,
}: LayoutSetupModalProps) {
  const { elements, addLayoutElements, showToast } = useSeatingStore();

  const [totalTables, setTotalTables] = useState(15);
  const [seatsPerTable, setSeatsPerTable] = useState(10);
  const [includeDanceFloor, setIncludeDanceFloor] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalTables <= 0 || totalTables > 100) {
      alert("Por favor ingresa un número de mesas válido (1 a 100).");
      return;
    }

    const currentTablesCount = elements.filter((e) => e.seats > 0).length;

    // 🔥 Agregamos dropX y dropY mapeados a centerX y centerY
    const generatedElements = generateCustomLayout({
      totalTables,
      seatsPerTable,
      includeDanceFloor,
      startingIndex: currentTablesCount,
      centerX: dropX,
      centerY: dropY,
    });

    addLayoutElements(generatedElements);
    showToast(
      `Se han generado ${totalTables} mesas en la posición seleccionada.`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EBE5DA] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C5A669]">
            <Sparkles size={18} />
            <h3 className="font-serif text-[15px] font-bold text-[#2C2C29]">
              Configurar Distribución
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A8A29E] hover:bg-[#F9F7F2] rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-xs font-medium text-[#5A5A5A]"
        >
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-[#A8A29E]">
              Número total de Mesas
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={totalTables}
              onChange={(e) => setTotalTables(parseInt(e.target.value) || 0)}
              className="w-full font-serif text-sm font-semibold text-[#2C2C29] bg-white border border-[#EBE5DA] rounded-xl px-3 py-2 focus:border-[#C5A669] focus:outline-none"
            />
            <p className="text-[10px] text-[#A8A29E] font-normal mt-1 italic">
              Se distribuirán simétricamente en 2 bloques (izquierdo y derecho).
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-[#A8A29E]">
              Asientos por Mesa
            </label>
            <select
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(parseInt(e.target.value))}
              className="w-full font-serif text-sm font-semibold text-[#2C2C29] bg-white border border-[#EBE5DA] rounded-xl px-3 py-2 focus:border-[#C5A669] focus:outline-none"
            >
              <option value={4}>4 Asientos</option>
              <option value={6}>6 Asientos</option>
              <option value={8}>8 Asientos (Estándar)</option>
              <option value={10}>10 Asientos (Grande)</option>
              <option value={12}>12 Asientos (Extra)</option>
            </select>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer bg-white p-3 border border-[#EBE5DA] rounded-xl select-none hover:bg-[#F9F7F2] transition-colors">
              <input
                type="checkbox"
                checked={includeDanceFloor}
                onChange={(e) => setIncludeDanceFloor(e.target.checked)}
                className="w-4 h-4 rounded-sm border-[#EBE5DA] text-[#C5A669] focus:ring-0 cursor-pointer accent-[#C5A669]"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#2C2C29]">
                  Incluir Pista Central
                </span>
                <span className="text-[9px] text-[#A8A29E] font-normal">
                  Añade pista de baile y escenario.
                </span>
              </div>
            </label>
          </div>

          {/* Acciones */}
          <div className="pt-2 flex gap-3 justify-end items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#EBE5DA] text-[#5A5A5A] rounded-xl hover:bg-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C5A669] hover:bg-[#b09255] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl shadow-lg transition-all"
            >
              Generar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
