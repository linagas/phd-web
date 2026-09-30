import type { Metadata } from "next";
import "./globals.css";
import { fontBody, fontHeading } from "./ui/fonts";
import AosInit from "./ui/aos-init";
import SiteChrome from "./ui/site-chrome";

export const metadata: Metadata = {
  title: "PHD - Conexiones que construyen",
  description: "Conexiones que construyen.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "PHD - Conexiones que construyen",
    description: "Conexiones que construyen.",
    locale: "es_CL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary_large_image",
    title: "PHD - Conexiones que construyen",
    description: "Conexiones que construyen.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-white min-h-screen flex flex-col overflow-x-hidden`}
      >
        <AosInit />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
