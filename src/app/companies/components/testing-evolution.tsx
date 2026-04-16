"use client";
import React from "react";
import Image from "next/image";
import CustomDot from "@/app/components/custom-dot";
import useScrollToSection from "@/hooks/useScrollToSection";
import { FeatureItem } from "@/interface/types";

const features: FeatureItem[] = [
  {
    title: "Pruebas con IA",
    asset: "/assets/Chip.svg",
    text: "Automatizamos casos y detectamos patrones de error para ampliar cobertura en menos tiempo.",
  },
  {
    title: "DevQAOps",
    asset: "/assets/devQaOps.svg",
    text: "Integramos calidad en tu pipeline DevOps con validaciones automáticas en cada entrega.",
  },
  {
    title: "Pruebas tempranas (Shift Left)",
    asset: "/assets/shift-left.svg",
    text: "Detectamos y corregimos errores temprano para reducir costos y acelerar el desarrollo.",
  },
  {
    title: "Pruebas con Dispositivos Móviles",
    asset: "/assets/pruebas-mobile.svg",
    text: "Validamos funcionalidad, rendimiento y experiencia en dispositivos reales del ecosistema móvil.",
  },
];

export default function TestingEvolution() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="testing-evolution-section"
      className="flex flex-col w-full md:py-14 overflow-x-hidden"
    >
      <section className="relative flex flex-col items-center w-full md:py-14 px-4">
        <div className="flex w-full p-4 md:p-9">
          <div className="flex items-center justify-between">
            <CustomDot
              baseSize="w-[82px] h-[82px]"
              lgSize="lg:w-[56px] lg:h-[56px]"
              color="bg-blue-1"
            />
          </div>
          <div className="flex justify-center w-full">
            <h2 className="text-pink-400 text-3xl md:text-5xl font-bold uppercase text-center">
              EVOLUCIÓN DE PRUEBAS
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl border-[7px] border-pink-400 rounded-[50px] p-6 md:p-10">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 text-pink-400 mb-4">
                  {feature.asset && (
                    <Image
                      src={feature.asset}
                      alt={feature.title}
                      width={156}
                      height={156}
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.text}</p>
              </div>
              {index < features.length - 1 && (
                <div
                  className="hidden md:block min-h-[200px] w-[18px] bg-pink-400"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center -mt-6">
          <button
            onClick={scrollToContact}
            className="bg-pink-400 text-white text-sm md:text-base font-medium py-3 px-6 rounded-full shadow-md hover:bg-pink-500 transition"
            aria-label="Agendar una llamada en la sección de contacto"
          >
            AGENDA UNA LLAMADA
          </button>
        </div>
      </section>
    </section>
  );
}
