"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type ToastCallback = (message: string, type?: ToastType, duration?: number) => void

interface ToastContextType {
  toast: ToastCallback;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback<ToastCallback>((message: string, type: ToastType = "info", duration = 2000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Container de Toasts (Flotante) */}
      <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-3 max-w-xs sm:max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto transform transition-
              flex items-start gap-3 p-4 rounded-xl shadow-xl border
              ${
                t.type === "success"
                  ? "bg-green-200 border-green-300 text-green-800"
                  : ""
              }
              ${
                t.type === "error"
                  ? "bg-red-200 border-red-300 text-red-800"
                  : ""
              }
              ${
                t.type === "info"
                  ? "bg-blue-200 border-blue-300 text-blue-800"
                  : ""
              }
            `}
          >
            {/* Iconos según tipo */}
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && (
                <CheckCircle2 size={20} className="text-current" />
              )}
              {t.type === "error" && (
                <AlertCircle size={20} className="text-current" />
              )}
              {t.type === "info" && (
                <Info size={20} className="text-current" />
              )}
            </div>

            <p className="flex-1 text-sm font-medium leading-5">{t.message}</p>

            <button
              onClick={() => removeToast(t.id)}
              className={`shrink-0 transition-colors ${
                t.type === "info"
                  ? "text-stone-500 hover:text-stone-300"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
};
