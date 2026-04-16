"use client";
import React from "react";
import Image from "next/image";
import ContactButton from "@/app/components/contact-button";
import useScrollToSection from "@/hooks/useScrollToSection";

export default function ConsultingInfo() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="consulting-info-section"
      className="flex flex-col md:flex-row justify-between pt-48 md:pt-24 pb-12 md:pb-16 px-4 md:px-8 gap-8 md:gap-12 bg-cover"
      style={{
        backgroundImage: `url('/assets/background-pink.svg')`,
      }}
    >
      <article className="flex-1 flex justify-center md:justify-end order-2 md:order-1">
        <Image
          src="/assets/consulting-info.svg"
          width={600}
          height={600}
          alt="Capacitación en testing y calidad de software"
          className="rounded-lg"
          data-aos="fade-up"
        />
      </article>
      <article className="flex-1 order-1 md:order-2">
        <div className="flex flex-col justify-start w-full">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 mt-12 md:mt-12">
            Capacitaciones en Calidad de Software
          </h2>
          <p className="text-white text-base md:text-lg leading-relaxed mb-8">
            Invierte en tu formación y conviértete en un referente en calidad
            de software. Nuestras capacitaciones te brindan las herramientas
            que necesitas para avanzar, en un entorno donde tu crecimiento es
            nuestra prioridad. ¡Hablemos y planifiquemos tu desarrollo!
          </p>
          <ContactButton onClick={scrollToContact} variant="secondary" />
        </div>
      </article>
    </section>
  );
}
