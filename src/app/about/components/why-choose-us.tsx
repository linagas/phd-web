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
      className="flex justify-center mt-20 px-4 md:px-8 w-full"
      data-aos="fade-up"
      data-aos-duration="700"
    >
      <div className="rounded-[50px] bg-white max-w-screen-lg w-full border-[9px] border-solid border-pink-400 shadow-sm">
        <div className="flex-col w-full p-8 md:p-12 lg:p-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2
              id="why-choose-us-heading"
              className="text-center text-pink-400 font-bold text-3xl md:text-4xl"
            >
              ¿Por qué elegirnos?
            </h2>
            <CustomDot
              baseSize="w-[14px] h-[14px]"
              lgSize="lg:w-[20px] lg:h-[20px]"
              color="bg-pink-400"
            />
          </div>
          <hr className="border-t-[6px] border-pink-400 my-4 w-full rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {whyChooseItems.map((item, index) => (
              <div
                key={item.alt}
                className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-pink-400/5 hover:shadow-md group cursor-default"
                data-aos="fade-up"
                data-aos-delay={index * 80}
                data-aos-duration="600"
              >
                <div className="flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={100}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-blue-500 font-bold leading-snug text-center text-lg md:text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
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