import type { Metadata } from "next";
import "./globals.css";
import { fontBody, fontHeading } from "./ui/fonts";
import Header from "./ui/header/header";
import Footer from "./ui/footer/footer";

export const metadata: Metadata = {
  title: "PHD",
  description: "Conexiones que contruyen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>PHD</title>
      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased`}
        style={{
          backgroundColor: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
