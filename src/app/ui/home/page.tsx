"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import Link from "next/link";
import "aos/dist/aos.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useRef } from "react";
import { Button } from "@aws-amplify/ui-react";
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
    <main className="min-h-screen  grid">
      <section id="section-1">
        <div className="relative pt-28 justify-items-stretch">
          <div className="flex h-16 sm:h-20">
            <div className="flex-none w-14 "></div>
            <div
              className="flex-1 flex-col pt-14 min-h-screen"
              style={{ zIndex: 9 }}
            >
              <h2 className="text-blue-1 font-bold text-2xl md:text-4xl ">
                Calidad de software que impulsa tu crecimiento
              </h2>
              <p className="text-left py-4  mt-4 max-w-md">
                Seamos tus partners estratégicos en la evolución de tus
                procesos.
              </p>
              <Link
                href="#"
                onClick={scrollToContact}
                className="inline-flex w-full md:w-48 text-white items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Cont&aacute;ctanos
              </Link>
            </div>
            <div className="flex-1 hidden md:block" data-aos="fade-left">
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
            <div className="flex-none w-20 pt-4 pr-8 min-h-screen">
              {/* punto fucsia */}
              <div className="justify-self-end ">
                <div
                  className={`w-[34px] h-[34px]  md:w-[64px] md:h-[64px] rounded-full bg-pink-400`}
                />
              </div>
            </div>
          </div>
          <div
            className="flex"
            style={{
              backgroundImage: `url('/assets/background-blue.svg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "140vh",
              zIndex: -1,
            }}
          >
            <Services />
          </div>
        </div>
      </section>

      <HowWeDoIt />
      <ConsultingInfo />
      <Contact />
    </main>
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
      <article className="flex-1  flex justify-center pl-16 ">
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
      <article className="flex-1 pl-16">
        <div className="w-auto">
          <h1 className="text-5xl text-left font-bold text-white pt-20">
            Capacitaciones en Calidad de Software
          </h1>
          <p className="text-white py-3 text-left text-balance">
            Invierte en tu formación y conviértete en un referente en calidad de
            software. Nuestras capacitaciones te brindan las herramientas que
            necesitas para avanzar, en un entorno donde tu crecimiento es
            nuestra prioridad. ¡Hablemos y planifiquemos tu desarrollo!
          </p>
          <Link
            className="inline-flex  w-48 text-white items-center justify-center rounded-[4px] bg-blue-1 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
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
      <section id="how-we-doit-section" className="flex justify-between py-14">
        <article className="flex-1 pl-36">
          <div className="w-auto">
            <h1 className="text-5xl text-left font-bold text-purple-12 pt-20">
              Cómo lo Hacemos
            </h1>
            <p className=" py-4 text-left text-balance">
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
              className="bg-purple-12 inline-flex  w-48 text-white items-center justify-center rounded-[4px] px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              href="#"
              onClick={scrollToContact}
              prefetch={false}
            >
              Cont&aacute;ctanos
            </Link>
          </div>
        </article>
        <article className="flex-1  flex justify-center pl-16 ">
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
            className="flex-grow-0 flex-shrink-0 w-full md:w-1/3 lg:w-1/4 max-w-xs"
          />
        ))}
      </div>
      <div className="py-20 pl-8 flex  justify-start md:flex-row gap-x-4 pr-8">
        <div className="justify-self-end pt-4 pr-8">
          <div className={`w-[52px] h-[52px] rounded-full bg-white`} />
        </div>
      </div>
    </section>
  );
}
