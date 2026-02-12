"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import "aos/dist/aos.css";
import AOS from "aos";
import { useEffect } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";
import Card from "@/app/components/card";
import CustomDot from "@/app/components/custom-dot";
import ContactButton from "@/app/components/contact-button";
import { SERVICES_DATA } from "@/constants/services-data";

export default function Home() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );
  
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="min-h-screen mt-14 flex justify-center">
      <div className="max-w-screen-2xl w-full">
        {/* Hero Section */}
        <div className="relative pt-8 pb-16 md:pb-24">
          {/* Fondo azul */}
          <div
            className="absolute inset-0 bg-cover bg-center mt-[100px] -z-10"
            style={{
              backgroundImage: `url("/assets/background-blue.svg")`,
            }}
          ></div>

          {/* Primera fila: dos columnas */}
          <div className="flex flex-col md:flex-row w-full items-center gap-8 px-4 md:px-8">
            <div className="flex flex-col justify-center w-full md:w-1/2 md:pl-8">
              <h2 className="text-center md:text-left text-blue-1 font-bold text-2xl md:text-4xl lg:text-5xl">
                Calidad de software que impulsa tu crecimiento
              </h2>
              <p className="text-center md:text-left py-4 mt-4 text-base md:text-lg text-gray-700">
                Seamos tus partners estratégicos en la evolución de tus
                procesos.
              </p>
              <div className="mt-4">
                <ContactButton onClick={scrollToContact} variant="primary" />
              </div>
            </div>
            <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 z-10">
                  <CustomDot
                    baseSize="w-[34px] h-[34px]"
                    lgSize="lg:w-[56px] lg:h-[56px]"
                    color="bg-pink-400"
                  />
                </div>
                <Image
                  src="/assets/robot.svg"
                  width={600}
                  height={500}
                  alt="Software Quality Services"
                  className="rounded-lg"
                  data-aos="fade-left"
                />
              </div>
            </div>
          </div>

          {/* Services Section dentro del fondo azul */}
          <Services />
        </div>

        <article
          id="section-how-we-do"
          className="flex flex-col items-center pt-16 md:pt-24 px-4 md:px-8"
        >
          <HowWeDoIt />
        </article>
        <article id="section-training" className="flex flex-col items-center">
          <ConsultingInfo />
        </article>
        <article
          id="section-contact"
          className="flex flex-col items-center p-4 md:p-8"
        >
          <Contact />
        </article>
      </div>
    </section>
  );
}

function ConsultingInfo() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="consulting-info-section"
      className="flex justify-between py-14 bg-cover"
      style={{
        backgroundImage: `url('/assets/background-pink.svg')`,
      }}
    >
      <article className="flex-1 flex justify-center hidden md:block">
        <Image
          src="/assets/consulting-info.svg"
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
      <article className="flex-1">
        <div className="flex flex-col justify-center items-center w-auto">
          <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold text-white pt-20">
            Capacitaciones en Calidad de Software
          </h1>
          <p className="text-white p-3 text-center md:text-left text-balance">
            Invierte en tu formación y conviértete en un referente en calidad de
            software. Nuestras capacitaciones te brindan las herramientas que
            necesitas para avanzar, en un entorno donde tu crecimiento es
            nuestra prioridad. ¡Hablemos y planifiquemos tu desarrollo!
          </p>
          <ContactButton
            onClick={scrollToContact}
            variant="secondary"
            className="self-center md:self-start"
          />
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
        <article className="flex-1">
          <div className="flex flex-col justify-center items-center w-auto">
            <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold text-purple-12 pt-20">
              Cómo lo Hacemos
            </h1>
            <p className="p-4 text-center md:text-left text-balance">
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
              className="bg-purple-12 inline-flex self-center md:self-start w-48 text-white items-center justify-center rounded-[4px] px-4 py-2 text-xl font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              href="#"
              onClick={scrollToContact}
              prefetch={false}
            >
              Contáctanos
            </Link>
          </div>
        </article>
        <article className="flex-1 flex justify-center hidden md:block">
          <Image
            src="/assets/svg-como-lo-hacemos.svg"
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
          <div className="justify-self-end">
            <CustomDot
              baseSize="w-[32px] h-[32px]"
              color="bg-purple-12"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Services() {
  return (
    <article
      id="section-services"
      className="py-16 md:py-20 px-4 md:px-8 relative"
    >
      <div className="w-full text-center mb-12 md:mb-16">
        <h2 className="text-white font-bold text-3xl md:text-4xl lg:text-5xl">
          Nuestro Enfoque
        </h2>
      </div>
      <div className="w-full flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
        {SERVICES_DATA.map((service, index) => (
          <Card
            key={index}
            iconPosition="left"
            icon={service.icon}
            title={service.title}
            description={service.description}
            data-aos="fade-up"
            className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm"
          />
        ))}
      </div>
      <div className="hidden md:flex w-full justify-end pt-8 pr-8">
        <CustomDot
          baseSize="w-[52px] h-[52px]"
          color="bg-white"
        />
      </div>
    </article>
  );
}
