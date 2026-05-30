import type { Metadata } from "next";
import localFont from "next/font/local";
import { Orbitron, Chakra_Petch } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const cyberAliens = localFont({
  src: "./fonts/cyber-aliens.ttf",
  variable: "--font-cyber-aliens",
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fatal Muuudel 🛸🐄",
  description:
    "Sistema de seleção de espécimes bovinos para abdução. Tinder para ETs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cyberAliens.variable} ${orbitron.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
