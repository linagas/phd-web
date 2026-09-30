import {
  calculateResults,
  calculateProfileScores,
  aggregateHealthScore,
} from "@/utils/quality-pulse/scoring";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";

function buildOption(score: number, signalType: string): QuestionOption {
  return { label: `score-${score}`, score, variable: "", signal: "", signalType, priority: "", impact: "", outcomes: {} };
}

function buildQuestion(overrides: Partial<CatalogQuestion>): CatalogQuestion {
  return {
    id: "Q1",
    dimension: "D",
    dimensionId: "D1",
    capability: "C",
    capabilityId: "C1",
    perspective: "Madurez",
    text: "Pregunta",
    order: 1,
    required: true,
    status: "Activa",
    objective: "",
    type: "Base",
    origins: [],
    profiles: ["Calidad"],
    options: [buildOption(0, "Pain"), buildOption(2, "Brecha"), buildOption(4, "Fortaleza")],
    ...overrides,
  };
}

function buildSubmission(overrides: Partial<QualityPulseAssessment>): QualityPulseAssessment {
  return {
    clientKey: "cliente",
    clientName: "Cliente",
    profile: "Calidad",
    answers: {},
    questionCount: 0,
    submittedAt: new Date(),
    ...overrides,
  };
}

describe("calculateResults", () => {
  it("usa la opción de score exacto cuando el promedio redondeado coincide", () => {
    const question = buildQuestion({ id: "Q1" });
    // índice 1 -> options[1] tiene score 2 (buildOption(2, "Brecha"))
    const submissions = [buildSubmission({ profile: "Calidad", answers: { Q1: 1 } })];

    const results = calculateResults(submissions, [question]);

    expect(results.gaps).toHaveLength(1);
    expect(results.gaps[0].rounded).toBe(2);
    expect(results.gaps[0].rule.label).toBe("score-2");
  });

  it("elige la opción con score más cercano cuando no hay coincidencia exacta", () => {
    // Promedio de 0 y 4 = 2, que sí tiene coincidencia exacta (score-2);
    // para forzar un desajuste usamos un catálogo sin ese valor intermedio.
    const question = buildQuestion({
      id: "Q1",
      options: [buildOption(0, "Pain"), buildOption(4, "Fortaleza")],
    });
    const submissions = [
      buildSubmission({ profile: "Calidad", answers: { Q1: 0 } }),
      buildSubmission({ profile: "Desarrollo", answers: { Q1: 1 } }), // score 4
    ];

    // mean = (0 + 4) / 2 = 2, rounded = 2, sin coincidencia exacta -> la más cercana
    // por orden de aparición cuando hay empate de distancia (|0-2| == |4-2|) es score-0.
    const results = calculateResults(submissions, [question]);

    expect(results.gaps[0].rounded).toBe(2);
    expect(results.gaps[0].rule.label).toBe("score-0");
  });

  it("calcula el health score como el promedio de las perspectivas", () => {
    const question = buildQuestion({ id: "Q1", perspective: "Madurez" });
    // índice 1 -> options[1] tiene score 2 (buildOption(2, "Brecha"))
    const submissions = [buildSubmission({ profile: "Calidad", answers: { Q1: 1 } })];

    const results = calculateResults(submissions, [question]);
    const madurez = results.perspectiveScores.find((p) => p.name === "Madurez");

    expect(madurez?.score).toBe(50); // rounded(2) * 25
    expect(results.healthScore).toBe(Math.round(50 / 4));
  });

  it("marca una dimensión como 'sin datos' cuando ninguna pregunta Base la responde", () => {
    const question = buildQuestion({ id: "Q1", dimensionId: "D1", type: "Base" });
    const submissions = [buildSubmission({ profile: "Calidad", answers: { Q1: 2 } })];

    const results = calculateResults(submissions, [question]);
    const otherDimension = results.dimensionScores.find((d) => d.id !== "D1");

    expect(otherDimension?.score).toBeNull();
  });

  it("ignora preguntas sin ninguna respuesta", () => {
    const question = buildQuestion({ id: "Q1" });
    const results = calculateResults([], [question]);

    expect(results.gaps).toHaveLength(0);
    expect(results.healthScore).toBe(0);
  });
});

describe("calculateProfileScores (D2)", () => {
  it("marca 'answered' con el healthScore de esa única submission cuando el perfil respondió", () => {
    const question = buildQuestion({ id: "Q1" });
    const submissions = [buildSubmission({ profile: "Calidad", answers: { Q1: 2 } })];

    const profileScores = calculateProfileScores(submissions, [question]);
    const calidad = profileScores.find((p) => p.profile === "Calidad");
    const expectedHealthScore = calculateResults(
      [buildSubmission({ profile: "Calidad", answers: { Q1: 2 } })],
      [question]
    ).healthScore;

    expect(calidad).toEqual({ profile: "Calidad", status: "answered", score: expectedHealthScore });
  });

  it("marca 'pending' con score null cuando el perfil no respondió", () => {
    const question = buildQuestion({ id: "Q1" });
    const submissions = [buildSubmission({ profile: "Calidad", answers: { Q1: 2 } })];

    const profileScores = calculateProfileScores(submissions, [question]);
    const negocio = profileScores.find((p) => p.profile === "Negocio");

    expect(negocio).toEqual({ profile: "Negocio", status: "pending", score: null });
  });

  it("devuelve los 4 perfiles siempre, sin importar cuántos hayan respondido", () => {
    const question = buildQuestion({ id: "Q1" });

    const profileScores = calculateProfileScores([], [question]);

    expect(profileScores).toHaveLength(4);
    expect(profileScores.every((p) => p.status === "pending" && p.score === null)).toBe(true);
  });
});

describe("aggregateHealthScore (D1)", () => {
  it("calcula la media ponderada por cantidad de perfiles respondidos", () => {
    // (80*4 + 40*2) / (4+2) = 400/6 = 66.67 -> round 67
    const result = aggregateHealthScore([
      { healthScore: 80, answeredCount: 4 },
      { healthScore: 40, answeredCount: 2 },
    ]);

    expect(result).toBe(67);
  });

  it("un cliente con 1/4 respondido pesa proporcionalmente menos que uno con 4/4", () => {
    // (100*4 + 0*1) / (4+1) = 400/5 = 80
    const result = aggregateHealthScore([
      { healthScore: 100, answeredCount: 4 },
      { healthScore: 0, answeredCount: 1 },
    ]);

    expect(result).toBe(80);
  });

  it("retorna null cuando la suma de pesos (perfiles respondidos) es 0", () => {
    const result = aggregateHealthScore([
      { healthScore: null, answeredCount: 0 },
      { healthScore: null, answeredCount: 0 },
    ]);

    expect(result).toBeNull();
  });

  it("retorna null con lista vacía de clientes", () => {
    expect(aggregateHealthScore([])).toBeNull();
  });
});
