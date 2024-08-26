"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // reference to the logo image in the public folder
  const logoUrl = "/assets/phd-300x.png";
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-blue-500 text-white px-4 sm:px-16 lg:px-16 h-16 sm:h-20 flex items-center justify-between shadow-sm">
      <Link href="#" className="flex items-center justify-center">
        <Image
          src={logoUrl}
          width={220}
          height={60}
          alt="PHD - Conexiones que construyen"
          className="h-6 sm:h-8 w-auto"
        />
      </Link>
      <div className="flex flex-col sm:flex-row items-center">
        <button
          className="sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {/* Icono del menú de hamburguesa */}
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        <nav
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } sm:flex opacity-100 flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center transition-opacity duration-500 ease-in-out bg-black bg-opacity-50 sm:bg-opacity-0 p-4 md:pl-20 lg:pl-20 sm:p-0 rounded-lg sm:rounded-none`}
        >
          <Link
            href="#"
            className="text-xs sm:text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            EMPRESAS
          </Link>
          <Link
            href="#"
            className="text-xs sm:text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            PERSONAS
          </Link>
          <Link
            href="#"
            className="text-xs sm:text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            NOSOTROS
          </Link>
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            CONTACTO
          </Link>
        </nav>
      </div>
    </header>
  );
}
