"use client";
import { usePrintReport } from "@/hooks/usePrintReport";
import {
  ClientRow,
  CoverageSummary,
  derivePublicationState,
  describePublicationState,
  formatLastUpdate,
  formatRowScore,
  scoreTone,
  ScoreTone,
} from "@/utils/quality-pulse/admin-view-models";
import {
  RegistrationBadge,
  StateBadge,
} from "@/app/quality-pulse/components/publication-badges";
import PublicationStepper from "./publication-stepper";

interface ClientHeroProps {
  row: ClientRow;
  coverage: CoverageSummary;
  canPublish: boolean;
  submitting: boolean;
  confirmError: string;
  onPublish: () => void;
}

const SCORE_TEXT_CLASSES: Record<ScoreTone, string> = {
  none: "text-slate-500",
  low: "text-phd-pink",
  mid: "text-amber-300",
  high: "text-emerald-300",
};

/** Ficha hero: title, meta, coverage/AQI stats, publication stepper and current-state card. */
export default function ClientHero({
  row,
  coverage,
  canPublish,
  submitting,
  confirmError,
  onPublish,
}: ClientHeroProps) {
  const state = derivePublicationState(row);
  const { printReport } = usePrintReport(`Quality Pulse - ${row.clientName}`);
  const registeredAt = row.createdAt ? formatLastUpdate(row.createdAt) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Ficha de cliente
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {row.clientName}
            </h1>
            <StateBadge state={state} />
            <RegistrationBadge isRegistered={row.isRegistered} />
          </div>
          {(row.registeredBy || registeredAt) && (
            <p className="flex flex-wrap gap-x-4 text-sm text-slate-400">
              {row.registeredBy && (
                <span>Registrado por {row.registeredBy}</span>
              )}
              {registeredAt && <span>Registrado: {registeredAt}</span>}
            </p>
          )}
        </div>

        <dl className="phd-glass rounded-2xl px-6 py-4 flex gap-8">
          <div className="flex flex-col gap-1">
            <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Cobertura
            </dt>
            <dd className="text-2xl font-heading font-bold text-white">
              {coverage.answered}/{coverage.total}{" "}
              <span className="text-xs font-semibold text-slate-400">
                ítems
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              AQI consolidado
            </dt>
            <dd
              className={`text-2xl font-heading font-bold ${SCORE_TEXT_CLASSES[scoreTone(row.healthScore)]}`}
            >
              {formatRowScore(row.healthScore)}
              {row.healthScore !== null && (
                <span className="text-xs font-semibold text-slate-400">
                  /100
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <section
        aria-labelledby="publication-cycle-title"
        className="phd-glass rounded-2xl p-6 flex flex-col gap-4"
      >
        <PublicationStepper state={state} />
      </section>

      <section
        aria-labelledby="current-state-title"
        className="phd-glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Estado actual
          </p>
          <h2
            id="current-state-title"
            className="font-heading font-semibold text-white text-xl"
          >
            {state}
          </h2>
          <p className="text-sm text-slate-400">
            {describePublicationState(state)}
          </p>
          <p className="text-xs text-slate-500">
            {row.isPublished
              ? `Publicado${row.publishedBy ? ` por ${row.publishedBy}` : ""}${
                  row.publishedAt
                    ? ` el ${formatLastUpdate(row.publishedAt)}`
                    : ""
                }`
              : "Aún no publicado"}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-start sm:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={printReport}
              aria-label={`Exportar PDF de la ficha de ${row.clientName}`}
              className="print:hidden bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold px-6 py-3 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
            >
              Exportar PDF
            </button>
            {canPublish && (
              <button
                type="button"
                onClick={onPublish}
                disabled={submitting}
                className="print:hidden bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
              >
                {submitting ? "Publicando…" : "Publicar al cliente"}
              </button>
            )}
          </div>
          {canPublish && confirmError && (
            <p role="alert" className="text-sm text-phd-pink">
              {confirmError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
