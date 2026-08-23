"use client";
import { usePathname } from "next/navigation";
import Header from "./header/header";
import Footer from "./footer/footer";
import RecaptchaProvider from "./recaptcha-provider";

interface SiteChromeProps {
  children: React.ReactNode;
}

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const hideGlobalChrome =
    pathname === "/quality-pulse" ||
    pathname?.startsWith("/quality-pulse/") ||
    pathname === "/administracion" ||
    pathname?.startsWith("/administracion/");

  return (
    <>
      {!hideGlobalChrome && <Header />}
      <RecaptchaProvider>
        <main style={{ flex: 1 }}>{children}</main>
      </RecaptchaProvider>
      {!hideGlobalChrome && <Footer />}
    </>
  );
}
