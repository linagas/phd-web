"use client";
import { useCallback, useEffect, useState } from "react";
import { DashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { enrichPendingReview } from "@/utils/quality-pulse/admin-view-models";
import KpiCards from "./kpi-cards";
import ClientScoreTable from "./client-score-table";
import PendingReviewList from "./pending-review-list";

const DASHBOARD_ENDPOINT = "/api/quality-pulse/admin/dashboard";
const LOAD_ERROR_MESSAGE = "No se pudo cargar el resumen del dashboard.";

/**
 * Compone el Dashboard admin (`GET /api/quality-pulse/admin/dashboard`, D9):
 * KPIs, "Pendientes de Revisión" y el Quality Health Score global/por
 * cliente. El guard de sesión vive en `(console)/layout.tsx`, esta vista solo
 * consume el endpoint ya protegido. "Revisar y publicar" es un `<Link>`
 * (`PendingReviewList`) hacia `/revisar`; esta vista ya no publica nada.
 */
export default function DashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(DASHBOARD_ENDPOINT);
      if (!res.ok) {
        throw new Error(LOAD_ERROR_MESSAGE);
      }
      const data: DashboardSummary = await res.json();
      setSummary(data);
    } catch {
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <section className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Quality Pulse · Administración
          </p>
          <h1 className="font-heading font-bold text-white text-3xl">Dashboard</h1>
        </div>

        {loading && <p className="text-slate-400 text-sm">Cargando datos…</p>}
        {error && (
          <p role="alert" className="text-sm text-phd-pink">
            {error}
          </p>
        )}

        {!loading && !error && summary && (
          <div data-testid="dashboard-layout" className="grid grid-cols-1 gap-10">
            <KpiCards kpis={summary.kpis} globalHealthScore={summary.globalHealthScore} />
            <PendingReviewList
              items={enrichPendingReview(summary.pendingReview, summary.clients)}
            />
            <ClientScoreTable
              clients={summary.clients}
              globalHealthScore={summary.globalHealthScore}
            />
          </div>
        )}
      </div>
    </section>
  );
}
