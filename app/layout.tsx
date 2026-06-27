import type { Metadata, Viewport } from "next";
import { Cormorant, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — Horolith",
    default: "Horolith",
  },
  description:
    "Une collection de montres d'exception. Ouvrez des packs, découvrez les Maisons, complétez votre binder.",
  keywords: ["horlogerie", "collection", "gacha", "cartes"],
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0B0C0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
