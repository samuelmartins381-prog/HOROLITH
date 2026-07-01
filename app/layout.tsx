import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import Providers from "./Providers";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${bodoniModa.variable} ${interTight.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
