"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };

let addToast: (message: string, type?: Toast["type"]) => void = () => {};

export function toast(message: string, type: Toast["type"] = "success") {
  addToast(message, type);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToast = (message, type = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto px-5 py-3 border-2 border-[var(--ink)] text-sm font-bold shadow-[4px_4px_0_var(--ink)]",
            t.type === "success" && "bg-[var(--green)] text-white",
            t.type === "error"   && "bg-red-600 text-white",
            t.type === "info"    && "bg-[var(--gold)] text-[var(--ink)]"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
