"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import "aos/dist/aos.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";
import CustomDot from "@/app/components/custom-dot";

const People: React.FC = () => {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );
  useEffect(() => {
    AOS.init();
  }, []);

  const robotSvg = "/assets/imagen-computador.svg";

  return (
    <section className="min-h-screen mt-14 flex justify-center ">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative h-full">
          {/* <!-- Capa de la imagen de fondo --> */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("/assets/curva-fucsia.svg")`,
              marginTop: "300px",
              zIndex: -1,
            }}
          ></div>

          {/* <!-- Capa del contenido --> */}
          <div className="relative flex flex-col items-center h-full">
            {/* <!-- Primera fila: dos columnas --> */}
            <div className="flex w-full  p-4">
              <div className="flex flex-col justify-center md:justify-start align-centerw-1/2 p-4 md:pl-16">
                <h2 className="text-center md:text-left text-blue-1 font-bold text-2xl md:text-4xl ">
                  Elevate Your Skills
                </h2>
                <p className="text-center md:text-left py-4 mt-4 max-w-md">
                  Nuestros servicios de aseguramiento de calidad te ayudan a
                  entregar software confiable y de alto rendimiento
                </p>
                <Link
                  href="#"
                  onClick={scrollToContact}
                  className="inline-flex w-full md:w-48 text-white items-center justify-center rounded-[4px] bg-blue-1 px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Contáctanos
                </Link>
              </div>
              <div className="w-full p-4 hidden md:block">
                <div className="flex flex-row-reverse">
                  <article className="flex justify-end">
                    <div className="flex justify-end pt-8 pr-8">
                      {/* punto fucsia */}
                      <CustomDot
                        baseSize="w-[34px] h-[34px]"
                        lgSize="lg:w-[56px] lg:h-[56px]"
                        color="bg-pink-400"
                      />
                    </div>
                  </article>
                  <Image
                    src={robotSvg}
                    width={600}
                    height={500}
                    alt="Software Quality Services"
                    className="rounded-lg"
                    style={{
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "bottom",
                    }}
                    data-aos="fade-left"
                  />
                </div>
              </div>
            </div>
            {/* <!-- Segunda fila: dos columnas --> */}
            <div className="flex w-full p-4 mt-4">
              <CustomDot
                baseSize="w-[34px] h-[34px]"
                lgSize="lg:w-[56px] lg:h-[56px]"
                color="bg-white"
              />
            </div>

            <section className="flex justify-center h-[1692px] items-center mt-16 rounded-[50px] bg-white max-w-screen-lg w-full">
              <div className="flex-col w-full ">
                <h2 className="text-center text-[#F14578] font-bold text-3xl md:text-4xl">
                  ¿Por qué elegirnos?
                </h2>
                <hr className="border-t-2 border-[#F14578] my-4 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {/* Ítem 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      {/* Placeholder para ícono */}
                      <span className="text-xl font-bold">🌟</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Calidad
                      <br />
                      Garantizada
                    </h3>
                  </div>
                  {/* Ítem 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">⚡</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Alta
                      <br />
                      Eficiencia
                    </h3>
                  </div>
                  {/* Ítem 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">🔒</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Seguridad
                      <br />
                      Confiable
                    </h3>
                  </div>
                  {/* Ítem 4 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">💡</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Innovación
                      <br />
                      Constante
                    </h3>
                  </div>
                  {/* Ítem 5 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">🤝</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Soporte
                      <br />
                      Dedicado
                    </h3>
                  </div>
                  {/* Ítem 6 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">🌍</span>
                    </div>
                    <h3 className="mt-4 text-[#1E1E1E] font-bold">
                      Alcance
                      <br />
                      Global
                    </h3>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <article
          id="section-5"
          className="flex flex-col items-center p-4 md:p-8"
        >
          <Contact />
        </article>
      </div>
    </section>
  );
};

export default People;
