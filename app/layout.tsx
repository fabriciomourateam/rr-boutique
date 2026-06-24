import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "RR Boutiques — Moda Feminina",
  description: "Estilo, elegância e confiança. Moda feminina RR Boutiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
