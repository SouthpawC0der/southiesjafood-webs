"use client";

// Wraps the app so Zustand cart persists across navigation
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
