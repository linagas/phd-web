"use client";
import React, { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "El Costo Silencioso", href: "/#dolor" },
  { label: "Diferencia PHD", href: "/#diferencia" },
  { label: "Portafolio", href: "/#servicios" },
  { label: "Autoevaluar AQI", href: "/#aqi-tool" },
  { label: "Roadmap", href: "/#viaje" },
];

function PhdLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="w-3.5 h-3.5 rounded-full bg-phd-cyan" />
        <span className="w-3.5 h-3.5 rounded-full bg-phd-pink" />
        <span className="w-3.5 h-3.5 rounded-full bg-phd-purple" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading font-bold text-white text-lg tracking-tight">PHD</span>
        <span className="font-body text-slate-400 text-[10px] tracking-widest uppercase mt-0.5">
          Quality Engineering
        </span>
      </div>
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 sm:px-8 lg:px-16 bg-phd-dark/80 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-3">
        <PhdLogo />
      </Link>

      {/* Nav desktop */}
      <nav className="hidden sm:flex items-center gap-6">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-slate-300 hover:text-phd-cyan transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* CTA desktop */}
      <Link
        href="/#bookings"
        className="hidden sm:flex items-center gap-2 bg-phd-pink hover:bg-phd-pink/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-phd-pink/20"
      >
        AGENDAR QUALITY PULSE
        <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">72 HRS</span>
      </Link>

      {/* Toggle mobile */}
      <button
        className="sm:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMenuOpen}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
          />
        </svg>
      </button>

      {/* Nav mobile */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-20 left-0 right-0 bg-phd-dark/95 backdrop-blur-md border-b border-white/5 flex flex-col gap-4 p-6">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-slate-300 hover:text-phd-cyan transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#bookings"
            className="mt-2 flex items-center justify-center gap-2 bg-phd-pink text-white text-sm font-semibold px-5 py-3 rounded-full"
            onClick={() => setIsMenuOpen(false)}
          >
            AGENDAR QUALITY PULSE
            <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">72 HRS</span>
          </Link>
        </div>
      )}
    </header>
  );
}
