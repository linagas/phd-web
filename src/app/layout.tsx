import type { Metadata } from "next";
import "./globals.css";
import { fontBody, fontHeading } from "./ui/fonts";
import Header from "./ui/header/header";
import Footer from "./ui/footer/footer";
import Maintenance from "./ui/maintenance/maintenance";
import HomeLayout from "./ui/home/layout";
import Home from "./ui/home/page";

export const metadata: Metadata = {
  title: "PHD",
  description: "Conexiones que contruyen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showMaintenance =
    process.env.NODE_ENV !== "development" &&
    process.env.MAINTENANCE_MODE === "true";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>PHD</title>
      </head>
      <body
        className={`${(fontHeading.variable, fontBody.variable)} antialiased`}
        style={{ backgroundColor: "#fff" }}
      >
        {showMaintenance ? (
          <Maintenance />
        ) : (
          <HomeLayout>
            <Home />
          </HomeLayout>
        )}
      </body>
    </html>
  );
}
