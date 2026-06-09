const COMMON_CONS = [
  {
    title: "Procesos Genéricos",
    description:
      "Aplican la misma plantilla y metodologías tradicionales sin importar tu stack ni madurez real.",
  },
  {
    title: "Reportes en PDF de 80 Páginas",
    description:
      "Nivel de madurez 3.2 abstracto pero con cero instrucciones claras sobre qué priorizar el lunes por la mañana.",
  },
  {
    title: "Cobro por Horas Facturadas",
    description:
      "Su incentivo es tener programadores junior en tu planilla el mayor tiempo posible, no resolver el bug.",
  },
  {
    title: "Te dejan solo en lo difícil",
    description:
      "Una vez entregado el PDF y hecha la reunión de entrega final, el consultor desaparece de tu canal.",
  },
];

const PHD_PROS = [
  {
    title: "Entendimiento Integral del Negocio",
    description:
      "No entregamos auditorías genéricas. Diagnosticamos con foco específico en tus cuellos de botella reales de negocio.",
  },
  {
    title: "Integración al Equipo",
    description:
      "Nos acoplamos hasta que el cambio ocurre. Creamos cultura y hábitos que duran de por vida.",
  },
  {
    title: "Cobro por Impacto Real",
    description:
      "Nuestro éxito y métricas están alineados al rendimiento, velocidad y uptime de tu plataforma.",
  },
  {
    title: "Planificación de Salida Autónoma",
    description:
      "Nuestro tercer horizonte apunta a que no nos necesites más. Te entrenamos para que seas 100% independiente.",
  },
];

function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-phd-pink shrink-0 mt-0.5"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-phd-cyan shrink-0 mt-0.5"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function PhdDifference() {
  return (
    <section id="diferencia" className="bg-phd-dark py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-phd-pink mb-4">
            El mercado de QA está roto
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white tracking-tight">
            ¿Por qué el enfoque tradicional{" "}
            <span className="text-phd-pink">falla</span>?
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            La consultoría genérica vende horas facturadas y se retira al entregar
            un reporte inútil. PHD funciona diferente porque se asocia al impacto real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Columna izquierda — Consultoría común */}
          <div className="phd-glass p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-phd-pink/15 flex items-center justify-center">
                <XIcon />
              </div>
              <h3 className="font-heading font-bold text-white text-xl">
                La Consultoría Común
              </h3>
            </div>
            <ul className="flex flex-col gap-5">
              {COMMON_CONS.map(({ title, description }) => (
                <li key={title} className="flex gap-3">
                  <XIcon />
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna derecha — La Promesa PHD (borde gradiente) */}
          <div className="relative group rounded-[17px] p-px">
            {/* Borde gradiente animado */}
            <div className="absolute inset-0 rounded-[17px] bg-gradient-to-br from-phd-cyan via-phd-pink to-phd-purple opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative phd-glass rounded-2xl p-8 flex flex-col gap-6 bg-phd-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-phd-cyan/15 flex items-center justify-center">
                  <CheckIcon />
                </div>
                <h3 className="font-heading font-bold text-white text-xl">
                  La Promesa PHD
                </h3>
              </div>
              <ul className="flex flex-col gap-5">
                {PHD_PROS.map(({ title, description }) => (
                  <li key={title} className="flex gap-3">
                    <CheckIcon />
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
