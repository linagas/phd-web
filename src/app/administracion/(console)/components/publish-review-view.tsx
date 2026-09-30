"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  buildClientRows,
  resolveReviewEligibility,
  ReviewEligibility,
} from "@/utils/quality-pulse/admin-view-models";
import { calculateResults } from "@/utils/quality-pulse/scoring";
import ResultsPanel from "@/app/quality-pulse/resultados/components/results-panel";

interface PublishReviewViewProps {
  clientKey: string;
}

const ASSESSMENTS_ENDPOINT = "/api/quality-pulse/assessments";
const CATALOG_ENDPOINT = "/api/quality-pulse/catalog";
const CLIENTS_ENDPOINT = "/api/quality-pulse/clients";
const PUBLICATION_ENDPOINT = "/api/quality-pulse/admin/publication";
const CLIENTES_HREF = "/administracion/clientes";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la información del cliente.";
const PUBLISH_ERROR_MESSAGE = "No se pudo publicar el cliente.";

type BlockedReason = Extract<ReviewEligibility, { kind: "blocked" }>["reason"];

const BLOCKED_MESSAGES: Record<BlockedReason, string> = {
  unknown: "No se encontró información para este cliente.",
  published: "Este cliente ya fue publicado.",
  unregistered: "Este cliente no está registrado.",
  incomplete: "Este cliente todavía no tiene los 4 perfiles respondidos.",
};

type Phase = "loading" | "load-error" | "blocked" | "ready" | "published";

/**
 * Contenedor de `/administracion/clientes/{clientKey}/revisar` (spec
 * `qp-admin-publish-review`). Es el ÚNICO lugar que llama a
 * `POST /api/quality-pulse/admin/publication`; el Dashboard y la tabla de
 * Clientes solo navegan hacia acá (`buildReviewHref`). El guard de sesión
 * vive en `(console)/layout.tsx`, este componente solo consume endpoints ya
 * protegidos.
 */
export default function PublishReviewView({ clientKey }: PublishReviewViewProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [blockedReason, setBlockedReason] = useState<BlockedReason | null>(null);
  const [submissions, setSubmissions] = useState<QualityPulseAssessment[]>([]);
  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const loadData = useCallback(async () => {
    setPhase("loading");
    setBlockedReason(null);
    try {
      const [submissionsRes, catalogRes, clientsRes] = await Promise.all([
        fetch(ASSESSMENTS_ENDPOINT),
        fetch(CATALOG_ENDPOINT),
        fetch(CLIENTS_ENDPOINT),
      ]);

      if (!submissionsRes.ok || !catalogRes.ok || !clientsRes.ok) {
        throw new Error(LOAD_ERROR_MESSAGE);
      }

      const submissionsData: QualityPulseAssessment[] = await submissionsRes.json();
      const catalogData: CatalogQuestion[] = await catalogRes.json();
      const clientsData: QualityPulseClient[] = await clientsRes.json();

      setSubmissions(submissionsData);
      setCatalog(catalogData);

      const rows = buildClientRows(clientsData, submissionsData, catalogData);
      const eligibility = resolveReviewEligibility(rows, clientKey);

      if (eligibility.kind === "blocked") {
        setBlockedReason(eligibility.reason);
        setPhase("blocked");
        return;
      }

      setPhase("ready");
    } catch {
      setPhase("load-error");
    }
  }, [clientKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const results = useMemo(() => {
    if (phase !== "ready" && phase !== "published") return null;
    const clientSubmissions = submissions.filter(
      (submission) => submission.clientKey === clientKey
    );
    if (clientSubmissions.length === 0) return null;
    return calculateResults(clientSubmissions, catalog);
  }, [phase, submissions, catalog, clientKey]);

  // No hay re-chequeo proactivo de elegibilidad antes de habilitar el botón
  // (decisión ya tomada en design.md): si el servidor rechaza el POST (ej.
  // el cliente dejó de ser 4/4 entre el load y el click), ese error se
  // muestra tal cual y el botón sigue habilitado.
  const handleConfirm = async () => {
    setSubmitting(true);
    setConfirmError("");
    try {
      const res = await fetch(PUBLICATION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : PUBLISH_ERROR_MESSAGE);
      }
      setPhase("published");
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : PUBLISH_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur px-4 sm:px-8 lg:px-16 py-24">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Link
            href={CLIENTES_HREF}
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
            Volver
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
              Revisión de publicación
            </p>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {clientKey}
            </h1>
          </div>
        </div>

        {phase === "loading" && <p className="text-slate-400 text-sm">Cargando información…</p>}

        {phase === "load-error" && (
          <p role="alert" className="text-sm text-phd-pink">
            {LOAD_ERROR_MESSAGE}
          </p>
        )}

        {phase === "blocked" && blockedReason && (
          <p role="alert" className="text-sm text-phd-pink">
            {BLOCKED_MESSAGES[blockedReason]}
          </p>
        )}

        {(phase === "ready" || phase === "published") && results && (
          <div className="flex flex-col gap-6">
            <ResultsPanel results={results} catalog={catalog} />

            {phase === "ready" && (
              <div className="flex flex-col gap-3 items-start">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all disabled:opacity-50"
                >
                  {submitting ? "Publicando…" : "Confirmar publicación"}
                </button>
                {confirmError && (
                  <p role="alert" className="text-sm text-phd-pink">
                    {confirmError}
                  </p>
                )}
              </div>
            )}

            {phase === "published" && (
              <span className="w-fit border border-green-500/30 bg-green-500/15 text-green-400 rounded-full px-5 py-1.5 text-sm font-bold tracking-wider">
                Publicado
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
