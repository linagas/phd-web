"use client";
import Contact from "@/app/components/contact/page";
import Image from "next/image";
import useScrollToSection from "@/hooks/useScrollToSection";
import Card from "@/app/components/card";
import CustomDot from "@/app/components/custom-dot";
import ContactButton from "@/app/components/contact-button";
import { SERVICES_DATA } from "@/constants/services-data";
import HowWeDoIt from "./components/how-we-do-it";
import ConsultingInfo from "./components/consulting-info";

export default function Home() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section className="min-h-screen mt-14 flex justify-center">
      <div className="max-w-screen-2xl w-full">
        {/* Hero Section */}
        <div className="relative pt-8 pb-16 md:pb-24">
          <div
            className="absolute inset-0 bg-cover bg-center mt-[100px] -z-10"
            style={{
              backgroundImage: `url("/assets/background-blue.svg")`,
            }}
            aria-hidden="true"
          ></div>

          <div className="flex flex-col md:flex-row w-full items-center gap-8 px-4 md:px-8">
            <div className="flex flex-col justify-center w-full md:w-1/2">
              <h1 className="text-center md:text-left text-blue-1 font-bold text-2xl md:text-4xl lg:text-5xl">
                Calidad de software que impulsa tu crecimiento
              </h1>
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
                <div className="absolute top-0 right-0 -mt-4 z-10">
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
                  alt="Robot ilustrando servicios de IA aplicada al testing de software"
                  className="rounded-lg"
                  data-aos="fade-left"
                />
              </div>
            </div>
          </div>

          {/* Services Section */}
          <article
            id="section-services"
            className="py-16 md:py-20 px-4 md:px-8 relative"
          >
            <div className="w-full text-center mb-12 md:mb-16">
              <h2 className="text-white font-bold text-3xl md:text-4xl lg:text-5xl">
                Nuestro Enfoque
              </h2>
            </div>
            <div className="w-full flex flex-wrap text-left gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
              {SERVICES_DATA.map((service) => (
                <div
                  key={service.title}
                  data-aos="fade-up"
                  className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)]"
                >
                  <Card
                    iconPosition="left"
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    className="max-w-sm"
                  />
                </div>
              ))}
            </div>
            <div className="hidden md:flex w-full justify-end pt-8 pr-8">
              <CustomDot baseSize="w-[52px] h-[52px]" color="bg-white" />
            </div>
          </article>
        </div>

        <article
          id="section-how-we-do"
          className="flex flex-col items-center md:pt-16 md:pt-24 px-4 md:px-8"
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
