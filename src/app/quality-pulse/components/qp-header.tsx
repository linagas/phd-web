import Link from "next/link";

const NAV_ITEMS_PENDING = [] as const;

export default function QpHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-phd-dark/80 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 h-16 flex items-center justify-between gap-4">
        <Link href="/quality-pulse" className="flex items-center gap-2 shrink-0">
          <span className="flex items-end gap-0.5 h-4" aria-hidden="true">
            <span className="w-1 h-2 rounded-sm bg-phd-cyan" />
            <span className="w-1 h-4 rounded-sm bg-phd-purple" />
            <span className="w-1 h-3 rounded-sm bg-phd-pink" />
          </span>
          <span className="font-heading font-extrabold text-sm tracking-wide text-white">
            QUALITY <span className="text-phd-pink">PULSE</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6" aria-label="Navegación Quality Pulse">
          {NAV_ITEMS_PENDING.map((item) => (
            <span
              key={item}
              title="Próximamente"
              className="text-sm text-slate-500 cursor-not-allowed select-none"
            >
              {item}
            </span>
          ))}
        </nav>

        <Link
          href="/quality-pulse"
          className="border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-wider uppercase rounded-full px-4 py-2 transition-colors whitespace-nowrap"
        >
          Assessment colaborativo
        </Link>
      </div>
    </header>
  );
}
