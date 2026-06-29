"use client";

import React, { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
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

  const [totalTables, setTotalTables] = useState<number | string>(15);
  const [seatsPerTable, setSeatsPerTable] = useState(10);
  const [includeDanceFloor, setIncludeDanceFloor] = useState(true);

  if (!isOpen) return null;

  const handleTotalTablesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setTotalTables(val === "" ? "" : parseInt(val, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tablesCount = typeof totalTables === "number" ? totalTables : 0;

    if (tablesCount <= 0 || tablesCount > 100) {
      alert("Por favor ingresa un número de mesas válido (1 a 100).");
      return;
    }

    const currentTablesCount = elements.filter((e) => e.seats > 0).length;

    const generatedElements = generateCustomLayout({
      totalTables: tablesCount,
      seatsPerTable,
      includeDanceFloor,
      startingIndex: currentTablesCount,
      centerX: dropX,
      centerY: dropY,
    });

    addLayoutElements(generatedElements);
    showToast(
      `Se han generado ${tablesCount} mesas en la posición seleccionada.`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div
        className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#EBE5DA] flex justify-between items-center bg-white shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
              <Sparkles size={14} className="text-[#C5A669]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C2C29]">
                Distribución
              </h2>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                Genera tu acomodo inicial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group bg-transparent hover:bg-red-50 border border-transparent hover:border-red-100 text-stone-400 hover:text-red-500 rounded-xl p-2 transition-all ml-1"
            title="Cancelar selección"
          >
            <X
              size={20}
              className="transform group-hover:rotate-90 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden min-h-0 bg-[#F9F7F2]/30"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Input Número de Mesas */}
            <div>
              <label className="block text-sm font-medium text-[#2C2C29] mb-1.5 ml-1">
                Número total de Mesas*
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={totalTables}
                onChange={handleTotalTablesChange}
                placeholder="Ej: 15"
                className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all placeholder:text-stone-300 shadow-sm"
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 ml-1 italic">
                Se distribuirán simétricamente en 2 bloques. (Máx. 100).
              </p>
            </div>

            {/* Select Asientos por Mesa */}
            <div>
              <label className="block text-sm font-medium text-[#2C2C29] mb-1.5 ml-1">
                Asientos por Mesa*
              </label>
              <div className="relative">
                <select
                  value={seatsPerTable}
                  onChange={(e) => setSeatsPerTable(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value={4}>4 Asientos</option>
                  <option value={6}>6 Asientos</option>
                  <option value={8}>8 Asientos (Estándar)</option>
                  <option value={10}>10 Asientos (Grande)</option>
                  <option value={12}>12 Asientos (Extra)</option>
                </select>
                {/* Flecha personalizada */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Toggle Checkbox Estilo FamilyFormModal */}
            <div className="pt-2">
              <div
                className={`rounded-xl transition-all border ${includeDanceFloor ? "bg-white border-[#EBE5DA] shadow-sm" : "border-transparent hover:bg-white/50"}`}
              >
                <button
                  type="button"
                  onClick={() => setIncludeDanceFloor(!includeDanceFloor)}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-xl group"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${includeDanceFloor ? "bg-[#C5A669] border-[#C5A669] text-white" : "bg-white border-stone-300 text-transparent group-hover:border-stone-400"}`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <span
                      className={`block text-sm font-medium select-none transition-colors ${includeDanceFloor ? "text-[#C5A669]" : "text-[#2C2C29]"}`}
                    >
                      Incluir Pista Central
                    </span>
                    <span className="text-xs text-[#A8A29E] block">
                      Añade pista de baile y escenario.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Acciones Footer Estilo FamilyFormModal */}
          <div className="p-4 border-t border-[#EBE5DA] bg-white flex gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#F9F7F2] text-[#2C2C29] border border-[#EBE5DA] rounded-xl hover:bg-white hover:border-[#C5A669]/30 hover:text-[#C5A669] font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#C5A669] text-white rounded-xl hover:bg-[#b09255] font-medium shadow-lg shadow-[#C5A669]/20 transition-all flex items-center justify-center gap-2"
            >
              Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
