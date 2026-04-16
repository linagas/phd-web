const focusItems = [
  "Quality Engineering integrado desde el inicio del SDLC",
  "Cobertura completa del ciclo de desarrollo de software",
  "Decisiones basadas en datos y métricas de calidad",
  "Productos que importan y experiencias que funcionan",
];

const motivationPhrases = [
  "La calidad no es un accidente, es el resultado de un esfuerzo inteligente.",
  "Cada bug que prevenimos es una experiencia de usuario que protegemos.",
  "El software de calidad no es el más caro, es el que se construye bien desde el principio.",
];

export default function AboutFocus() {
  return (
    <section
      id="about-focus-section"
      aria-labelledby="about-focus-heading"
      className="w-full bg-blue-500 rounded-3xl mt-20 md:py-20 px-8 md:px-20"
      data-aos="fade-up"
      data-aos-duration="700"
    >
      <div className="flex flex-col md:flex-row gap-12 md:gap-0">
        {/* Columna izquierda: Nuestro foco */}
        <div className="flex-1 md:pr-12">
          <h2
            id="about-focus-heading"
            className="text-white font-bold text-3xl md:text-4xl mb-10 flex items-center gap-3"
          >
            <span
              className="inline-block w-10 h-1 bg-pink-400 rounded-full flex-shrink-0"
              aria-hidden="true"
            />
            Nuestro foco
          </h2>
          <ul className="space-y-7" role="list">
            {focusItems.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-4"
                data-aos="fade-right"
                data-aos-delay={index * 80}
                data-aos-duration="500"
              >
                <span
                  className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-pink-400"
                  aria-hidden="true"
                />
                <span className="text-white/90 text-lg md:text-xl leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Separador vertical */}
        <div
          className="hidden md:block w-px bg-pink-400 opacity-30 mx-8 self-stretch"
          aria-hidden="true"
        />

        {/* Separador horizontal mobile */}
        <div
          className="md:hidden w-full h-px bg-pink-400 opacity-30"
          aria-hidden="true"
        />

        {/* Columna derecha: Lo que nos mueve */}
        <div className="flex-1 md:pl-12">
          <h3 className="text-white font-bold text-3xl md:text-4xl mb-10 flex items-center gap-3">
            <span
              className="inline-block w-10 h-1 bg-pink-400 rounded-full flex-shrink-0"
              aria-hidden="true"
            />
            Lo que nos mueve
          </h3>
          <div className="space-y-8">
            {motivationPhrases.map((phrase, index) => (
              <blockquote
                key={phrase}
                className="border-l-2 border-pink-400/50 pl-5"
                data-aos="fade-left"
                data-aos-delay={index * 100}
                data-aos-duration="500"
              >
                <p className="font-bold text-xl md:text-2xl text-white leading-snug">
                  &ldquo;{phrase}&rdquo;
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}