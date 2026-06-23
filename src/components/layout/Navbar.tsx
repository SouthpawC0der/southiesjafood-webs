"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, UserRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "@/components/cart/CartDrawer";

const NAV = [
  { href: "/menu",    label: "Menu" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen,   setCartOpen]   = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        {/* Flag stripe */}
        <div className="ja-stripe" />

        <div className="bg-[var(--paper)] border-b-2 border-[var(--ink)]">
          <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 h-[68px] flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="font-display text-[28px] leading-none text-[var(--ink)] tracking-wide shrink-0">
              SOUTHIE&apos;S<span className="text-[var(--green)]"> JA</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                    pathname === href
                      ? "text-[var(--green)] underline underline-offset-8 decoration-2"
                      : "text-[var(--text)] hover:text-[var(--green)]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <Link
                  href="/account"
                  aria-label="My account"
                  className="w-11 h-11 border-2 border-[var(--ink)] bg-[var(--white)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors cursor-pointer"
                >
                  <UserRound size={18} strokeWidth={2.25} />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center h-11 px-4 border-2 border-[var(--ink)] bg-[var(--white)] text-[13px] font-bold uppercase tracking-wider hover:bg-[var(--gold)] transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setCartOpen(true)}
                aria-label={`Open cart, ${itemCount} items`}
                className="relative w-11 h-11 border-2 border-[var(--ink)] bg-[var(--white)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors cursor-pointer"
              >
                <ShoppingBag size={18} strokeWidth={2.25} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-[var(--green)] border-2 border-[var(--ink)] text-white text-[10px] font-black flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              <Link
                href="/menu"
                className="hidden md:inline-flex btn-block btn-gold !py-3 !px-6 text-[13px]"
              >
                Order Now
              </Link>

              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
                className="md:hidden w-11 h-11 border-2 border-[var(--ink)] bg-[var(--white)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors cursor-pointer"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <nav
              className="md:hidden border-t-2 border-[var(--ink)] bg-[var(--paper)] px-8 py-4 flex flex-col gap-1"
              aria-label="Mobile"
            >
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`py-3 font-display text-2xl tracking-wide border-b-2 border-[var(--line-soft)] last:border-0 ${
                    pathname === href ? "text-[var(--green)]" : "text-[var(--ink)]"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href={isSignedIn ? "/account" : "/sign-in"}
                className="py-3 font-display text-2xl tracking-wide text-[var(--ink)] border-b-2 border-[var(--line-soft)]"
              >
                {isSignedIn ? "My Account" : "Sign In"}
              </Link>
              <Link href="/menu" className="btn-block btn-gold mt-4 w-full">
                Order Now
              </Link>
            </nav>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
