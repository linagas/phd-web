"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
} from "@/models/quality-pulse/catalog-question-model";
import type { PublicAssessmentStatus } from "@/services/quality-pulse/assessment-service";
import { calculateResults, QualityPulseResults } from "@/utils/quality-pulse/scoring";
import ResultsPanel from "./results-panel";
import ClientNotFound from "../../components/client-not-found";

const CLIENT_QUERY_PARAM = "cliente";

export default function ResultsView() {
  const searchParams = useSearchParams();
  const clientName = searchParams?.get(CLIENT_QUERY_PARAM) ?? "";

  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [status, setStatus] = useState<PublicAssessmentStatus | null>(null);
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
          const statusData: PublicAssessmentStatus = await assessmentsRes.json();
          const catalogData: CatalogQuestion[] = await catalogRes.json();
          if (!cancelled) {
            setStatus(statusData);
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
    if (catalog.length === 0 || !status?.submissions) return null;
    return calculateResults(status.submissions, catalog);
  }, [status, catalog]);

  const answeredProfiles = useMemo(
    () => new Set(status?.answeredProfiles ?? []),
    [status]
  );
  const allProfilesAnswered = answeredProfiles.size === QUALITY_PULSE_PROFILES.length;
  // Gate (D4/qp-results-publication): 4/4 respondidos pero el cliente aún no
  // fue publicado por un admin — `submissions` llega `null` aunque
  // `answeredProfiles` ya esté completo.
  const inReview = allProfilesAnswered && status !== null && !status.isPublished;

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

  if (!loading && !error && !clientNotFound && inReview) {
    return (
      <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
        <div className="phd-glass rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
          <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-phd-cyan/10 border border-phd-cyan/20">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="text-phd-cyan">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h2 className="font-heading font-bold text-white text-xl">Resultados en revisión</h2>
          <p className="text-slate-400 text-sm">
            Los 4 perfiles de <span className="text-white font-semibold">{clientName}</span> ya
            respondieron. Nuestro equipo está validando el diagnóstico antes de publicarlo.
            Vuelve a intentarlo más tarde.
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
        <div className="flex flex-col gap-4">
          <Link
            href={`/quality-pulse?${CLIENT_QUERY_PARAM}=${encodeURIComponent(clientName)}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-phd-cyan transition-colors w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 12.5 5.5 8 10 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver a Quality Pulse
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
              Resultados Quality Pulse
            </p>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {clientName}
            </h1>
          </div>
        </div>

        {loading && <p className="text-slate-400 text-sm">Calculando resultados…</p>}
        {error && (
          <p role="alert" className="text-sm text-phd-pink">
            {error}
          </p>
        )}

        {!loading && !error && results && (
          <ResultsPanel results={results} catalog={catalog} />
        )}
      </div>
    </section>
  );
}
