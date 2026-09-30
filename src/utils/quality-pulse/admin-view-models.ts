import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  ProfileScore,
  calculateProfileScores,
  calculateResults,
} from "@/utils/quality-pulse/scoring";
import {
  ClientDashboardSummary,
  DashboardSummary,
} from "@/utils/quality-pulse/dashboard-metrics";

export type PublicationState =
  "Publicado" | "Pendiente de revisión" | "En progreso";

export interface ClientRow {
  clientKey: string;
  clientName: string;
  isRegistered: boolean;
  isPublished: boolean;
  answeredCount: number;
  healthScore: number | null;
  profileScores: ProfileScore[];
  /** Who registered the client; absent for legacy (unregistered) clients. */
  registeredBy?: string;
  /** Latest submission date, else client creation date; null when unknown. */
  lastUpdatedAt?: Date | null;
  /** Registration date; absent for legacy clients. */
  createdAt?: Date;
  publishedBy?: string;
  publishedAt?: Date;
}

function groupSubmissionsByClient(
  submissions: QualityPulseAssessment[],
): Map<string, QualityPulseAssessment[]> {
  const byClient = new Map<string, QualityPulseAssessment[]>();
  for (const submission of submissions) {
    const existing = byClient.get(submission.clientKey) ?? [];
    existing.push(submission);
    byClient.set(submission.clientKey, existing);
  }
  return byClient;
}

function toValidDate(value: Date | string | undefined): Date | null {
  if (value === undefined) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveLastUpdate(
  clientSubmissions: QualityPulseAssessment[],
  createdAt?: Date,
): Date | null {
  const times = clientSubmissions
    .map((submission) => toValidDate(submission.submittedAt))
    .filter((date): date is Date => date !== null)
    .map((date) => date.getTime());
  if (times.length > 0) return new Date(Math.max(...times));
  return toValidDate(createdAt);
}

function buildRow(
  clientKey: string,
  clientName: string,
  isRegistered: boolean,
  isPublished: boolean,
  clientSubmissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[],
  registeredBy?: string,
  createdAt?: Date,
  publication?: { publishedBy?: string; publishedAt?: Date },
): ClientRow {
  const profileScores = calculateProfileScores(clientSubmissions, catalog);
  const answeredCount = profileScores.filter(
    (score) => score.status === "answered",
  ).length;
  const healthScore =
    answeredCount === 0
      ? null
      : calculateResults(clientSubmissions, catalog).healthScore;

  return {
    clientKey,
    clientName,
    isRegistered,
    isPublished,
    answeredCount,
    healthScore,
    profileScores,
    registeredBy,
    lastUpdatedAt: resolveLastUpdate(clientSubmissions, createdAt),
    createdAt,
    publishedBy: publication?.publishedBy,
    publishedAt: publication?.publishedAt,
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
  catalog: CatalogQuestion[],
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
      catalog,
      client.registeredBy,
      client.createdAt,
      { publishedBy: client.publishedBy, publishedAt: client.publishedAt },
    ),
  );

  const legacySubmissions = submissions.filter(
    (submission) => !registeredKeys.has(submission.clientKey),
  );
  const legacySubmissionsByClient = groupSubmissionsByClient(legacySubmissions);

  const legacyClientRows = Array.from(legacySubmissionsByClient.entries()).map(
    ([clientKey, clientSubmissions]) =>
      buildRow(
        clientKey,
        clientSubmissions[0].clientName,
        false,
        false,
        clientSubmissions,
        catalog,
      ),
  );

  return [...registeredRows, ...legacyClientRows].sort((a, b) =>
    a.clientName.localeCompare(b.clientName),
  );
}

const EXPECTED_PROFILES_PER_CLIENT = 4;

/**
 * Deriva el estado de publicación de una fila. Un cliente legacy nunca llega
 * publicado (`buildClientRows` fuerza `isPublished=false`), así que "Publicado"
 * solo aplica a clientes registrados.
 */
export function derivePublicationState(
  row: Pick<ClientRow, "isPublished" | "answeredCount">,
): PublicationState {
  if (row.isPublished) return "Publicado";
  if (row.answeredCount === EXPECTED_PROFILES_PER_CLIENT)
    return "Pendiente de revisión";
  return "En progreso";
}

/**
 * "Publicar" requiere alta formal (D1: `PublicationService.publish` rechaza
 * `clientKey`s no registrados con 404), 4/4 perfiles respondidos y no estar
 * publicado aún.
 */
export function canPublish(row: ClientRow): boolean {
  return (
    row.isRegistered &&
    row.answeredCount === EXPECTED_PROFILES_PER_CLIENT &&
    !row.isPublished
  );
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
export function resolveReviewEligibility(
  rows: ClientRow[],
  clientKey: string,
): ReviewEligibility {
  const row = rows.find((candidate) => candidate.clientKey === clientKey);
  if (!row) return { kind: "blocked", reason: "unknown" };
  if (row.isPublished) return { kind: "blocked", reason: "published", row };
  if (!row.isRegistered)
    return { kind: "blocked", reason: "unregistered", row };
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
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITIC_MARKS_PATTERN, "");
}

/**
 * Filtra filas por nombre de cliente, insensible a mayúsculas/minúsculas y
 * a tildes/diacríticos (normalización NFD). Query vacía (tras trim) devuelve
 * todas las filas sin filtrar.
 */
