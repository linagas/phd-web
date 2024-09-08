import Link from "next/link";
import Image from "next/image";
import { InstagramIcon, LinkedinIcon } from "../rrss-icons";

export default function Footer() {
  const logoUrl = "/assets/phd-white-300x.png";
  return (
    <footer className="bg-purple-400 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image
            width={80}
            height={80}
            src={logoUrl}
            alt="PHD - Conexiones que construyen"
            className="h-8 w-auto px-4"
          />
          <span>
            2024 PHD - Conexiones que contruyen. Todos los derechos reservados.
          </span>
        </div>
        <div className="flex gap-x-1.5">
          <Link href="https://www.instagram.com/phdchilespa/">
            <InstagramIcon className="h-8 w-8" />
          </Link>
          <Link href="https://www.linkedin.com/company/phd-chile-spa">
            <LinkedinIcon className="h-8 w-8" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
