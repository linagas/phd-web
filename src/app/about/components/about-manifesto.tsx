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
      className="w-full py-16 px-4 md:px-16 space-y-24"
    >
      {/* Bloque 01: ¿Por qué existimos? */}
      <div
        className="flex flex-col md:flex-row gap-12 items-center"
        data-aos="fade-up"
      >
        <div className="flex-1">
          <span
            className="text-pink-400 font-bold text-8xl md:text-9xl leading-none opacity-20 select-none block"
            aria-hidden="true"
          >
            01
          </span>
          <h2
            id="manifesto-block-01"
            className="text-blue-1 font-bold text-3xl md:text-4xl mt-2 mb-6"
          >
            ¿Por qué existimos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Nacimos con una convicción simple pero poderosa: la calidad del
            software no debería ser negociable. En un mundo donde cada
            aplicación impacta la vida de las personas, creemos que garantizar
            que funcione como debe es una responsabilidad ética.
          </p>
          <p className="text-gray-700 leading-relaxed">
            PHD existe para ser el puente entre el código que se escribe y el
            producto que las personas merecen usar. Hacemos que la calidad sea
            parte del proceso desde el inicio, no un filtro al final.
          </p>
        </div>
      </div>

      {/* Bloque 02: ¿Quiénes somos? */}
      <div
        className="flex flex-col md:flex-row-reverse gap-12 items-center"
        data-aos="fade-up"
      >
        <div className="flex-1">
          <span
            className="text-blue-1 font-bold text-8xl md:text-9xl leading-none opacity-20 select-none block"
            aria-hidden="true"
          >
            02
          </span>
          <h2
            id="manifesto-block-02"
            className="text-blue-1 font-bold text-3xl md:text-4xl mt-2 mb-6"
          >
            ¿Quiénes somos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Somos un equipo de profesionales especializados en Quality
            Engineering, apasionados por la tecnología y comprometidos con el
            éxito de cada proyecto. Nos integramos como parte de tu equipo,
            aportando experiencia, metodología y una mirada estratégica.
          </p>
          <div className="flex flex-wrap gap-3">
            {pills.map((pill) => (
              <span
                key={pill}
                className="bg-blue-50 text-blue-500 text-sm font-medium px-4 py-2 rounded-full border border-blue-200"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/assets/team-phd.png"
            alt="Equipo PHD: 6 profesionales especializados en Quality Engineering"
            width={500}
            height={380}
            data-aos="fade-left"
            className="rounded-3xl w-full max-w-md"
          />
        </div>
      </div>

      {/* Bloque 03: ¿Cómo trabajamos? */}
      <div
        className="flex flex-col md:flex-row gap-12 items-center"
        data-aos="fade-up"
      >
        <div className="flex-1">
          <span
            className="text-purple-400 font-bold text-8xl md:text-9xl leading-none opacity-20 select-none block"
            aria-hidden="true"
          >
            03
          </span>
          <h2
            id="manifesto-block-03"
            className="text-blue-1 font-bold text-3xl md:text-4xl mt-2 mb-6"
          >
            ¿Cómo trabajamos?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Nos adaptamos a tu contexto. Puede ser que necesites reforzar tu
            equipo en un proyecto puntual o que busques un partner estable de
            largo plazo. En ambos casos, nuestro enfoque es el mismo: entender
            tu producto, tu proceso y tu equipo para aportar desde el primer día.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Combinamos metodologías ágiles, herramientas de automatización y el
            potencial de la IA para entregar resultados reales. No vendemos
            horas, construimos relaciones basadas en confianza y resultados
            medibles.
          </p>
        </div>
      </div>
    </section>
  );
}
