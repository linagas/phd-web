import {
  CatalogQuestion,
  QuestionOption,
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";

export const PERSPECTIVE_NAMES = ["Madurez", "Ejecución", "Impacto", "Percepción"];

export const DIMENSIONS = [
  { id: "D1", name: "Estrategia y Gobierno" },
  { id: "D2", name: "Procesos y Delivery" },
  { id: "D3", name: "Personas y Cultura" },
  { id: "D4", name: "Ingeniería de Calidad" },
  { id: "D5", name: "Tecnología y Datos" },
  { id: "D6", name: "Negocio y Valor" },
];

export const IMPACT_LABELS: Record<string, string> = {
  timeToMarket: "Time-to-Market",
  rework: "Retrabajo",
  productivity: "Productividad / Capacidad",
  delivery: "Frecuencia de entrega",
  incidents: "Incidentes en producción",
  recovery: "Tiempo de recuperación",
  predictability: "Predictibilidad",
  trust: "Confianza negocio/cliente",
};

const GAP_SIGNAL_TYPES = ["Pain", "Brecha"];
const SIGNAL_TYPES = ["Pain", "Brecha", "Fortaleza"];

export interface FinalAnswer {
  questionId: string;
  mean: number;
  rounded: number;
  profilesAnswered: number;
  rule: QuestionOption;
  perspective: string;
  dimensionId: string;
  type: string;
}

export interface PerspectiveScore {
  name: string;
  score: number;
}

export interface DimensionScore {
  id: string;
  name: string;
  score: number | null;
}

export interface SignalCount {
  type: string;
  count: number;
}

export interface ImpactItem {
  key: string;
  label: string;
  count: number;
}

export interface QualityPulseResults {
  healthScore: number;
  perspectiveScores: PerspectiveScore[];
  dimensionScores: DimensionScore[];
  signals: SignalCount[];
  gaps: FinalAnswer[];
  impacts: ImpactItem[];
}

/**
 * Dada la media redondeada de las respuestas de una pregunta, encuentra la
 * "regla" (opción del catálogo) que mejor la representa: coincidencia exacta
 * de score si existe, o la opción con score más cercano. En empates de
 * distancia, gana la primera opción del arreglo (mismo criterio que el
 * Quality Pulse original).
 */
function matchClosestRule(rules: QuestionOption[], roundedScore: number): QuestionOption {
  const exactMatch = rules.find((rule) => rule.score === roundedScore);
  if (exactMatch) return exactMatch;

  return rules.reduce((closest, rule) =>
    Math.abs(rule.score - roundedScore) < Math.abs(closest.score - roundedScore) ? rule : closest
  );
}

function computeFinalAnswers(
  submissions: QualityPulseAssessment[],
  questions: CatalogQuestion[]
): FinalAnswer[] {
  return questions.flatMap((question) => {
    const selectedIndexes = submissions
      .map((submission) => submission.answers[question.id])
      .filter((index): index is number => index !== undefined);

    if (selectedIndexes.length === 0) return [];

    const scores = selectedIndexes
      .map((index) => question.options[index]?.score)
      .filter((score): score is number => Number.isFinite(score));

    if (scores.length === 0) return [];

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const rounded = Math.round(mean);
    const rule = matchClosestRule(question.options, rounded);

    return [
      {
        questionId: question.id,
        mean,
        rounded,
        profilesAnswered: scores.length,
        rule,
        perspective: question.perspective,
        dimensionId: question.dimensionId,
        type: question.type,
      },
    ];
  });
}

export function calculateResults(
  submissions: QualityPulseAssessment[],
  questions: CatalogQuestion[]
): QualityPulseResults {
  const finalAnswers = computeFinalAnswers(submissions, questions);

  const perspectiveScores: PerspectiveScore[] = PERSPECTIVE_NAMES.map((name) => {
    const rows = finalAnswers.filter((row) => row.perspective === name);
    const score = rows.length
      ? Math.round((rows.reduce((sum, row) => sum + row.rounded, 0) / rows.length) * 25)
      : 0;
    return { name, score };
  });

  const healthScore = Math.round(
    perspectiveScores.reduce((sum, row) => sum + row.score, 0) / perspectiveScores.length
  );

  const dimensionScores: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const rows = finalAnswers.filter(
      (row) => row.dimensionId === dimension.id && row.type === "Base"
    );
    const score = rows.length
      ? Math.round((rows.reduce((sum, row) => sum + row.rounded, 0) / rows.length) * 25)
      : null;
    return { ...dimension, score };
  });

  const signals: SignalCount[] = SIGNAL_TYPES.map((type) => ({
    type,
    count: finalAnswers.filter((row) => row.rule.signalType === type).length,
  }));

  const gaps = finalAnswers.filter((row) => GAP_SIGNAL_TYPES.includes(row.rule.signalType));

  const impacts: ImpactItem[] = Object.entries(IMPACT_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      count: gaps.reduce((sum, row) => sum + (row.rule.outcomes?.[key] ?? 0), 0),
    }))
    .sort((a, b) => b.count - a.count);

  return { healthScore, perspectiveScores, dimensionScores, signals, gaps, impacts };
}

/**
 * Score de un perfil dentro de un cliente (D2). Union discriminada: un perfil
 * sin submission queda "pending"/`null` en vez de leerse como 0 (crítico).
 */
export type ProfileScore =
  | { profile: QualityPulseProfile; status: "answered"; score: number }
  | { profile: QualityPulseProfile; status: "pending"; score: null };

/**
 * Deriva el score por perfil (Calidad/Desarrollo/Gestión/Negocio) de un
 * cliente. Cada perfil respondido usa `calculateResults` sobre su única
 * submission; los perfiles sin submission son "pending" (D2).
 */
export function calculateProfileScores(
  submissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): ProfileScore[] {
  return QUALITY_PULSE_PROFILES.map((profile) => {
    const submission = submissions.find((item) => item.profile === profile);
    if (!submission) {
      return { profile, status: "pending", score: null };
    }

    const { healthScore } = calculateResults([submission], catalog);
    return { profile, status: "answered", score: healthScore };
  });
}

export interface WeightedHealthScore {
  healthScore: number | null;
  answeredCount: number;
}

/**
 * Quality Health Score global (D1): media ponderada de los `healthScore` por
 * cliente, donde el peso es la cantidad de perfiles respondidos (0-4). Un
 * cliente 4/4 pesa el doble que uno 2/4. Si la suma de pesos es 0 (nadie
 * respondió nada), retorna `null` ("Sin datos") en vez de dividir por cero.
 */
export function aggregateHealthScore(clients: WeightedHealthScore[]): number | null {
  const totalWeight = clients.reduce((sum, client) => sum + client.answeredCount, 0);
  if (totalWeight === 0) return null;

  const weightedSum = clients.reduce(
    (sum, client) => sum + (client.healthScore ?? 0) * client.answeredCount,
    0
  );

  return Math.round(weightedSum / totalWeight);
}
