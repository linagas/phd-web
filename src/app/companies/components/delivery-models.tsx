"use client";
import React from "react";
import useScrollToSection from "@/hooks/useScrollToSection";

const flexValueItems = [
  "Demanda variable de testing",
  "Apoyo puntual en iniciativas",
  "Procesos de transformación",
  "Optimizar costos con calidad",
  "Sin equipo full-time",
  "Área de calidad en formación",
];

const flexValueDiff = [
  "Flexibilidad y costo controlado",
  "Prioridad en áreas clave",
  "Activación según necesidad",
  "Ideal para entornos ágiles",
];

const dedicatedItems = [
  "Soporte continuo y estable",
  "Equipos de desarrollo activos",
  "Madurar prácticas de calidad",
  "Estrategia en QE",
  "Cultura de calidad sólida",
];

const dedicatedDiff = [
  "Integración con el equipo",
  "Continuidad y experiencia",
  "Evolución de procesos",
  "Enfoque estratégico",
];

export default function DeliveryModels() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Tarjeta Flex Value */}
          <article
            className="bg-white rounded-3xl shadow-lg overflow-hidden"
            data-aos="fade-up"
          >
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-8 text-white">
              <span className="inline-block bg-white text-blue-500 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                Flexible
              </span>
              <h3 className="text-3xl font-bold mb-2">PHD Flex Value</h3>
              <p className="text-blue-50 text-lg">Bolsa de horas mensual</p>
            </div>

            <div className="p-8">
              <p className="text-gray-700 text-lg mb-6">
                Acceso flexible a Quality Engineering según la demanda de tu
                equipo.
              </p>

              <div className="mb-6">
                <h4 className="text-blue-500 font-bold text-lg mb-4">
                  ¿Para quién es?
                </h4>
                <ul className="space-y-3">
                  {flexValueItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1" aria-hidden="true">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-blue-500 font-bold text-lg mb-4">
                  Valor diferencial
                </h4>
                <ul className="space-y-3">
                  {flexValueDiff.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1" aria-hidden="true">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={scrollToContact}
                  className="flex-1 bg-blue-1 text-white font-semibold py-3 px-6 rounded-[8px] transition-colors flex items-center justify-center gap-2"
                >
                  Hablar con PHD
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>
          </article>

          {/* Tarjeta Dedicated Quality */}
          <article
            className="bg-white rounded-3xl shadow-lg overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="bg-gradient-to-r from-pink-400 to-red-400 p-8 text-white">
              <span className="inline-block bg-white text-pink-500 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                Mensual
              </span>
              <h3 className="text-3xl font-bold mb-2">
                PHD Dedicated Quality
              </h3>
              <p className="text-pink-50 text-lg">Servicio mensual dedicado</p>
            </div>

            <div className="p-8">
              <p className="text-gray-700 text-lg mb-6">
                Acompañamiento continuo con{" "}
                <strong>equipo de Quality Engineering dedicado.</strong>
              </p>

              <div className="mb-6">
                <h4 className="text-pink-500 font-bold text-lg mb-4">
                  ¿Para quién es?
                </h4>
                <ul className="space-y-3">
                  {dedicatedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1" aria-hidden="true">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-pink-500 font-bold text-lg mb-4">
                  Valor diferencial
                </h4>
                <ul className="space-y-3">
                  {dedicatedDiff.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1" aria-hidden="true">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mt-8">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Si buscas flexibilidad mes a mes, Flex
                  Value es ideal. Para continuidad y madurez, Dedicated Quality
                  es el camino.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
