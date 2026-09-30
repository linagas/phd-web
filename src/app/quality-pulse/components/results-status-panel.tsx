import Link from "next/link";

interface ResultsStatusPanelProps {
  answeredCount: number;
  totalProfiles: number;
  clientName: string;
}

export default function ResultsStatusPanel({
  answeredCount,
  totalProfiles,
  clientName,
}: ResultsStatusPanelProps) {
  const percentage = totalProfiles === 0 ? 0 : Math.round((answeredCount / totalProfiles) * 100);
  const allProfilesAnswered = answeredCount === totalProfiles;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="text-phd-cyan"
          >
            <rect x="2" y="4" width="20" height="14" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M8 20h8" />
          </svg>
          <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Estado de recopilación
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="text-lg">
            <span className="font-heading font-bold text-white text-2xl">{answeredCount}</span>
            <span className="text-slate-400"> / {totalProfiles} perfiles respondieron</span>
          </p>
          <span className="font-heading font-bold text-4xl text-white/10 leading-none">
            {percentage}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-phd-cyan via-phd-purple to-phd-pink transition-all"
            style={{ width: `${Math.max(percentage, answeredCount > 0 ? 4 : 2)}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-phd-pink/10 border border-phd-pink/20 shrink-0">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-phd-pink" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M8 17V10m5 7V6m5 11v-5" />
            </svg>
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-semibold text-white text-base">
              Resultados consolidados
            </h3>
            <p className="text-slate-400 text-sm">
              Promedio multiperfil, benchmark, impacto y radar para el cliente.
            </p>
          </div>
        </div>

        {allProfilesAnswered ? (
          <Link
            href={`/quality-pulse/resultados?cliente=${encodeURIComponent(clientName)}`}
            className="flex items-center gap-2 border border-white/10 hover:border-phd-cyan/40 hover:bg-phd-cyan/5 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all whitespace-nowrap"
          >
            Ver resultados
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-2 border border-white/5 text-slate-500 text-sm font-semibold px-5 py-2.5 rounded-full cursor-not-allowed whitespace-nowrap">
              Ver resultados
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
            <span className="text-xs text-slate-500">
              Disponible cuando los {totalProfiles} perfiles respondan.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
