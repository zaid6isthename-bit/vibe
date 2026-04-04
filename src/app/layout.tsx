import type { Metadata } from "next";
import { DM_Sans, Newsreader, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PersistentBackground from '@/components/PersistentBackground';
import ThemeEngine from '@/components/ThemeEngine';

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroOS | Cognitive Environment",
  description: "Advanced attention-aware learning and decision system powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${dmSans.variable}
        ${newsreader.variable}
        ${spaceGrotesk.variable}
        ${jetbrainsMono.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col bg-transparent">
        {/* Global theme engine: applies CSS vars from wallet state to :root */}
        <ThemeEngine />
        {/* Persistent 3D Prism background across all navigation */}
        <PersistentBackground />
        {children}
      </body>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
    </html>
  );
}
