"use client";
import React from "react";
import CustomDot from "../components/custom-dot";
import Contact from "../components/contact/page";
import TestingServices from "./components/testing-services";
import ConsultingInfo from "./components/consulting-info";
import TestingEvolution from "./components/testing-evolution";
import DeliveryModels from "./components/delivery-models";

const Companies: React.FC = () => {
  return (
    <section className="mt-14 flex justify-center">
      <div className="max-w-screen-2xl w-full pt-8">
        <div className="relative">
          <div
            className="absolute inset-0 bg-cover bg-center mt-[180px] h-[920px]"
            style={{
              backgroundImage: `url("/assets/grupo-238@2x.png")`,
              zIndex: -1,
            }}
            aria-hidden="true"
          ></div>

          <div className="relative flex flex-col items-center h-full">
            <div className="w-full p-4 hidden md:block">
              <div className="flex flex-row-reverse">
                <article className="flex justify-end">
                  <div className="flex justify-end pr-8">
                    <CustomDot
                      baseSize="w-[24px] h-[24px]"
                      lgSize="lg:w-[56px] lg:h-[56px]"
                      color="bg-pink-400"
                    />
                  </div>
                </article>
              </div>
            </div>

            <div className="flex w-full p-4">
              <div className="flex text-center flex-col justify-center items-center w-full p-4 md:pl-16">
                <h1 className="text-center text-blue-1 font-bold text-4xl md:text-[60px] leading-tight max-w-3xl">
                  Modelos de entrega de valor
                </h1>

                <p className="text-center py-4 mt-4 text-lg md:text-2xl max-w-2xl">
                  En PHD ofrecemos modelos de servicio que se adaptan a tu
                  realidad, combinando flexibilidad, estrategia y foco en
                  impacto.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center w-full p-4 mt-12 md:mt-20 pb-10">
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
                <DeliveryModels />
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-[100px]">
            <article className="flex justify-start">
              <div className="flex justify-start pl-16 pr-8">
                <CustomDot
                  baseSize="w-[34px] h-[34px]"
                  lgSize="lg:w-[56px] lg:h-[56px]"
                  color="bg-blue-2"
                />
              </div>
            </article>

            <article
              id="section-3"
              className="flex flex-col items-center pt-72 md:p-8"
            >
              <h2 className="text-pink-400 font-bold uppercase text-4xl md:text-6xl text-center">
                CONSULTORÍA SDLC
              </h2>
              <ConsultingInfo />
            </article>
            <article id="section-4" className="flex flex-col items-center">
              <TestingServices />
            </article>
            <article id="section-5" className="flex flex-col items-center">
              <TestingEvolution />
            </article>
            <article className="flex flex-col items-center p-4 md:p-8">
              <Contact />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Companies;
