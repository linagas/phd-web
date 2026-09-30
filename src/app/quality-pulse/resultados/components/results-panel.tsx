import {
  CatalogQuestion,
} from "@/models/quality-pulse/catalog-question-model";
import {
  DIMENSIONS,
  DimensionScore,
  FinalAnswer,
  ImpactItem,
  PERSPECTIVE_NAMES,
  PerspectiveScore,
  QualityPulseResults,
} from "@/utils/quality-pulse/scoring";
import RadarChart from "./radar-chart";

const BENCHMARK_TARGET = 75;

interface HealthLevel {
  label: string;
  className: string;
}

function getHealthLevel(score: number): HealthLevel {
  if (score < 25) return { label: "Crítico", className: "bg-red-500/15 text-red-400 border-red-500/30" };
  if (score < 50) return { label: "En desarrollo", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" };
  if (score < 75) return { label: "Gestionado", className: "bg-phd-cyan/15 text-phd-cyan border-phd-cyan/30" };
  return { label: "Saludable", className: "bg-green-500/15 text-green-400 border-green-500/30" };
}

function HealthScoreCard({ score }: { score: number }) {
  const level = getHealthLevel(score);
  return (
    <div className="phd-glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
        Quality Health Score
      </p>
      <span className="font-heading font-bold text-white text-6xl leading-none">{score}</span>
      <span className={`border rounded-full px-5 py-1.5 text-sm font-bold tracking-wider ${level.className}`}>
        {level.label}
      </span>
    </div>
  );
}

function BenchmarkTable({ perspectiveScores }: { perspectiveScores: PerspectiveScore[] }) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 overflow-x-auto">
      <h3 className="font-heading font-semibold text-white text-lg mb-4">
        Benchmark por perspectiva
      </h3>
      <table className="w-full text-sm min-w-[420px]">
        <thead>
          <tr className="text-left text-slate-500 uppercase text-xs tracking-wider">
            <th className="pb-3 font-semibold">Perspectiva</th>
            <th className="pb-3 font-semibold">Actual</th>
            <th className="pb-3 font-semibold">Objetivo</th>
            <th className="pb-3 font-semibold">Brecha</th>
          </tr>
        </thead>
        <tbody>
          {perspectiveScores.map((perspective) => {
            const gap = BENCHMARK_TARGET - perspective.score;
            return (
              <tr key={perspective.name} className="border-t border-white/5">
                <td className="py-3 text-slate-200">{perspective.name}</td>
                <td className="py-3 text-white font-semibold">{perspective.score}</td>
                <td className="py-3 text-slate-500">{BENCHMARK_TARGET}</td>
                <td className={`py-3 font-semibold ${gap > 0 ? "text-phd-pink" : "text-green-400"}`}>
                  {gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DimensionsGrid({ dimensionScores }: { dimensionScores: DimensionScore[] }) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8">
      <h3 className="font-heading font-semibold text-white text-lg mb-4">
        Estado de las dimensiones
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensionScores.map((dimension) => (
          <div key={dimension.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{dimension.id}</p>
            <p className="text-sm text-slate-200 mt-1">{dimension.name}</p>
            <p className="mt-3 font-heading font-bold text-2xl text-white">
              {dimension.score === null ? (
                <span className="text-slate-500 text-sm font-body font-normal">Sin datos</span>
              ) : (
                dimension.score
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GapsList({
  gaps,
  questionsById,
}: {
  gaps: FinalAnswer[];
  questionsById: Map<string, CatalogQuestion>;
}) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8">
      <h3 className="font-heading font-semibold text-white text-lg mb-4">
        Hallazgos ({gaps.length})
      </h3>
      {gaps.length === 0 ? (
        <p className="text-sm text-slate-500">No se detectaron brechas relevantes.</p>
      ) : (
        <div
          role="region"
          aria-label="Lista de hallazgos"
          tabIndex={0}
          className="phd-scrollbar max-h-[28rem] overflow-y-auto pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan/50 rounded-xl"
        >
          <ul className="flex flex-col gap-3">
            {gaps.map((gap) => (
              <li key={gap.questionId} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">
                  {questionsById.get(gap.questionId)?.text ?? gap.questionId}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-phd-pink/30 bg-phd-pink/10 text-phd-pink">
                    {gap.rule.signal}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/10 bg-white/5 text-slate-300">
                    Impacto: {gap.rule.impact}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/10 bg-white/5 text-slate-300">
                    Prioridad: {gap.rule.priority}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ImpactRanking({ impacts }: { impacts: ImpactItem[] }) {
  const maxCount = Math.max(1, ...impacts.map((impact) => impact.count));

  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8">
      <h3 className="font-heading font-semibold text-white text-lg mb-4">
        Ranking de impactos
      </h3>
      <div className="flex flex-col gap-3">
        {impacts.map((impact) => (
          <div key={impact.key} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{impact.label}</span>
              <span className="font-mono">{impact.count}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-phd-cyan via-phd-pink to-phd-purple"
                style={{ width: `${(impact.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ResultsPanelProps {
  results: QualityPulseResults;
  catalog: CatalogQuestion[];
}

export default function ResultsPanel({ results, catalog }: ResultsPanelProps) {
  const questionsById = new Map(catalog.map((question) => [question.id, question]));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <HealthScoreCard score={results.healthScore} />
        <div className="lg:col-span-2 phd-glass rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
              Perspectivas
            </p>
            <RadarChart
              axes={PERSPECTIVE_NAMES.map((name) => ({
                label: name,
                value: results.perspectiveScores.find((score) => score.name === name)?.score ?? 0,
              }))}
              color="#38BDF8"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
              Dimensiones
            </p>
            <RadarChart
              axes={DIMENSIONS.map((dimension) => ({
                label: dimension.id,
                value:
                  results.dimensionScores.find((score) => score.id === dimension.id)?.score ?? null,
              }))}
              color="#F43F5E"
            />
          </div>
        </div>
      </div>

      <BenchmarkTable perspectiveScores={results.perspectiveScores} />
      <DimensionsGrid dimensionScores={results.dimensionScores} />
      <ImpactRanking impacts={results.impacts} />
      <GapsList gaps={results.gaps} questionsById={questionsById} />
    </div>
  );
}
