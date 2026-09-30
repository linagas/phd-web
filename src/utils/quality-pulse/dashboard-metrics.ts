import { CatalogQuestion, QUALITY_PULSE_PROFILES } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  ProfileScore,
  aggregateHealthScore,
  calculateProfileScores,
  calculateResults,
} from "@/utils/quality-pulse/scoring";

const EXPECTED_PROFILES_PER_CLIENT = QUALITY_PULSE_PROFILES.length;

export interface DashboardKpis {
  registeredClients: number;
  submissions: number;
  expectedSubmissions: number;
  completionPct: number;
  pendingReview: number;
}

export interface ClientDashboardSummary {
  clientKey: string;
  clientName: string;
  isPublished: boolean;
  answeredCount: number;
  healthScore: number | null;
  profileScores: ProfileScore[];
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  globalHealthScore: number | null;
  clients: ClientDashboardSummary[];
  pendingReview: { clientKey: string; clientName: string }[];
}

function groupSubmissionsByClient(
  submissions: QualityPulseAssessment[]
): Map<string, QualityPulseAssessment[]> {
  const byClient = new Map<string, QualityPulseAssessment[]>();
  for (const submission of submissions) {
    const existing = byClient.get(submission.clientKey) ?? [];
    existing.push(submission);
    byClient.set(submission.clientKey, existing);
  }
  return byClient;
}

function buildClientSummary(
  client: QualityPulseClient,
  clientSubmissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): ClientDashboardSummary {
  const profileScores = calculateProfileScores(clientSubmissions, catalog);
  const answeredCount = profileScores.filter((score) => score.status === "answered").length;
  const healthScore =
    answeredCount === 0 ? null : calculateResults(clientSubmissions, catalog).healthScore;

  return {
    clientKey: client.clientKey,
    clientName: client.clientName,
    isPublished: client.isPublished,
    answeredCount,
    healthScore,
    profileScores,
  };
}

/**
 * Composición pura del resumen del Dashboard (D9). Toma los datos ya
 * cargados (clientes registrados, todas las submissions, catálogo) y deriva
 * KPIs, el Quality Health Score global (D1) y la lista de pendientes de
 * revisión (4/4 && !isPublished). No hace I/O.
 */
export function buildDashboardSummary(
  clients: QualityPulseClient[],
  submissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): DashboardSummary {
  const submissionsByClient = groupSubmissionsByClient(submissions);
  const clientSummaries = clients.map((client) =>
    buildClientSummary(client, submissionsByClient.get(client.clientKey) ?? [], catalog)
  );

  const registeredKeys = new Set(clients.map((client) => client.clientKey));
  const registeredSubmissionCount = submissions.filter((submission) =>
    registeredKeys.has(submission.clientKey)
  ).length;

  const expectedSubmissions = clients.length * EXPECTED_PROFILES_PER_CLIENT;
  const completionPct =
    expectedSubmissions === 0
      ? 0
      : Math.round((registeredSubmissionCount / expectedSubmissions) * 100);

  const pendingReview = clientSummaries
    .filter(
      (client) => client.answeredCount === EXPECTED_PROFILES_PER_CLIENT && !client.isPublished
    )
    .map((client) => ({ clientKey: client.clientKey, clientName: client.clientName }));

  const globalHealthScore = aggregateHealthScore(
    clientSummaries.map((client) => ({
      healthScore: client.healthScore,
      answeredCount: client.answeredCount,
    }))
  );

  return {
    kpis: {
      registeredClients: clients.length,
      submissions: registeredSubmissionCount,
      expectedSubmissions,
      completionPct,
      pendingReview: pendingReview.length,
    },
    globalHealthScore,
    clients: clientSummaries,
    pendingReview,
  };
}