export function filterRowsByName(
  rows: ClientRow[],
  query: string,
): ClientRow[] {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery === "") return rows;

  return rows.filter((row) =>
    normalizeForSearch(row.clientName).includes(normalizedQuery),
  );
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
  clients: ClientDashboardSummary[],
): PendingReviewEntry[] {
  const clientsByKey = new Map(
    clients.map((client) => [client.clientKey, client]),
  );

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

export type ScoreTone = "none" | "low" | "mid" | "high";

const SCORE_MID_THRESHOLD = 50;
const SCORE_HIGH_THRESHOLD = 75;

/** Classifies a 0-100 health score: <50 low, 50-74 mid, >=75 high; "none" when null. */
export function scoreTone(score: number | null): ScoreTone {
  if (score === null) return "none";
  if (score >= SCORE_HIGH_THRESHOLD) return "high";
  if (score >= SCORE_MID_THRESHOLD) return "mid";
  return "low";
}

export type StateFilter = "all" | PublicationState;

/** Filters rows by publication state; "all" returns every row. */
export function filterRowsByState(
  rows: ClientRow[],
  filter: StateFilter,
): ClientRow[] {
  if (filter === "all") return rows;
  return rows.filter((row) => derivePublicationState(row) === filter);
}

/** Counts rows per quick filter chip (including "all"). */
export function countRowsByState(
  rows: ClientRow[],
): Record<StateFilter, number> {
  const counts: Record<StateFilter, number> = {
    all: rows.length,
    "En progreso": 0,
    "Pendiente de revisión": 0,
    Publicado: 0,
  };
  for (const row of rows) counts[derivePublicationState(row)] += 1;
  return counts;
}

export interface PageSlice<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  /** 1-based index of the first item shown (0 when empty). */
  from: number;
  /** 1-based index of the last item shown (0 when empty). */
  to: number;
}

/** Returns one page of `items`, clamping `page` into the valid range. */
export function paginateRows<T>(
  items: T[],
  page: number,
  pageSize: number,
): PageSlice<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : start + slice.length,
  };
}

export type PageRangeItem = number | "ellipsis";

/** Page numbers to render: first, last, and current +/- 1, with ellipses for gaps. */
export function buildPageRange(
  page: number,
  totalPages: number,
): PageRangeItem[] {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(wanted)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const result: PageRangeItem[] = [];
  pages.forEach((value, index) => {
    if (index > 0 && value - pages[index - 1] > 1) result.push("ellipsis");
    result.push(value);
  });
  return result;
}

/** Formats a last-update date as dd-mm-yyyy (es-CL); "—" when missing or invalid. */
export function formatLastUpdate(
  value: Date | string | null | undefined,
): string {
  if (value === null || value === undefined) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

export interface CoverageSummary {
  answered: number;
  total: number;
}

function isQuestionForProfile(
  question: CatalogQuestion,
  profile: string,
): boolean {
  return (
    question.status === "Activa" &&
    question.profiles.some((item) => item === profile)
  );
}

/**
 * Item coverage: `total` is the number of active (question, profile) pairs in
 * the catalog (the items a client must answer across the 4 profiles);
 * `answered` counts submitted answers that belong to that set.
 */
export function calculateCoverage(
  submissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[],
): CoverageSummary {
  const total = QUALITY_PULSE_PROFILES.reduce(
    (sum, profile) =>
      sum +
      catalog.filter((question) => isQuestionForProfile(question, profile))
        .length,
    0,
  );
  const answered = submissions.reduce((sum, submission) => {
    const expectedIds = new Set(
      catalog
        .filter((question) =>
          isQuestionForProfile(question, submission.profile),
        )
        .map((question) => question.id),
    );
    return (
      sum +
      Object.keys(submission.answers).filter((id) => expectedIds.has(id)).length
    );
  }, 0);
  return { answered, total };
}

export type StepStatus = "done" | "current" | "upcoming";

export interface PublicationStepper {
  stage: number;
  total: number;
  steps: { label: PublicationState; status: StepStatus }[];
}

const PUBLICATION_ORDER: PublicationState[] = [
  "En progreso",
  "Pendiente de revisión",
  "Publicado",
];

/** Publication lifecycle stepper; only states that exist in the data. */
export function buildPublicationSteps(
  state: PublicationState,
): PublicationStepper {
  const currentIndex = PUBLICATION_ORDER.indexOf(state);
  return {
    stage: currentIndex + 1,
    total: PUBLICATION_ORDER.length,
    steps: PUBLICATION_ORDER.map((label, index) => ({
      label,
      status:
        index < currentIndex
          ? "done"
          : index === currentIndex
            ? "current"
            : "upcoming",
    })),
  };
}

const STATE_DESCRIPTIONS: Record<PublicationState, string> = {
  "En progreso":
    "Faltan perfiles por responder antes de poder revisar y publicar.",
  "Pendiente de revisión":
    "Los 4 perfiles están completos, a la espera de publicación.",
  Publicado: "Entregado al cliente.",
};

/** Short Spanish description of a publication state. */
export function describePublicationState(state: PublicationState): string {
  return STATE_DESCRIPTIONS[state];
}
