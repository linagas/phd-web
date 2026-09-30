import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { ProfileScore, calculateProfileScores, calculateResults } from "@/utils/quality-pulse/scoring";
import { ClientDashboardSummary, DashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";

export type PublicationState = "Publicado" | "Pendiente de revisión" | "En progreso";

export interface ClientRow {
  clientKey: string;
  clientName: string;
  isRegistered: boolean;
  isPublished: boolean;
  answeredCount: number;
  healthScore: number | null;
  profileScores: ProfileScore[];
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

function buildRow(
  clientKey: string,
  clientName: string,
  isRegistered: boolean,
  isPublished: boolean,
  clientSubmissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): ClientRow {
  const profileScores = calculateProfileScores(clientSubmissions, catalog);
  const answeredCount = profileScores.filter((score) => score.status === "answered").length;
  const healthScore =
    answeredCount === 0 ? null : calculateResults(clientSubmissions, catalog).healthScore;

  return {
    clientKey,
    clientName,
    isRegistered,
    isPublished,
    answeredCount,
    healthScore,
    profileScores,
  };
}

/**
 * Deriva la fila de tabla de clientes (registrados + legacy) reusando las
 * mismas funciones puras de scoring que usa el Dashboard, para que el score
 * coincida exactamente con el backend. Un cliente legacy (sin alta en
 * `qualityPulseClients`) nunca aparece como publicado (D1: Q1).
 */
export function buildClientRows(
  clients: QualityPulseClient[],
  submissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): ClientRow[] {
  const submissionsByClient = groupSubmissionsByClient(submissions);
  const registeredKeys = new Set(clients.map((client) => client.clientKey));

  const registeredRows = clients.map((client) =>
    buildRow(
      client.clientKey,
      client.clientName,
      true,
      client.isPublished,
      submissionsByClient.get(client.clientKey) ?? [],
      catalog
    )
  );

  const legacySubmissions = submissions.filter(
    (submission) => !registeredKeys.has(submission.clientKey)
  );
  const legacySubmissionsByClient = groupSubmissionsByClient(legacySubmissions);

  const legacyClientRows = Array.from(legacySubmissionsByClient.entries()).map(
    ([clientKey, clientSubmissions]) =>
      buildRow(clientKey, clientSubmissions[0].clientName, false, false, clientSubmissions, catalog)
  );

  return [...registeredRows, ...legacyClientRows].sort((a, b) =>
    a.clientName.localeCompare(b.clientName)
  );
}

const EXPECTED_PROFILES_PER_CLIENT = 4;

/**
 * Deriva el estado de publicación de una fila. Un cliente legacy nunca llega
 * publicado (`buildClientRows` fuerza `isPublished=false`), así que "Publicado"
 * solo aplica a clientes registrados.
 */
export function derivePublicationState(
  row: Pick<ClientRow, "isPublished" | "answeredCount">
): PublicationState {
  if (row.isPublished) return "Publicado";
  if (row.answeredCount === EXPECTED_PROFILES_PER_CLIENT) return "Pendiente de revisión";
  return "En progreso";
}

/**
 * "Publicar" requiere alta formal (D1: `PublicationService.publish` rechaza
 * `clientKey`s no registrados con 404), 4/4 perfiles respondidos y no estar
 * publicado aún.
 */
export function canPublish(row: ClientRow): boolean {
  return row.isRegistered && row.answeredCount === EXPECTED_PROFILES_PER_CLIENT && !row.isPublished;
}

export type ReviewEligibility =
  | { kind: "eligible"; row: ClientRow }
  | {
      kind: "blocked";
      reason: "unknown" | "published" | "unregistered" | "incomplete";
      row?: ClientRow;
    };

/**
 * Resuelve si un `clientKey` puede revisarse/publicarse en `/revisar`. Reusa
 * `ClientRow` (mismo origen que `canPublish`) para que haya una sola fuente
 * de verdad de elegibilidad. Orden de razones bloqueantes cuando aplican
 * varias: `unknown` (sin fila) → `published` → `unregistered` → `incomplete`.
 */
export function resolveReviewEligibility(rows: ClientRow[], clientKey: string): ReviewEligibility {
  const row = rows.find((candidate) => candidate.clientKey === clientKey);
  if (!row) return { kind: "blocked", reason: "unknown" };
  if (row.isPublished) return { kind: "blocked", reason: "published", row };
  if (!row.isRegistered) return { kind: "blocked", reason: "unregistered", row };
  if (row.answeredCount !== EXPECTED_PROFILES_PER_CLIENT) {
    return { kind: "blocked", reason: "incomplete", row };
  }
  return { kind: "eligible", row };
}

/**
 * Arma el path de la página de revisión, codificando el `clientKey` (que
 * puede traer espacios, acentos o `/`) con `encodeURIComponent` para que
 * siga siendo un único segmento de ruta válido.
 */
export function buildReviewHref(clientKey: string): string {
  return `/administracion/clientes/${encodeURIComponent(clientKey)}/revisar`;
}

/**
 * Decodifica el segmento dinámico `[clientKey]`. Next 14.2 App Router puede
 * entregar el param ya decodificado o todavía codificado según el caso; si
 * `decodeURIComponent` falla (secuencia `%` malformada) devuelve el valor
 * crudo en vez de lanzar, para no romper el render de la página.
 */
export function safeDecodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Formatea la completitud de perfiles respondidos, ej. "2/4". */
export function formatCompletion(answeredCount: number): string {
  return `${answeredCount}/${EXPECTED_PROFILES_PER_CLIENT}`;
}

/** Formatea el score global de la fila; "—" cuando no hay datos (null). */
export function formatRowScore(score: number | null): string {
  return score === null ? "—" : `${score}`;
}

const DIACRITIC_MARKS_PATTERN = /[̀-ͯ]/g;

function normalizeForSearch(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(DIACRITIC_MARKS_PATTERN, "");
}

/**
 * Filtra filas por nombre de cliente, insensible a mayúsculas/minúsculas y
 * a tildes/diacríticos (normalización NFD). Query vacía (tras trim) devuelve
 * todas las filas sin filtrar.
 */
export function filterRowsByName(rows: ClientRow[], query: string): ClientRow[] {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery === "") return rows;

  return rows.filter((row) => normalizeForSearch(row.clientName).includes(normalizedQuery));
}

export interface PendingReviewEntry {
  clientKey: string;
  clientName: string;
  healthScore?: number | null;
  profileScores?: ProfileScore[];
}

/**
 * Enriquece cada pendiente de revisión con el score global y el detalle por
 * perfil del cliente correspondiente (join por `clientKey` contra
 * `summary.clients`). Un miss (sin match) conserva el pendiente solo con el
 * nombre, tal como llega hoy — mantiene verdes los 4 tests existentes que
 * pasan `{clientKey, clientName}` sin más.
 */
export function enrichPendingReview(
  pending: DashboardSummary["pendingReview"],
  clients: ClientDashboardSummary[]
): PendingReviewEntry[] {
  const clientsByKey = new Map(clients.map((client) => [client.clientKey, client]));

  return pending.map((entry) => {
    const match = clientsByKey.get(entry.clientKey);
    if (!match) return entry;

    return {
      clientKey: entry.clientKey,
      clientName: entry.clientName,
      healthScore: match.healthScore,
      profileScores: match.profileScores,
    };
  });
}
