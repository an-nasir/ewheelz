// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const BASE_URL = "https://ewheelz.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "eWheelz — Pakistan EV Intelligence Platform",
    // Avoid "eWheelz | eWheelz" — page titles should NOT include "eWheelz"
    template: "%s | eWheelz Pakistan",
  },
  description:
    "Compare EVs, explore battery tech, find charging stations, and buy/sell electric vehicles in Pakistan. The #1 EV resource for Pakistani buyers.",
  keywords: ["electric vehicles Pakistan", "EV comparison", "charging stations Pakistan", "BYD Pakistan", "MG ZS EV"],
  authors: [{ name: "eWheelz" }],
  creator: "eWheelz",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: BASE_URL,
    siteName: "eWheelz",
    title: "eWheelz — Pakistan EV Intelligence Platform",
    description:
      "Compare EVs, explore battery tech, find 20+ charging stations across Pakistan. Your complete EV buying guide.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "eWheelz — Pakistan EV Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eWheelz — Pakistan EV Intelligence Platform",
    description:
      "Compare EVs, explore battery tech, find 20+ charging stations across Pakistan.",
    images: ["/og-default.png"],
    creator: "@eWheelzPK",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{
          background: "#F6F8FF",
          color: "#0F172A",
          fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif",
        }}
      >
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
