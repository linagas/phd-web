import Link from "next/link";
import { InstagramIcon, LinkedinIcon } from "../rrss-icons";

const NAV_LINKS = [
  { label: "El Costo Silencioso", href: "/#dolor" },
  { label: "Diferencia PHD", href: "/#diferencia" },
  { label: "Portafolio", href: "/#servicios" },
  { label: "Autoevaluar AQI", href: "/#aqi-tool" },
  { label: "Roadmap", href: "/#viaje" },
];

const TECH_STACK = ["Next.js", "TypeScript", "MongoDB", "Vercel"];

export default function Footer() {
  return (
    <footer className="bg-phd-card border-t border-white/5 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Columna marca — 5 cols */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Logo 3 círculos */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-phd-cyan" />
                <span className="w-3.5 h-3.5 rounded-full bg-phd-pink" />
                <span className="w-3.5 h-3.5 rounded-full bg-phd-purple" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-white text-lg tracking-tight">PHD</span>
                <span className="font-body text-slate-400 text-[10px] tracking-widest uppercase mt-0.5">
                  Quality Engineering
                </span>
              </div>
            </div>

            {/* Quote */}
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs italic">
              &ldquo;Nos quedamos. Hasta que funcione.&rdquo;
            </p>

            {/* Redes sociales */}
            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/phdchilespa/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-phd-pink transition-colors"
                aria-label="Instagram PHD"
              >
                <InstagramIcon className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/phd-chile/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-phd-cyan transition-colors"
                aria-label="LinkedIn PHD"
              >
                <LinkedinIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Columna navegación — 3 cols */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Nuestra Web
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-slate-400 hover:text-phd-cyan transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Columna stack — 4 cols */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Tecnología de la Web
            </p>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-white/5 border border-white/10 text-slate-400 px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-2">
              ¿Preguntas?{" "}
              <a
                href="mailto:contacto@phdchile.cl"
                className="text-phd-cyan hover:underline underline-offset-4"
              >
                contacto@phdchile.cl
              </a>
            </p>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © 2025 PHD Quality Engineering. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-600">
            Santiago, Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
