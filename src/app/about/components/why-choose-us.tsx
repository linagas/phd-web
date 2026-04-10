import Image from "next/image";
import CustomDot from "@/app/components/custom-dot";

const whyChooseItems = [
  {
    title: "Calidad y experiencia",
    description:
      "Más de una década asegurando software de alto impacto en industrias exigentes.",
    image: "/assets/calidad-experiencia.svg",
    alt: "Icono de calidad y experiencia",
  },
  {
    title: "Flexibilidad en la contratación",
    description:
      "Adaptamos el modelo de trabajo a tu ritmo, proyecto y presupuesto.",
    image: "/assets/felixibilidad-aprendizaje.svg",
    alt: "Icono de flexibilidad en la contratación",
  },
  {
    title: "Enfoque práctico y colaborativo",
    description:
      "Trabajamos dentro de tu equipo, no desde afuera, para alinearnos con tu cultura.",
    image: "/assets/enfoque-practico.svg",
    alt: "Icono de enfoque práctico y colaborativo",
  },
  {
    title: "Recursos y herramientas completos",
    description:
      "Acceso a frameworks, herramientas y metodologías de primer nivel del mercado.",
    image: "/assets/recuersos-ac.svg",
    alt: "Icono de recursos y herramientas",
  },
  {
    title: "Reputación y confianza",
    description:
      "Partners de largo plazo que priorizan tu éxito y construyen relaciones duraderas.",
    image: "/assets/certificacion-reconocida.svg",
    alt: "Icono de reputación y confianza",
  },
  {
    title: "Acompañamiento cercano y ágil",
    description:
      "Respuesta rápida, comunicación clara y soporte continuo en cada etapa.",
    image: "/assets/acompañamiento-ws.svg",
    alt: "Icono de acompañamiento cercano y ágil",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us-section"
      aria-labelledby="why-choose-us-heading"
      className="flex justify-center mt-16 px-4"
    >
      <div className="rounded-[50px] bg-white max-w-screen-lg w-full border-[9px] border-solid border-pink-400">
        <div className="flex-col w-full p-12 md:p-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2
              id="why-choose-us-heading"
              className="text-center text-pink-400 font-bold text-4xl"
            >
              ¿Por qué elegirnos?
            </h2>
            <CustomDot
              baseSize="w-[18px] h-[18px]"
              lgSize="lg:w-[24px] lg:h-[24px]"
              color="bg-pink-400"
            />
          </div>
          <hr className="border-t-8 border-[#F14578] my-4 w-full" />
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {whyChooseItems.map((item, index) => (
              <div
                key={item.alt}
                className="flex flex-col items-center text-center w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] p-8"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={120}
                    height={90}
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-4 text-[#1E1E1E] font-bold leading-snug text-center text-xl md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
