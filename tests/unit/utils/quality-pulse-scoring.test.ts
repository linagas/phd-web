import { calculateResults } from "@/utils/quality-pulse/scoring";
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
