import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mía Pastas Bella | Pastas Artesanales Gourmet",
  description:
    "E-commerce de pastas frescas artesanales de autor. Tallarines, sorrentinos, ravioles, ñoquis, tortellinis y salsas caseras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-crema-100 text-terracota-900 antialiased selection:bg-terracota-200 selection:text-terracota-900">
        {children}
      </body>
    </html>
  );
}
