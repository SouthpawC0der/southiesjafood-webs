import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const EXPLORE = [
  ["/",        "Home"],
  ["/menu",    "Menu"],
  ["/about",   "About"],
  ["/contact", "Catering"],
];

const SUPPORT = [
  ["/sign-in",        "Sign In"],
  ["/sign-up",        "Create Account"],
  ["/privacy-policy", "Privacy Policy"],
];

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-white">
      {/* Flag stripe */}
      <div className="ja-stripe" />

      <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Brand */}
        <div className="md:col-span-5">
          <p className="font-display text-4xl tracking-wide mb-1">
            SOUTHIE&apos;S<span className="text-[var(--gold)]"> JA FOODS</span>
          </p>
          <p className="text-white/55 text-sm leading-relaxed max-w-sm mt-4">
            Authentic Jamaican catering and to-go orders in Charlotte, NC. Slow-cooked classics, bold modern twists — made fresh, every day.
          </p>
        </div>

        {/* Explore */}
        <div className="md:col-span-2">
          <h5 className="font-display text-lg tracking-widest text-[var(--gold)] mb-4">EXPLORE</h5>
          <ul className="space-y-2.5">
            {EXPLORE.map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-white/65 hover:text-[var(--gold)] transition-colors font-semibold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="md:col-span-2">
          <h5 className="font-display text-lg tracking-widest text-[var(--gold)] mb-4">SUPPORT</h5>
          <ul className="space-y-2.5">
            {SUPPORT.map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-white/65 hover:text-[var(--gold)] transition-colors font-semibold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="md:col-span-3">
          <h5 className="font-display text-lg tracking-widest text-[var(--gold)] mb-4">FIND US</h5>
          <ul className="space-y-3">
            <li>
              <a href="tel:+17049956714" className="flex items-center gap-3 text-sm text-white/65 hover:text-[var(--gold)] transition-colors font-semibold">
                <Phone size={15} className="shrink-0" /> (704) 995-6714
              </a>
            </li>
            <li>
              <a href="mailto:eats@southiesjafood.com" className="flex items-center gap-3 text-sm text-white/65 hover:text-[var(--gold)] transition-colors font-semibold">
                <Mail size={15} className="shrink-0" /> eats@southiesjafood.com
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm text-white/65 font-semibold">
              <MapPin size={15} className="shrink-0" /> Charlotte, NC
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-5 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-white/35 text-xs font-semibold">
            © {new Date().getFullYear()} Southie&apos;s Ja Foods — All rights reserved
          </p>
          <p className="text-white/35 text-xs font-semibold uppercase tracking-wider">
            Out of many, one flavor.
          </p>
        </div>
      </div>
    </footer>
  );
}
