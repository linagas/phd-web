import Link from "next/link";

interface Service {
  number: string;
  badge: string;
  title: string;
  description: string;
  footer: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor: string;
  numberColor: string;
  badgeColor: string;
}

const SERVICES: Service[] = [
  {
    number: "01",
    badge: "Entrada",
    title: "Quality Pulse",
    description:
      "Radiografía profunda y científica de tu calidad y velocidad real en solo 72 horas. El diagnóstico que siempre precede al tratamiento.",
    footer: "Fija: 10 UF · Reembolsable",
    ctaLabel: "Reservar",
    ctaHref: "/#bookings",
    accentColor: "group-hover:border-phd-cyan",
    numberColor: "text-white/10 group-hover:text-phd-cyan/30",
    badgeColor: "bg-phd-cyan/10 text-phd-cyan border-phd-cyan/20",
  },
  {
    number: "02",
    badge: "Core",
    title: "Quality by Design",
    description:
      "Estrategia activa e implementación in-situ. Integramos marcos de calidad directamente desde el diseño original de software para escalabilidad sin riesgo.",
    footer: "Horizonte 2",
    ctaLabel: "Ver Hoja de Ruta",
    ctaHref: "/#viaje",
    accentColor: "group-hover:border-phd-pink",
    numberColor: "text-white/10 group-hover:text-phd-pink/30",
    badgeColor: "bg-phd-pink/10 text-phd-pink border-phd-pink/20",
  },
  {
    number: "03",
    badge: "Diferencial",
    title: "QE · AI + AQI",
    description:
      "Certificamos la salud de la IA que implementas. Usamos el AI Quality Index exclusivo de PHD para medir la adopción real e impacto en defectos.",
    footer: "Métrica Exclusiva",
    ctaLabel: "Probar Autocalculador",
    ctaHref: "/#aqi-tool",
    accentColor: "group-hover:border-phd-purple",
    numberColor: "text-white/10 group-hover:text-phd-purple/30",
    badgeColor: "bg-phd-purple/10 text-phd-purple border-phd-purple/20",
  },
  {
    number: "04",
    badge: "Formación",
    title: "QE Next",
    description:
      "Desarrollo y capacitación para tu equipo interno. Preparamos y certificamos al profesional de calidad que tu empresa requerirá mañana para asegurar la autonomía.",
    footer: "Horizonte 3",
    ctaLabel: "Autonomía total",
    ctaHref: "/#viaje",
    accentColor: "group-hover:border-slate-500",
    numberColor: "text-white/10 group-hover:text-slate-500/40",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
];

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className={`phd-glass border border-white/5 transition-all group flex flex-col gap-4 p-6 ${service.accentColor}`}>
      <div className="flex items-start justify-between">
        <span className={`font-heading text-7xl font-bold leading-none transition-colors ${service.numberColor}`}>
          {service.number}
        </span>
        <span className={`text-xs border rounded-full px-3 py-0.5 font-semibold ${service.badgeColor}`}>
          {service.badge}
        </span>
      </div>
      <h3 className="font-heading font-bold text-white text-lg">{service.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">{service.description}</p>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
        <span className="text-xs text-slate-500">{service.footer}</span>
        <Link href={service.ctaHref} className="text-sm text-phd-cyan font-semibold hover:underline underline-offset-4">
          {service.ctaLabel} &rsaquo;
        </Link>
      </div>
    </div>
  );
}

export default function ServicesGrid() {
  return (
    <section id="servicios" className="bg-phd-dark py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-phd-purple mb-4">
            Portafolio de Servicios
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white tracking-tight">
            Cuatro servicios.{" "}
            <span className="text-phd-purple">Un solo sistema</span> continuo.
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            Todo parte del diagnóstico obligatorio: no implementamos recetas sin
            antes certificar científicamente dónde están las fallas críticas de tu software.
          </p>
        </div>

        {/* Grid de 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.number} service={service} />
          ))}
        </div>

      </div>
    </section>
  );
}
