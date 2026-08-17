"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import {
  calculateResults,
  DIMENSIONS,
  DimensionScore,
  FinalAnswer,
  ImpactItem,
  PERSPECTIVE_NAMES,
  PerspectiveScore,
  QualityPulseResults,
} from "@/utils/quality-pulse/scoring";
import RadarChart from "./radar-chart";
import ClientNotFound from "../../components/client-not-found";

const CLIENT_QUERY_PARAM = "cliente";
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

export default function ResultsView() {
  const searchParams = useSearchParams();
  const clientName = searchParams?.get(CLIENT_QUERY_PARAM) ?? "";

  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [submissions, setSubmissions] = useState<QualityPulseAssessment[]>([]);
  const [loading, setLoading] = useState(Boolean(clientName));
  const [error, setError] = useState("");
  const [clientNotFound, setClientNotFound] = useState(false);

  useEffect(() => {
    if (!clientName) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setClientNotFound(false);

    fetch(`/api/quality-pulse/clients?organization=${encodeURIComponent(clientName)}`)
      .then(async (existsRes) => {
        if (!existsRes.ok) throw new Error("No se pudo validar el cliente.");
        const { exists } = await existsRes.json();
        if (cancelled) return;
        if (!exists) {
          setClientNotFound(true);
          setLoading(false);
          return;
        }

        return Promise.all([
          fetch(`/api/quality-pulse/assessments?organization=${encodeURIComponent(clientName)}`),
          fetch("/api/quality-pulse/catalog"),
        ]).then(async ([assessmentsRes, catalogRes]) => {
          if (!assessmentsRes.ok || !catalogRes.ok) {
            throw new Error("No se pudo cargar el diagnóstico.");
          }
          const assessmentsData: QualityPulseAssessment[] = await assessmentsRes.json();
          const catalogData: CatalogQuestion[] = await catalogRes.json();
          if (!cancelled) {
            setSubmissions(assessmentsData);
            setCatalog(catalogData);
          }
        });
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el diagnóstico. Inténtalo de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientName]);

  const results: QualityPulseResults | null = useMemo(() => {
    if (catalog.length === 0) return null;
    return calculateResults(submissions, catalog);
  }, [submissions, catalog]);

  const questionsById = useMemo(
    () => new Map(catalog.map((question) => [question.id, question])),
    [catalog]
  );

  const answeredProfiles = useMemo(
    () => new Set(submissions.map((submission) => submission.profile)),
    [submissions]
  );
  const allProfilesAnswered = answeredProfiles.size === QUALITY_PULSE_PROFILES.length;

  if (!clientName) {
    return (
      <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
        <div className="phd-glass rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
          <h2 className="font-heading font-bold text-white text-xl">
            Falta el nombre del cliente
          </h2>
          <p className="text-slate-400 text-sm">
            Vuelve a Quality Pulse e ingresa el nombre de la empresa para ver su diagnóstico.
          </p>
          <Link
            href="/quality-pulse"
            className="w-full flex items-center justify-center bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all"
          >
            Volver a Quality Pulse
          </Link>
        </div>
      </section>
    );
  }

  if (!loading && !error && clientNotFound) {
    return <ClientNotFound clientName={clientName} />;
  }

  if (!loading && !error && !clientNotFound && !allProfilesAnswered) {
    return (
      <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
        <div className="phd-glass rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
          <h2 className="font-heading font-bold text-white text-xl">Diagnóstico incompleto</h2>
          <p className="text-slate-400 text-sm">
            Faltan perfiles por responder para <span className="text-white font-semibold">{clientName}</span>
            . Los resultados consolidados están disponibles cuando los{" "}
            {QUALITY_PULSE_PROFILES.length} perfiles hayan completado el cuestionario (
            {answeredProfiles.size}/{QUALITY_PULSE_PROFILES.length} respondidos).
          </p>
          <Link
            href={`/quality-pulse?${CLIENT_QUERY_PARAM}=${encodeURIComponent(clientName)}`}
            className="w-full flex items-center justify-center bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all"
          >
            Volver a Quality Pulse
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur px-4 sm:px-8 lg:px-16 py-24">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Resultados Quality Pulse
          </p>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
            {clientName}
          </h1>
        </div>

        {loading && <p className="text-slate-400 text-sm">Calculando resultados…</p>}
        {error && (
          <p role="alert" className="text-sm text-phd-pink">
            {error}
          </p>
        )}

        {!loading && !error && results && (
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
                      value:
                        results.perspectiveScores.find((score) => score.name === name)?.score ?? 0,
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
                        results.dimensionScores.find((score) => score.id === dimension.id)?.score ??
                        null,
                    }))}
                    color="#F43F5E"
                  />
                </div>
              </div>
            </div>

            <BenchmarkTable perspectiveScores={results.perspectiveScores} />
            <DimensionsGrid dimensionScores={results.dimensionScores} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GapsList gaps={results.gaps} questionsById={questionsById} />
              <ImpactRanking impacts={results.impacts} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
