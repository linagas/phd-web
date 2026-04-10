"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import useScrollToSection from "@/hooks/useScrollToSection";
import CustomDot from "@/app/components/custom-dot";

const People: React.FC = () => {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  const robotSvg = "/assets/imagen-computador.svg";
  const whyChooseItems = [
    {
      title: (
        <>
          Calidad <br /> y experiencia
        </>
      ),
      image: "/assets/calidad-experiencia.svg",
      alt: "Icono de calidad y experiencia",
    },
    {
      title: (
        <>
          Flexibilidad <br /> en la contratación
        </>
      ),
      image: "/assets/felixibilidad-aprendizaje.svg",
      alt: "Icono de flexibilidad en la contratación",
    },
    {
      title: (
        <>
          Enfoque práctico <br /> y colaborativo
        </>
      ),
      image: "/assets/enfoque-practico.svg",
      alt: "Icono de enfoque práctico y colaborativo",
    },
    {
      title: (
        <>
          Recursos y <br /> herramientas completos
        </>
      ),
      image: "/assets/recuersos-ac.svg",
      alt: "Icono de recursos y herramientas",
    },
    {
      title: (
        <>
          Reputación <br /> y confianza
        </>
      ),
      image: "/assets/certificacion-reconocida.svg",
      alt: "Icono de reputación y confianza",
    },
    {
      title: (
        <>
          Acompañamiento <br /> cercano y ágil
        </>
      ),
      image: "/assets/acompañamiento-ws.svg",
      alt: "Icono de acompañamiento cercano y ágil",
    },
  ];

  return (
    <section className="min-h-screen mt-14 flex justify-center">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative h-full">
          {/* <!-- Capa de la imagen de fondo --> */}
          <div
            className="absolute inset-0 bg-cover bg-center mt-[300px] h-[920px]"
            style={{
              backgroundImage: `url("/assets/curva-fucsia.svg")`,
              zIndex: -1,
            }}
          ></div>

          {/* <!-- Capa del contenido --> */}
          <div className="relative flex flex-col items-center h-full">
            {/* <!-- Primera fila: dos columnas --> */}
            <div className="flex w-full flex-col md:flex-row p-4">
              <div className="flex w-full md:w-1/2 flex-col justify-center md:justify-start items-center md:items-start p-4 md:pl-16">
                <h1 className="text-center md:text-left text-blue-1 font-bold text-5xl md:text-4xl mb-6">
                  Cercanía, experiencia y soluciones reales para impulsar tus
                  proyectos
                </h1>
                <p className="text-center md:text-left py-4 mt-4 max-w-md">
                  Trabajamos contigo, no para ti: nos integramos como parte de
                  tu equipo.
                </p>
                <Link
                  href="#section-contact"
                  onClick={scrollToContact}
                  className="inline-flex w-full md:w-48 text-white items-center justify-center rounded-[4px] bg-blue-1 px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Ir a la sección de contacto"
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
                    alt="Ilustración de servicios de calidad de software"
                    className="rounded-lg"
                    style={{
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "bottom",
                    }}
                    data-aos="fade-left"
                    priority
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

            <section className="flex justify-center mt-16 rounded-[50px] bg-white max-w-screen-lg w-full border-[9px] border-solid border-pink-400">
              <div className="flex-col w-full p-12 md:p-16">
                <h2 className="text-center text-pink-400 font-bold text-4xl md:text-4xl ">
                  ¿Por qué elegirnos?
                </h2>
                <hr className="border-t-8 border-[#F14578] my-4 w-full" />
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  {whyChooseItems.map((item) => (
                    <div
                      key={item.alt}
                      className="flex flex-col items-center text-center w-full sm:w-[48%] lg:w-[48%] p-8"
                    >
                      <div className="rounded-full flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          width={173}
                          height={125}
                        />
                      </div>
                      <h3
                        className="mt-4 text-[#1E1E1E] font-bold leading-none text-center text-xl md:text-2xl lg:text-3xl"
                        style={{ fontSize: "clamp(1.5rem, 2.5vw, 45px)" }}
                      >
                        {item.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <article className="flex flex-col items-center p-4 md:p-8">
              <Contact />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default People;
