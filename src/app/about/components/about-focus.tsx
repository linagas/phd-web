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
      className="w-full bg-blue-500 rounded-3xl mt-16 py-16 px-8 md:px-16"
      data-aos="fade-up"
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Columna izquierda: Nuestro foco */}
        <div className="flex-1 md:pr-12">
          <h2
            id="about-focus-heading"
            className="text-white font-bold text-3xl md:text-4xl mb-8"
          >
            Nuestro foco
          </h2>
          <ul className="space-y-5">
            {focusItems.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span
                  className="mt-1 flex-shrink-0 w-1 h-6 bg-pink-400 rounded-full"
                  aria-hidden="true"
                />
                <span className="text-white text-lg leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Separador vertical */}
        <div
          className="hidden md:block w-px bg-pink-400 opacity-40 mx-8"
          aria-hidden="true"
        />

        {/* Columna derecha: Lo que nos mueve */}
        <div className="flex-1 md:pl-12">
          <h2 className="text-white font-bold text-3xl md:text-4xl mb-8">
            Lo que nos mueve
          </h2>
          <div className="space-y-8">
            {motivationPhrases.map((phrase) => (
              <blockquote key={phrase}>
                <p className="font-bold text-2xl md:text-3xl text-white leading-snug">
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
