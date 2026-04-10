import Image from "next/image";

const pills = [
  "Trabajo colaborativo",
  "Relaciones de largo plazo",
  "Mejora continua como cultura",
  "IA como habilitador",
];

export default function AboutManifesto() {
  return (
    <section
      id="about-manifesto-section"
      aria-labelledby="manifesto-block-01"
      className="w-full py-16 px-4 md:px-16 space-y-28"
    >
      {/* Bloque 01: ¿Por qué existimos? */}
      <div
        className="flex flex-col md:flex-row gap-12 items-start"
        data-aos="fade-up"
        data-aos-duration="700"
      >
        <div className="flex-1">
          <span
            className="text-pink-400 font-bold text-[7rem] md:text-[9rem] leading-none opacity-10 select-none block -mb-6"
            aria-hidden="true"
          >
            01
          </span>
          <h2
            id="manifesto-block-01"
            className="text-pink-400 font-bold text-3xl md:text-4xl mb-6 border-l-4 border-pink-400 pl-4"
          >
            ¿Por qué existimos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-base md:text-lg">
            Nacimos con una convicción simple pero poderosa: la calidad del
            software no debería ser negociable. En un mundo donde cada
            aplicación impacta la vida de las personas, creemos que garantizar
            que funcione como debe es una responsabilidad ética.
          </p>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            PHD existe para ser el puente entre el código que se escribe y el
            producto que las personas merecen usar. Hacemos que la calidad sea
            parte del proceso desde el inicio, no un filtro al final.
          </p>
        </div>
        {/* Elemento visual decorativo */}
        <div
          className="hidden md:flex flex-1 items-center justify-center self-center"
          aria-hidden="true"
          data-aos="fade-left"
          data-aos-delay="150"
          data-aos-duration="700"
        >
          <div className="relative w-full">
            <div className="rounded-3xl bg-gradient-to-br from-pink-400/10 to-pink-400/5 border border-pink-400/20 p-12 flex flex-col gap-6">
              <div className="w-14 h-1 bg-pink-400 rounded-full" />
              <p className="text-pink-400 font-bold text-2xl leading-snug">
                La calidad es una decisión, no una etapa.
              </p>
              <p className="text-gray-700 text-lg font-medium leading-relaxed">
                Integramos quality engineering desde el inicio hasta el
                despliegue en producción.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 02: ¿Quiénes somos? */}
      <div
        className="flex flex-col md:flex-row-reverse gap-12 items-start"
        data-aos="fade-up"
        data-aos-duration="700"
      >
        <div className="flex-1">
          <span
            className="text-blue-1 font-bold text-[7rem] md:text-[9rem] leading-none opacity-10 select-none block -mb-6"
            aria-hidden="true"
          >
            02
          </span>
          <h2
            id="manifesto-block-02"
            className="text-blue-1 font-bold text-3xl md:text-4xl mb-6 border-l-4 border-blue-1 pl-4"
          >
            ¿Quiénes somos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-base md:text-lg">
            Somos un equipo de profesionales especializados en Quality
            Engineering, apasionados por la tecnología y comprometidos con el
            éxito de cada proyecto. Nos integramos como parte de tu equipo,
            aportando experiencia, metodología y una mirada estratégica.
          </p>
          <div className="flex flex-wrap gap-3">
            {pills.map((pill) => (
              <span
                key={pill}
                className="bg-blue-1/10 text-blue-1 text-sm font-medium px-4 py-2 rounded-full border border-blue-1/30"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div
          className="flex-1 flex justify-center items-start"
          data-aos="fade-right"
          data-aos-delay="150"
          data-aos-duration="700"
        >
          <div className="relative w-full">
            {/* Fondo decorativo */}
            <div
              className="absolute -inset-3 rounded-3xl bg-blue-1 opacity-5"
              aria-hidden="true"
            />
            <Image
              src="/assets/colaboracion-creativa.png"
              alt="Equipo PHD: profesionales especializados en Quality Engineering"
              width={700}
              height={480}
              className="relative rounded-2xl w-full object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      {/* Bloque 03: ¿Cómo trabajamos? */}
      <div
        className="flex flex-col md:flex-row gap-12 items-start"
        data-aos="fade-up"
        data-aos-duration="700"
      >
        <div className="flex-1">
          <span
            className="text-purple-400 font-bold text-[7rem] md:text-[9rem] leading-none opacity-10 select-none block -mb-6"
            aria-hidden="true"
          >
            03
          </span>
          <h2
            id="manifesto-block-03"
            className="text-purple-400 font-bold text-3xl md:text-4xl mb-6 border-l-4 border-purple-400 pl-4"
          >
            ¿Cómo trabajamos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-base md:text-lg">
            Nos adaptamos a tu contexto. Puede ser que necesites reforzar tu
            equipo en un proyecto puntual o que busques un partner estable de
            largo plazo. En ambos casos, nuestro enfoque es el mismo: entender
            tu producto, tu proceso y tu equipo para aportar desde el primer día.
          </p>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            Combinamos metodologías ágiles, herramientas de automatización y el
            potencial de la IA para entregar resultados reales. No vendemos
            horas, construimos relaciones basadas en confianza y resultados
            medibles.
          </p>
        </div>
        {/* Elemento visual decorativo */}
        <div
          className="hidden md:flex flex-1 items-center justify-center self-center"
          aria-hidden="true"
          data-aos="fade-left"
          data-aos-delay="150"
          data-aos-duration="700"
        >
          <div className="relative w-full">
            <div className="rounded-3xl bg-gradient-to-br from-purple-400/10 to-purple-400/5 border border-purple-400/20 p-12 flex flex-col gap-6">
              <div className="w-14 h-1 bg-purple-400 rounded-full" />
              <p className="text-purple-400 font-bold text-2xl leading-snug">
                Flexibilidad sin perder el foco en la calidad.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                Desde sprints cortos hasta partnerships de largo plazo, siempre
                con metodología y resultados medibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
