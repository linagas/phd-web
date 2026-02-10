"use client";
import React from "react";
import CustomDot from "../components/custom-dot";
import Card from "../components/card";
import Contact from "../components/contact/page";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";

const Companies: React.FC = () => {
  return (
    <section className=" mt-14 flex justify-center ">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative ">
          {/* <!-- Capa de la imagen de fondo --> */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("/assets/grupo-238@2x.png")`,
              zIndex: -1,
              marginTop: "180px",
              height: "920px",
            }}
          ></div>

          {/* <!-- Capa del contenido --> */}
          <div className="relative flex flex-col items-center h-full">
            <div className="w-full p-4 hidden md:block">
              <div className="flex flex-row-reverse">
                <article className="flex justify-end">
                  <div className="flex justify-end pr-8">
                    {/* punto fucsia */}
                    <CustomDot
                      baseSize="w-[24px] h-[24px]"
                      lgSize="lg:w-[56px] lg:h-[56px]"
                      color="bg-pink-400"
                    />
                  </div>
                </article>
              </div>
            </div>
            {/* <!-- Primera fila: dos columnas --> */}
            <div className="flex w-full  p-4">
              <div className="flex text-center flex-col justify-center align-center w-full p-4 md:pl-16">
                <h1 className="text-center flex-col justify-center align-center text-blue-1 align-center font-bold text-[60px]">
                  Transformamos la <br />
                  calidad de tu software
                </h1>

                <p className="text-center py-4 mt-4 text-[24px]">
                  Nuestros servicios para todo tipo de empresas
                </p>
              </div>
            </div>

            {/* <!-- Segunda fila: una columna --> */}
            <div className="flex justify-center gap-4 w-full p-4">
              <Card
                key="traditional-01"
                title="Contratación Tradicional"
                description="En PHD Chile impulsamos la calidad de tu software con servicios diseñados para acompañarte en cada etapa de tu evolución tecnológica. Nos especializamos en fortalecer tus procesos con contratos tradicionales ideales para proyectos de corto y largo plazo, asegurando continuidad, compromiso y un acompañamiento experto. Nuestro enfoque se adapta a tus necesidades, construyendo relaciones de confianza que crecen contigo. Elige un partner que entiende tus desafíos y evoluciona a tu ritmo. Conversemos sobre cómo podemos llevar la calidad de tus proyectos al siguiente nivel."
                data-aos="fade-up"
                className="flex-grow-0 flex-shrink-0 w-full w-full md:w-1/2 max-w-[550px] card-blue-style text-blue-1"
                textAction="CONTRATAR"
                actionClass="bg-blue-1"
                buttonMaxWidth="311px"
              />
              <Card
                key="traditional-02"
                title="Flexible Contracting"
                description="
                En PHD Chile, entendemos que la flexibilidad es clave en el mundo actual. Por eso, ofrecemos un servicio de contratación flexible que se adapta a tus necesidades cambiantes. Ya sea que necesites recursos temporales o un equipo completo para un proyecto específico, estamos aquí para ayudarte. Nuestro enfoque ágil y personalizado garantiza que obtengas el soporte adecuado en el momento adecuado. Con PHD Chile, puedes contar con un partner confiable que se ajusta a tu ritmo y objetivos."
                data-aos="fade-up"
                className="flex-grow-0 flex-shrink-0 w-full w-full md:w-1/2 max-w-[550px] card-pink-style text-pink-400"
                textAction="SOLICITA TU PRESUPUESTO"
                actionClass="bg-pink-400"
                buttonMaxWidth="311px"
              />
            </div>
          </div>
          <div className="flex flex-col mt-[100px]">
            {/* punto azul oscuro */}
            <article className="flex justify-start">
              <div className="flex justify-start pl-16 pr-8">
                <CustomDot
                  baseSize="w-[34px] h-[34px]"
                  lgSize="lg:w-[56px] lg:h-[56px]"
                  color="bg-blue-2"
                />
              </div>
            </article>
            {/* <!-- punto azul oscuro  --> */}
            <article
              id="section-3"
              className="flex flex-col items-center pt-72 md:p-8"
            >
              <h1 className="text-pink-400 font-bold uppercase text-6xl">
                CONSULTORIA SDLC
              </h1>
              <ConsultingInfo />
            </article>
            <article id="section-4" className="flex flex-col items-center ">
              <TestingServices />
            </article>
            <article id="section-5" className="flex flex-col items-center ">
              <TestingEvolution />
            </article>
            <article
              id="section-6"
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

export default Companies;

function TestingServices() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="consulting-info-section"
      className="flex flex-col w-full py-14 space-y-12"
    >
      {/* Imagen de fondo con texto */}
      <article className="relative h-[200px] md:h-[300px] lg:h-[400px] w-full flex items-center justify-center text-center overflow-hidden">
        <Image
          src="/assets/trazado-azul-3.png"
          alt="Fondo curvo azul decorativo"
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="relative z-10 px-4">
          <h2 className="text-white text-3xl md:text-5xl font-bold">
            SERVICIO DE TESTING
          </h2>
        </div>
      </article>

      <div className="flex flex-row items-center gap-6 px-6 md:px-12">
        <div className="flex flex-row gap-6">
          {[
            {
              title: "Agrega IA a tu proceso de pruebas",
              description:
                "Transformamos tus pruebas con IA que detecta errores antes que tú, genera escenarios que no habías pensado y amplía tu cobertura sin ampliar tu equipo. Automatización inteligente que trabaja mientras tú innovas.",
              asset: "/assets/pruebas-manuales.svg",
            },
            {
              title: "Pruebas Automatizadas",
              description:
                "Diseñamos y ejecutamos pruebas automáticas para ahorrar tiempo, mejorar la cobertura de validaciones y prevenir errores críticos en cada nueva versión de tu software.",
              asset: "/assets/pruebas-automatizadas.svg",
            },
            {
              title: "Pruebas Performance",
              description:
                "Simulamos múltiples usuarios y cargas de trabajo para evaluar la estabilidad, el rendimiento y la escalabilidad de tus aplicaciones bajo condiciones de alta demanda.",
              asset: "/assets/pruebas-performance.svg",
            },
          ].map((card, i) => (
            <div
              id={`card-${i}`}
              key={i}
              className="flex flex-col justify-center gap-4 items-center max-w-[432px]"
              data-aos="fade-up"
              data-aos-delay={`${i * 100}`}
              data-aos-duration="1000"
            >
              <Card
                key={`testing-card-${i}`}
                title={card.title}
                description={card.description}
                data-aos="fade-up"
                className="flex-grow-0 flex-shrink-0 w-full max-md:767 overflow-auto card-blue-style"
                rounded="rounded-[50px]"
                iconPosition="top"
                height="h-[418px]"
                icon={
                  <Image
                    src={card.asset}
                    width={78}
                    height={78}
                    alt="Software Quality Services"
                    className="object-cover"
                  />
                }
              />
              <Link
                className="inline-flex self-center w-48 text-white items-center justify-center rounded-[24px] bg-blue-1 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                href="#"
                onClick={scrollToContact}
                prefetch={false}
              >
                CONTACTANOS
              </Link>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-start justify-start">
          <CustomDot
            baseSize="w-[82px] h-[82px]"
            lgSize="lg:w-[56px] lg:h-[56px]"
            color="bg-purple-400"
          />
        </div>
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
      className="flex justify-between py-14"
    >
      <article className="flex-1 flex justify-center items-center  hidden md:flex lg:flex">
        <div className="relative ">
          {/* Capa trasera (Fondo fucsia) */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl  -translate-x-4 translate-y-64"
            style={{
              backgroundImage: "url('/assets/trazado-fucsia.svg')",
              backgroundSize: "contain",
              backgroundPosition: "bottom",
              backgroundRepeat: "no-repeat",
              top: "-45%",
            }}
            data-aos="fade-up"
          ></div>

          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={"/assets/mujer-ia-2x.png"}
              width={600}
              height={600}
              alt="Software Quality Services"
              className="w-full h-auto object-cover"
              data-aos="fade-up"
            />
          </div>
        </div>
        {/*  */}
      </article>
      <article className="flex-1 ">
        <div className="flex flex-col gap-[25px] justify-center align-center w-auto">
          <Card
            key="traditional-02"
            title="EVALUACIÓN DE PROCESOS"
            description="Detectamos fortalezas y áreas de mejora en tu proceso de desarrollo de software."
            data-aos="fade-up"
            className="flex-grow-0 flex-shrink-0 w-full  max-md:767 max-h-[200px] card-pink-style "
            rounded="rounded-[23px]"
            iconPosition="left"
            icon={
              <Image
                src={"/assets/plan-de-mejora.svg"}
                width={100}
                height={100}
                alt="Software Quality Services"
                className="object-cover"
              />
            }
          />
          <Card
            key="traditional-02"
            title="ANÁLISIS DE BRECHAS"
            description="Identificamos las diferencias entre tu proceso actual y las mejores prácticas del mercado."
            data-aos="fade-up"
            className="flex-grow-0 flex-shrink-0 w-full  max-md:767 max-h-[200px] card-pink-style "
            rounded="rounded-[23px]"
            iconPosition="left"
            icon={
              <Image
                src={"/assets/analisis-gap.svg"}
                width={100}
                height={100}
                alt="Software Quality Services"
                className="object-cover"
              />
            }
          />
          <Card
            key="traditional-02"
            title="PLAN DE MEJORA"
            description="Diseñamos un plan de acción a medida para optimizar tus procesos de calidad."
            data-aos="fade-up"
            className="flex-grow-0 flex-shrink-0 w-full  max-md:767 max-h-[200px] card-pink-style "
            rounded="rounded-[23px]"
            iconPosition="left"
            icon={
              <Image
                src={"/assets/plan-de-mejora-2.svg"}
                width={100}
                height={100}
                alt="Software Quality Services"
                className="object-cover"
              />
            }
          />
          <Card
            key="traditional-02"
            title="PLAN DE GESTION DE CAMBIOS"
            description="Guiamos a tu equipo en la adopción efectiva de nuevas prácticas y herramientas."
            data-aos="fade-up"
            className="flex-grow-0 flex-shrink-0 w-full  max-md:767 max-h-[200px] card-pink-style "
            rounded="rounded-[23px]"
            iconPosition="left"
            icon={
              <Image
                src={"/assets/analisis-gap.svg"}
                width={100}
                height={100}
                alt="Software Quality Services"
                className="object-cover"
              />
            }
          />

          <Link
            className="inline-flex self-end md:self-left  w-48 text-white items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            href="#"
            onClick={scrollToContact}
            prefetch={false}
          >
            AGENDA TU CITA
          </Link>
        </div>
      </article>
    </section>
  );
}

function TestingEvolution() {
  return (
    <section
      id="testing-evolution-section"
      className="flex flex-col w-full py-14"
    >
      <TestingEvolutionDetails features={features} />
    </section>
  );
}

export interface FeatureItem {
  title: string;
  text: string;
  asset?: string; // Optional property for asset
}

interface TestingEvolutionProps {
  features: FeatureItem[];
  buttonText?: string;
}

const features: FeatureItem[] = [
  {
    title: "Pruebas IA",
    asset: "/assets/Chip.svg",
    text: "Utilizamos inteligencia artificial para generar casos de prueba, detectar anomalías y predecir errores potenciales, acelerando la validación y aumentando la efectividad del proceso de testing.",
  },
  {
    title: "DevQAOps",
    asset: "/assets/devQaOps.svg",
    text: "Integración de calidad en tus pipelines DevOps para asegurar que cada cambio sea validado de manera continua, rápida y confiable en tu ciclo de desarrollo.",
  },
  {
    title: "Pruebas Tempranas Shift Left",
    asset: "/assets/shift-left.svg",
    text: "Incorporamos testing y aseguramiento de calidad desde las primeras fases del desarrollo, reduciendo riesgos, costos y tiempos de entrega.",
  },
  {
    title: "Pruebas con Dispositivos Móviles",
    asset: "/assets/pruebas-mobile.svg",
    text: "Validamos la funcionalidad, el rendimiento y la experiencia de usuario en dispositivos móviles reales para garantizar aplicaciones ágiles, seguras y optimizadas.",
  },
];

const TestingEvolutionDetails: React.FC<TestingEvolutionProps> = ({
  features,
  buttonText = "CONTÁCTANOS",
}) => {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );
  return (
    <section className="relative flex flex-col items-center w-full py-14 px-4">
      <div className=" flex w-full p-9 ">
        <div className="flex items-center justify-between ">
          <CustomDot
            baseSize="w-[82px] h-[82px]"
            lgSize="lg:w-[56px] lg:h-[56px]"
            color="bg-blue-1"
          />
        </div>
        <div className="flex justify-center w-full">
          <h2 className="text-[#F14578] text-3xl md:text-5xl font-bold uppercase text-center">
            EVOLUCIÓN DEL TESTING
          </h2>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-6xl border-[7px] border-[#F14578] rounded-[50px] p-10 ">
        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 text-[#F14578] mb-4">
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
              <div className="hidden md:block min-h-[200px] w-[18px] bg-[#F14578]" />
            )}
          </React.Fragment>
        ))}
        <div className="absolute -bottom-6 right-6">
          <button
            onClick={scrollToContact}
            className="bg-[#F14578] text-white text-sm md:text-base font-medium py-3 px-6 rounded-full shadow-md hover:bg-[#e03d6b] transition"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};
