import Link from "next/link";

const CREDIBILITY_ITEMS = ["Stripe Research", "IBM Curve", "NIST", "CISQ"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-phd-dark phd-gradient-blur flex items-center pt-20">
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Columna de texto — 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Badge animado */}
            <div className="flex items-center gap-2 w-fit border border-phd-pink/30 bg-phd-pink/10 rounded-full px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-phd-pink opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-phd-pink" />
              </span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-phd-pink">
                Consultora de Quality Engineering
              </span>
            </div>

            {/* H1 — con gradiente en "más frágil" */}
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-[1.1] tracking-tight">
              Su software es{" "}
              <span className="bg-gradient-to-r from-phd-cyan via-phd-pink to-phd-purple bg-clip-text text-transparent">
                más frágil
              </span>{" "}
              de lo que cree.
            </h1>

            {/* Subtítulo */}
            <p className="font-body text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl">
              PHD ayuda a empresas a descubrir, medir y resolver los riesgos de
              calidad que frenan su crecimiento, antes de que se conviertan en
              incidentes en producción.
            </p>

            {/* Garantía */}
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Nuestra garantía inquebrantable:{" "}
              <span className="text-phd-pink underline underline-offset-4">
                Nos quedamos. Hasta que funcione.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/#bookings"
                className="flex items-center justify-center bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-phd-pink/25"
              >
                Agendar Quality Pulse en 72h
              </Link>
              <Link
                href="/#dolor"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-7 py-3.5 rounded-full transition-all"
              >
                Calcular el Costo de No-QA
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>

            {/* Banda de credibilidad */}
            <div className="flex flex-wrap items-center gap-6 mt-4 pt-6 border-t border-white/5">
              <span className="text-xs text-slate-500 uppercase tracking-widest">
                Basado en estudios de
              </span>
              {CREDIBILITY_ITEMS.map((item) => (
                <span
                  key={item}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Widget de dashboard — 5 cols */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md phd-glass rounded-3xl overflow-hidden">
              {/* Dots estilo macOS */}
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-3 border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-auto text-xs text-slate-500 font-mono tracking-wider">
                  AQI REALTIME MONITOR V1.0
                </span>
              </div>
              {/* Contenido del widget */}
              <div className="p-6 flex flex-col gap-4 min-h-[280px] justify-between">
                <div className="flex flex-col gap-3">
                  <div className="h-3 bg-white/5 rounded-full w-3/4" />
                  <div className="h-3 bg-white/5 rounded-full w-1/2" />
                  <div className="h-20 bg-white/5 rounded-xl mt-2" />
                  <div className="h-3 bg-white/5 rounded-full w-2/3" />
                  <div className="h-3 bg-white/5 rounded-full w-1/3" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>
                    <span className="inline-block w-2 h-2 rounded-full bg-phd-cyan mr-1.5" />
                    Tasa de Desperdicio:{" "}
                    <span className="text-phd-cyan">40%</span>
                  </span>
                  <span>2026-05-29T15:27Z</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
