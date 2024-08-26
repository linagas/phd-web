import Link from "next/link";
import { InstagramIcon } from "../instagram-icon";

export default function Footer() {
  const logoUrl = "/assets/phd-white-300x.png";
    return (
      <footer className="bg-purple-400 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
          <img src={logoUrl} alt="PHD - Conexiones que construyen" className="h-8 w-auto px-4" />
            <span> 2024 PHD - Conexiones que contruyen. Todos los derechos reservados.</span>
          </div>
          <Link href="https://www.instagram.com/phdchilespa/">
            <InstagramIcon className="h-8 w-8" />
          </Link>
        </div>
      </footer>
    );
  }