import React from "react";
import Card from "@/app/components/card";
import CustomDot from "@/app/components/custom-dot";
import { SERVICES_DATA } from "@/constants/services-data";

export default function ServicesSection() {
  return (
    <article
      id="section-services"
      className="py-16 md:py-20 px-4 md:px-8 relative overflow-x-hidden"
    >
      <div className="w-full text-center mb-12 md:mb-16">
        <h2 className="text-white font-bold text-3xl md:text-4xl lg:text-5xl">
          Nuestro Enfoque
        </h2>
      </div>
      <div className="w-full flex flex-wrap text-center gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
        {SERVICES_DATA.map((service) => (
          <div key={service.title} data-aos="fade-up" className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)]">
            <Card
              iconPosition="top"
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
  );
}
