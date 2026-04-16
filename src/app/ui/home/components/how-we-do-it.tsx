"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import CustomDot from "@/app/components/custom-dot";
import useScrollToSection from "@/hooks/useScrollToSection";

export default function HowWeDoIt() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <div>
      <section className="flex flex-col md:flex-row justify-between pt-12 md:py-16 gap-8 md:gap-12">
        <article className="flex-1">
          <div className="flex flex-col justify-start w-full max-w-2xl px-4 md:px-0">
            <h2 className="text-2xl md:text-5xl font-bold text-purple-12 mb-6">
              Cómo lo Hacemos
            </h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
              En PHD, nos especializamos en adaptar nuestros servicios de
              calidad a las necesidades particulares de cada cliente. Aplicamos
              un enfoque flexible y ágil, combinando las mejores prácticas del
              mercado con soluciones innovadoras. Desde la planificación hasta
              la puesta en marcha, trabajamos en estrecha colaboración contigo
              para asegurar que cada prueba se realice de manera eficiente,
              brindando resultados que agregan valor a tu negocio.
            </p>
            <Link
              className="bg-purple-12 inline-flex w-48 text-white items-center justify-center rounded-[4px] px-4 py-2 text-xl font-medium shadow transition-colors hover:bg-purple-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              href="#"
              onClick={scrollToContact}
              prefetch={false}
            >
              Contáctanos
            </Link>
          </div>
        </article>
        <article className="flex-1 hidden md:flex justify-center">
          <Image
            src="/assets/svg-como-lo-hacemos.svg"
            width={530}
            height={520}
            alt="Equipo colaborando en metodología ágil de calidad de software"
            className="rounded-lg"
            data-aos="fade-up"
          />
        </article>
      </section>
      <div className="flex justify-end pt-4 pr-4 md:pr-8">
        <CustomDot baseSize="w-[32px] h-[32px]" color="bg-purple-12" />
      </div>
    </div>
  );
}
