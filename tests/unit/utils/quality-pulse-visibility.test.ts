import { getVisibleQuestions, isGapAnswer } from "@/utils/quality-pulse/visibility";
import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";

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
    options: [
      { label: "A", score: 0, variable: "", signal: "", signalType: "Pain", priority: "", impact: "", outcomes: {} },
      { label: "B", score: 4, variable: "", signal: "", signalType: "Fortaleza", priority: "", impact: "", outcomes: {} },
    ],
    ...overrides,
  };
}

describe("isGapAnswer", () => {
  const question = buildQuestion({ id: "Q1" });

  it("retorna true cuando la opción seleccionada es Pain o Brecha", () => {
    expect(isGapAnswer(question, 0)).toBe(true);
  });

  it("retorna false cuando la opción seleccionada es Fortaleza", () => {
    expect(isGapAnswer(question, 1)).toBe(false);
  });

  it("retorna false cuando no hay respuesta todavía", () => {
    expect(isGapAnswer(question, undefined)).toBe(false);
  });
});

describe("getVisibleQuestions", () => {
  it("incluye una pregunta Base activa asignada al perfil", () => {
    const questions = [buildQuestion({ id: "Q1", type: "Base", profiles: ["Calidad"] })];
    const visible = getVisibleQuestions(questions, "Calidad", {});
    expect(visible.map((q) => q.id)).toEqual(["Q1"]);
  });

  it("excluye una pregunta Base cuyo perfil no coincide", () => {
    const questions = [buildQuestion({ id: "Q1", type: "Base", profiles: ["Negocio"] })];
    expect(getVisibleQuestions(questions, "Calidad", {})).toHaveLength(0);
  });

  it("excluye una pregunta inactiva aunque el perfil coincida", () => {
    const questions = [buildQuestion({ id: "Q1", type: "Base", status: "Borrador", profiles: ["Calidad"] })];
    expect(getVisibleQuestions(questions, "Calidad", {})).toHaveLength(0);
  });

  it("no muestra una pregunta de profundización si su origen no fue respondido", () => {
    const origin = buildQuestion({ id: "Q1", type: "Base", profiles: ["Calidad"] });
    const followUp = buildQuestion({ id: "Q2", type: "Profundización", origins: ["Q1"], profiles: ["Calidad"] });
    const visible = getVisibleQuestions([origin, followUp], "Calidad", {});
    expect(visible.map((q) => q.id)).toEqual(["Q1"]);
  });

  it("muestra una pregunta de profundización cuando su origen detectó una brecha", () => {
    const origin = buildQuestion({ id: "Q1", type: "Base", profiles: ["Calidad"] });
    const followUp = buildQuestion({ id: "Q2", type: "Profundización", origins: ["Q1"], profiles: ["Calidad"] });
    const visible = getVisibleQuestions([origin, followUp], "Calidad", { Q1: 0 });
    expect(visible.map((q) => q.id)).toEqual(["Q1", "Q2"]);
  });

  it("no muestra la pregunta de profundización cuando el origen respondió una fortaleza", () => {
    const origin = buildQuestion({ id: "Q1", type: "Base", profiles: ["Calidad"] });
    const followUp = buildQuestion({ id: "Q2", type: "Profundización", origins: ["Q1"], profiles: ["Calidad"] });
    const visible = getVisibleQuestions([origin, followUp], "Calidad", { Q1: 1 });
    expect(visible.map((q) => q.id)).toEqual(["Q1"]);
  });
});
