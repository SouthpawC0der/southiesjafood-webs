"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu-data";

type Props = { item: MenuItem; compact?: boolean };

export function AddToCartButton({ item, compact = false }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(item);
    toast(`${item.name} added!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        aria-label={`Add ${item.name} to order`}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0",
          added
            ? "bg-[var(--c-green)] text-white scale-110"
            : "bg-[var(--c-gold)] text-black hover:bg-[var(--c-gold-dark)]"
        )}
      >
        {added ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-[0.97]",
        added
          ? "bg-[var(--c-green)] text-white"
          : "bg-[var(--c-gold)] text-black hover:bg-[var(--c-gold-dark)]"
      )}
    >
      {added
        ? <><Check size={14} strokeWidth={3} /> Added!</>
        : <><Plus size={14} strokeWidth={3} /> Add to Order</>}
    </button>
  );
}
