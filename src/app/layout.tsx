import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Toaster } from "@/components/ui/Toaster";
import { AnnouncementPopup } from "@/components/ui/AnnouncementPopup";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Southie's Ja Foods | Authentic Jamaican Catering & To-Go · Charlotte, NC",
  description:
    "Bold, authentic Jamaican food in Charlotte — jerk chicken, oxtail, curry goat, and modern island twists. Order to-go online or book full-service catering for your next event.",
  keywords: ["Jamaican food", "catering", "Charlotte NC", "jerk chicken", "oxtail", "Southie's Ja Foods"],
  openGraph: {
    title: "Southie's Ja Foods",
    description: "Authentic Jamaican Catering & To-Go Orders · Charlotte, NC",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${bebas.variable} ${sourceSans.variable}`}>
        <body>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster />
            <AnnouncementPopup />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
