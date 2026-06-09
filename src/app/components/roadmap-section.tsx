import Link from "next/link";

interface Horizon {
  badge: string;
  badgeColor: string;
  icon: string;
  title: string;
  timeframe: string;
  description: string;
  deliverables: string[];
  accentColor: string;
  borderColor: string;
}

const HORIZONS: Horizon[] = [
  {
    badge: "H1",
    badgeColor: "bg-phd-cyan text-phd-dark",
    icon: "⚡",
    title: "Quick Wins",
    timeframe: "0 – 3 MESES",
    description: "Impacto visible en el core de tu negocio de forma inmediata:",
    deliverables: [
      "Eliminación de las 3 zonas ciegas críticas.",
      "Diagnóstico y medición base en 72 hrs.",
      "Reducción de re-trabajo en al menos 30%.",
    ],
    accentColor: "text-phd-cyan",
    borderColor: "border-phd-cyan/20",
  },
  {
    badge: "H2",
    badgeColor: "bg-phd-pink text-white",
    icon: "⚙️",
    title: "Transformación",
    timeframe: "3 – 9 MESES",
    description: "Cambio sostenible en arquitectura y cultura interna:",
    deliverables: [
      "Calidad integrada desde las etapas de diseño.",
      "Automatización total de la cobertura de riesgos.",
      "Implementación de IA validada bajo AQI.",
    ],
    accentColor: "text-phd-pink",
    borderColor: "border-phd-pink/20",
  },
  {
    badge: "H3",
    badgeColor: "bg-phd-purple text-white",
    icon: "🎓",
    title: "Autonomía",
    timeframe: "9 – 18 MESES",
    description: "PHD planifica activamente su retirada exitosa de la empresa:",
    deliverables: [
      "Tu equipo opera sin requerir la presencia de PHD.",
      "Sistema continuo de Quality Intelligence QIIC activo.",
      "Formación interna de perfiles QA a Quality Engineers.",
    ],
    accentColor: "text-phd-purple",
    borderColor: "border-phd-purple/20",
  },
];

function HorizonCard({ horizon }: { horizon: Horizon }) {
  return (
    <div className={`relative pt-8 phd-glass border ${horizon.borderColor} p-6 flex flex-col gap-4`}>
      {/* Badge flotante */}
      <span className={`absolute -top-4 left-6 ${horizon.badgeColor} text-sm font-bold px-4 py-1 rounded-lg`}>
        {horizon.badge}
      </span>

      <p className="text-xs tracking-widest uppercase text-slate-500">{horizon.timeframe}</p>

      <h3 className={`font-heading font-bold text-xl ${horizon.accentColor}`}>
        {horizon.icon} {horizon.title}
      </h3>

      <p className="text-sm text-slate-400">{horizon.description}</p>

      <ul className="flex flex-col gap-2">
        {horizon.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
            <span className={`mt-0.5 shrink-0 ${horizon.accentColor}`}>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RoadmapSection() {
  return (
    <section id="viaje" className="bg-phd-dark py-32 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-24">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-phd-purple mb-4">
            El Viaje de Transformación
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white tracking-tight">
            QE Roadmap: De diagnóstico a{" "}
            <span className="text-phd-purple">autonomía</span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            No generamos dependencia prolongada de consultores. Diseñamos nuestra
            salida planificada en tres etapas claras de evolución.
          </p>
        </div>

        {/* Grid de 3 horizontes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {HORIZONS.map((horizon) => (
            <HorizonCard key={horizon.badge} horizon={horizon} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/#bookings"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-phd-purple/50 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:bg-phd-purple/10"
          >
            Iniciar mi Horizonte 1
          </Link>
        </div>

      </div>
    </section>
  );
}
