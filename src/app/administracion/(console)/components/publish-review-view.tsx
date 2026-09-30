"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CatalogQuestion,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  buildClientRows,
  calculateCoverage,
  canPublish,
  ClientRow,
} from "@/utils/quality-pulse/admin-view-models";
import { calculateResults } from "@/utils/quality-pulse/scoring";
import ResultsPanel from "@/app/quality-pulse/resultados/components/results-panel";
import ClientHero from "./client-hero";
import ClientProfileCards from "./client-profile-cards";
import ClientAdvancedActions from "./client-advanced-actions";

interface PublishReviewViewProps {
  clientKey: string;
}

const ASSESSMENTS_ENDPOINT = "/api/quality-pulse/assessments";
const CATALOG_ENDPOINT = "/api/quality-pulse/catalog";
const CLIENTS_ENDPOINT = "/api/quality-pulse/clients";
const PUBLICATION_ENDPOINT = "/api/quality-pulse/admin/publication";
const CLIENTES_HREF = "/administracion/clientes";

const ASSESSMENTS_ADMIN_ENDPOINT = "/api/quality-pulse/admin/assessments";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la información del cliente.";
const NOT_FOUND_MESSAGE = "No se encontró información para este cliente.";
const PUBLISH_ERROR_MESSAGE = "No se pudo publicar el cliente.";

type Phase = "loading" | "load-error" | "not-found" | "ready";

/**
 * Ficha de cliente en `/administracion/clientes/{clientKey}/revisar` (spec
 * `qp-admin-publish-review`). Funciona para cualquier estado de publicación:
 * la acción "Confirmar publicación" solo aparece si `canPublish(row)`; en los
 * demás casos es un detalle de solo lectura con tarjetas por perfil y
 * "Acciones avanzadas" (reiniciar perfil / cliente, despublicar). Es el ÚNICO
 * lugar que llama a `POST /api/quality-pulse/admin/publication`. El guard de
 * sesión vive en `(console)/layout.tsx`.
 */
export default function PublishReviewView({
  clientKey,
}: PublishReviewViewProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [row, setRow] = useState<ClientRow | null>(null);
  const [submissions, setSubmissions] = useState<QualityPulseAssessment[]>([]);
  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [publishedNow, setPublishedNow] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setPhase("loading");
      try {
        const [submissionsRes, catalogRes, clientsRes] = await Promise.all([
          fetch(ASSESSMENTS_ENDPOINT),
          fetch(CATALOG_ENDPOINT),
          fetch(CLIENTS_ENDPOINT),
        ]);

        if (!submissionsRes.ok || !catalogRes.ok || !clientsRes.ok) {
          throw new Error(LOAD_ERROR_MESSAGE);
        }

        const submissionsData: QualityPulseAssessment[] =
          await submissionsRes.json();
        const catalogData: CatalogQuestion[] = await catalogRes.json();
        const clientsData: QualityPulseClient[] = await clientsRes.json();

        setSubmissions(submissionsData);
        setCatalog(catalogData);

        const found = buildClientRows(
          clientsData,
          submissionsData,
          catalogData,
        ).find((candidate) => candidate.clientKey === clientKey);
        setRow(found ?? null);
        setPhase(found ? "ready" : "not-found");
      } catch {
        setPhase("load-error");
      }
    },
    [clientKey],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const results = useMemo(() => {
    if (phase !== "ready") return null;
    const clientSubmissions = submissions.filter(
      (submission) => submission.clientKey === clientKey,
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
        throw new Error(
          typeof body.error === "string" ? body.error : PUBLISH_ERROR_MESSAGE,
        );
      }
      setPublishedNow(true);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : PUBLISH_ERROR_MESSAGE,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const runAdminAction = async (
    url: string,
    body: Record<string, unknown>,
    fallbackMessage: string,
  ) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : fallbackMessage,
        );
      }
      setPublishedNow(false);
      await loadData(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetProfile = (profile: QualityPulseProfile) =>
    runAdminAction(
      ASSESSMENTS_ADMIN_ENDPOINT,
      { clientKey, profile },
      "No se pudo reiniciar el perfil.",
    );
  const handleResetAll = () =>
    runAdminAction(
      ASSESSMENTS_ADMIN_ENDPOINT,
      { clientKey, resetAll: true },
      "No se pudo reiniciar el cliente.",
    );
  const handleUnpublish = () =>
    runAdminAction(
      PUBLICATION_ENDPOINT,
      { clientKey },
      "No se pudo despublicar el cliente.",
    );

  const effectiveRow: ClientRow | null = row
    ? { ...row, isPublished: row.isPublished || publishedNow }
    : null;
  const clientSubmissions = submissions.filter(
    (submission) => submission.clientKey === clientKey,
  );
  const coverage = calculateCoverage(clientSubmissions, catalog);

  return (
    <section className="print-report min-h-screen bg-phd-dark phd-gradient-blur px-4 sm:px-8 lg:px-16 py-24">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="print:hidden flex flex-col gap-4">
          <Link
            href={CLIENTES_HREF}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-phd-cyan transition-colors w-fit"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12.5 5.5 8 10 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver a Clientes
          </Link>
        </div>

        {phase === "loading" && (
          <p className="text-slate-400 text-sm">Cargando información…</p>
        )}

        {phase === "load-error" && (
          <p role="alert" className="text-sm text-phd-pink">
            {LOAD_ERROR_MESSAGE}
          </p>
        )}

        {phase === "not-found" && (
          <p role="alert" className="text-sm text-phd-pink">
            {NOT_FOUND_MESSAGE}
          </p>
        )}

        {phase === "ready" && effectiveRow && (
          <div className="flex flex-col gap-6">
            <ClientHero
              row={effectiveRow}
              coverage={coverage}
              canPublish={canPublish(effectiveRow)}
              submitting={submitting}
              confirmError={confirmError}
              onPublish={handleConfirm}
            />

            {actionError && (
              <p role="alert" className="text-sm text-phd-pink">
                {actionError}
              </p>
            )}

            <ClientProfileCards
              profileScores={effectiveRow.profileScores}
              clientSubmissions={clientSubmissions}
              disabled={actionLoading}
              onResetProfile={handleResetProfile}
            />

            {results ? (
              <ResultsPanel results={results} catalog={catalog} />
            ) : (
              <p className="text-sm text-slate-500">
                Este cliente todavía no tiene respuestas.
              </p>
            )}

            {effectiveRow.isRegistered && (
              <ClientAdvancedActions
                clientName={effectiveRow.clientName}
                isPublished={effectiveRow.isPublished}
                disabled={actionLoading}
                onUnpublish={handleUnpublish}
                onResetAll={handleResetAll}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
