import type { Metadata } from "next";
import { Bebas_Neue, Inter, Space_Mono } from "next/font/google";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fly Intelligence — Pretty Fly Operator Co-pilot",
  description:
    "AI-powered internal dashboard for Pretty Fly streetwear brand operations.",
  icons: {
    icon: "/fly-intelligence-logo.png",
    apple: "/fly-intelligence-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebas.variable} ${spaceMono.variable} ${inter.variable} min-h-screen bg-background`}
      >
        <TopNav />
        {children}
      </body>
    </html>
  );
}
