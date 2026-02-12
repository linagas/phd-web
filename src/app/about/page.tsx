"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import "aos/dist/aos.css";
import AOS from "aos";
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
              height: "920px",
            }}
          ></div>

          {/* <!-- Capa del contenido --> */}
          <div className="relative flex flex-col items-center h-full">
            {/* <!-- Primera fila: dos columnas --> */}
            <div className="flex w-full  p-4">
              <div className="flex flex-col justify-center md:justify-start align-centerw-1/2 p-4 md:pl-16">
                <h2 className="text-center md:text-left text-blue-1 font-bold text-2xl md:text-4xl ">
                  Cercanía, experiencia y soluciones reales para impulsar tus
                  proyectos
                </h2>
                <p className="text-center md:text-left py-4 mt-4 max-w-md">
                  Trabajamos contigo, no para ti: nos integramos como parte de
                  tu equipo.
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
                    width={400}
                    height={400}
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

            <section className="flex justify-center mt-16 rounded-[50px] bg-white max-w-screen-lg w-full border-[9px] border-solid border-[#FF3365]">
              <div className="flex-col w-full p-12 md:p-16">
                <h2 className="text-center text-[#F14578] font-bold text-4xl md:text-4xl ">
                  ¿Por qué elegirnos?
                </h2>
                <hr className="border-t-8 border-[#F14578] my-4 w-full" />
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  {/* Ítem 1 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className="  rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/calidad-experiencia.svg"
                        alt="Calidad y experiencia"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h2
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Calidad <br />y experiencia
                    </h2>
                  </div>
                  {/* Ítem 2 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className=" rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/felixibilidad-aprendizaje.svg"
                        alt="Calidad y experiencia"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h3
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Flexibilidad <br /> en la contratación
                    </h3>
                  </div>
                  {/* Ítem 3 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className="rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/enfoque-practico.svg"
                        alt="Enfoque Practico"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h3
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Enfoque práctico <br /> y colaborativo
                    </h3>
                  </div>
                  {/* Ítem 4 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className=" rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/recuersos-ac.svg"
                        alt="Recurso de aprendizaje completo"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h3
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Recursos y <br />
                      herramientas completos
                    </h3>
                  </div>
                  {/* Ítem 5 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className="rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/certificacion-reconocida.svg"
                        alt="Certificación reconocida"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h3
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Reputación <br /> y confianza
                    </h3>
                  </div>
                  {/* Ítem 6 */}
                  <div className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8">
                    <div className="  rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/acompañamiento-ws.svg"
                        alt="Acompañamiento a través de WhatsApp"
                        width={173}
                        height={125}
                      />
                    </div>
                    <h3
                      className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                    >
                      Acompañamiento <br /> cercano y ágil
                    </h3>
                  </div>
                </div>
              </div>
            </section>
            <article
              id="section-5"
              className="flex flex-col items-center p-4 md:p-8"
            >
              <Contact />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default People;
