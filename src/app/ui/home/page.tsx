"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import "aos/dist/aos.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";
import Card from "@/app/components/card";

export default function Home() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );
  useEffect(() => {
    AOS.init();
  }, []);

  const robotSvg = "/assets/robot.svg";

  return (
    <section className="min-h-screen mt-14 flex justify-center ">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative">
          <div className="absolute inset-0 background-blue z-0"></div>

          <div className="relative p-4 flex flex-col md:flex-row z-10">
            <div className="flex flex-col justify-center md:justify-start align-center md:w-1/2 md:pl-16">
              <h2 className="text-center md:text-left text-blue-1 font-bold text-2xl md:text-4xl ">
                Calidad de software que impulsa tu crecimiento
              </h2>
              <p className="text-center md:text-left py-4 mt-4 max-w-md">
                Seamos tus partners estratégicos en la evolución de tus
                procesos.
              </p>
              <Link
                href="#"
                onClick={scrollToContact}
                className="inline-flex w-full md:w-48 text-white items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Contáctanos
              </Link>
            </div>
            <div className="flex justify-end md:w-1/2">
              <div
                className="mt-4 md:mt-0  hidden md:block"
                data-aos="fade-left"
              >
                <div className="flex flex-row-reverse">
                  <article className="flex justify-end">
                    <div className="flex justify-end pt-8 pr-8">
                      {/* punto fucsia */}
                      <div className="justify-self-end">
                        <div className="w-[34px] h-[34px] lg:w-[56px] lg:h-[56px] rounded-full bg-pink-400" />
                      </div>
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="background-blue">
          <article
            id="section-2"
            className="p-5 rounded-lg flex flex-col items-center "
          >
            <div className="w-full text-center">
              <h2 className="text-white font-bold text-2xl md:text-4xl">
                Nuestro Enfoque
              </h2>
            </div>
            <div className="w-full flex flex-wrap justify-center mt-4 gap-6 md:gap-14">
              {services.map((service, index) => (
                <Card
                  key={index}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  data-aos="fade-up"
                  className="flex-grow-0 flex-shrink-0 w-full md:w-1/3 lg:w-1/4 max-w-xs"
                />
              ))}
            </div>
            <div className="w-full flex py-20 pl-8 flex  justify-start md:flex-row gap-x-4 pr-8 ">
              <div className="justify-self-end pt-4 pr-8">
                <div className={`w-[52px] h-[52px] rounded-full bg-white`} />
              </div>
            </div>
          </article>
        </div>
        <article
          id="section-3"
          className="flex flex-col items-center pt-72 md:p-8"
        >
          <HowWeDoIt />
        </article>
        <article id="section-4" className="flex flex-col items-center ">
          <ConsultingInfo />
        </article>
        <article
          id="section-5"
          className="flex flex-col items-center p-4 md:p-8"
        >
          <Contact />
        </article>
      </div>
    </section>
  );
}

// /**
//  *Aqui tengo que arreglar esto
//  *

function ConsultingInfo() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="consulting-info-section"
      className="flex justify-between py-14"
      style={{
        backgroundImage: `url('/assets/background-pink.svg')`,
        backgroundSize: "cover",
        zIndex: 9,
      }}
    >
      <article className="flex-1  flex justify-center hidden md:block">
        <Image
          src={"/assets/consulting-info.svg"}
          width={600}
          height={600}
          alt="Software Quality Services"
          className="rounded-lg"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
          }}
          data-aos="fade-up"
        />
      </article>
      <article className="flex-1 ">
        <div className=" flex flex-col justify-center align-center w-auto">
          <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold text-white pt-20">
            Capacitaciones en Calidad de Software
          </h1>
          <p className="text-white py-3 text-center md:text-left text-balance">
            Invierte en tu formación y conviértete en un referente en calidad de
            software. Nuestras capacitaciones te brindan las herramientas que
            necesitas para avanzar, en un entorno donde tu crecimiento es
            nuestra prioridad. ¡Hablemos y planifiquemos tu desarrollo!
          </p>
          <Link
            className="inline-flex self-center md:self-left  w-48 text-white items-center justify-center rounded-[4px] bg-blue-1 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            href="#"
            onClick={scrollToContact}
            prefetch={false}
          >
            Cont&aacute;ctanos
          </Link>
        </div>
      </article>
    </section>
  );
}

function HowWeDoIt() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );
  return (
    <div>
      <section className="flex justify-between py-14">
        <article className="flex-1 ">
          <div className="flex flex-col justify-center align-center w-auto">
            <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold text-purple-12 pt-20">
              Cómo lo Hacemos
            </h1>
            <p className=" py-4 text-center md:text-left text-balance">
              En PHD, nos especializamos en adaptar nuestros servicios de
              calidad a las necesidades particulares de cada cliente. Aplicamos
              un enfoque flexible y ágil, combinando las mejores prácticas del
              mercado con soluciones innovadoras. Desde la planificación hasta
              la ejecución, trabajamos en estrecha colaboración contigo para
              asegurar que cada prueba funcional o no funcional se realice con
              precisión y eficiencia, brindando resultados que realmente agregan
              valor a tu negocio.
            </p>
            <Link
              className="bg-purple-12 inline-flex self-center md:self-left w-48 text-white items-center justify-center rounded-[4px] px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              href="#"
              onClick={scrollToContact}
              prefetch={false}
            >
              Cont&aacute;ctanos
            </Link>
          </div>
        </article>
        <article className="flex-1  flex justify-center hidden md:block ">
          <Image
            src={"/assets/svg-como-lo-hacemos.svg"}
            width={530}
            height={520}
            alt="Software Quality Services"
            className="rounded-lg"
            style={{
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "bottom",
            }}
            data-aos="fade-up"
          />
        </article>
      </section>
      <section className="relative pl-8 flex justify-start md:flex-row gap-x-4 pr-16">
        <div className="absolute bottom-0 right-0 flex-none w-20 pt-4 pr-8">
          {/* punto */}
          <div className="justify-self-end">
            <div className="w-[32px] h-[32px] rounded-full bg-purple-12" />
          </div>
        </div>
      </section>
    </div>
  );
}

const services = [
  {
    icon: (
      <Image
        src={"/assets/sdlc-consulting.svg"}
        width={92}
        height={92}
        alt={""}
      />
    ),
    title: "Consultoría de SDLC",
    description:
      "Transforma tu SDLC con un enfoque ágil y eficiente. Nuestra consultoría te guía para optimizar procesos y asegurar la entrega continua de software de calidad.",
  },
  {
    icon: (
      <Image
        src={"/assets/software-testing.svg"}
        width={92}
        height={92}
        alt={""}
      />
    ),
    title: "Servicio de Testing",
    description:
      "Diseñamos servicios de testing según tus necesidades, con soluciones innovadoras en pruebas funcionales y no funcionales, garantizando una experiencia óptima para los usuarios.",
  },
  {
    icon: (
      <Image
        src={"/assets/third-services.svg"}
        width={92}
        height={92}
        alt={""}
      />
    ),
    title: "Agile Testing",
    description:
      "Lleva tu Agile Testing al siguiente nivel. Evolucionamos tus métodos de prueba para adaptarlos a un entorno ágil y cambiante, asegurando una entrega continua de valor.",
  },
];

function Services() {
  return (
    <section
      id="services-section"
      data-aos="fade-up"
      className="py-16 pt-70-percent md:pt-30-percent w-full"
    >
      <div className="md:pl-28 pt-16 flex flex-wrap justify-around gap-6">
        {services.map((service, index) => (
          <Card
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
            data-aos="fade-up"
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4"
          />
        ))}
      </div>
    </section>
  );
}
