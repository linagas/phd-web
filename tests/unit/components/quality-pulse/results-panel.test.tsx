/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import ResultsPanel from "@/app/quality-pulse/resultados/components/results-panel";
import type { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";
import type { QualityPulseResults } from "@/utils/quality-pulse/scoring";

const CATALOG: CatalogQuestion[] = [
  {
    id: "q1",
    dimension: "Estrategia y Gobierno",
    dimensionId: "D1",
    capability: "Gobierno de calidad",
    capabilityId: "C1",
    perspective: "Madurez",
    text: "¿Existe un plan de calidad formalizado?",
    order: 1,
    required: true,
    status: "active",
    objective: "Medir madurez de gobierno",
    type: "Base",
    origins: [],
    profiles: ["Calidad"],
    options: [
      {
        label: "No existe",
        score: 1,
        variable: "v1",
        signal: "Sin plan formal",
        signalType: "Pain",
        priority: "Alta",
        impact: "Alto",
        outcomes: { timeToMarket: 3 },
      },
    ],
  },
];

const RESULTS: QualityPulseResults = {
  healthScore: 62,
  perspectiveScores: [
    { name: "Madurez", score: 70 },
    { name: "Ejecución", score: 50 },
    { name: "Impacto", score: 60 },
    { name: "Percepción", score: 68 },
  ],
  dimensionScores: [
    { id: "D1", name: "Estrategia y Gobierno", score: 25 },
    { id: "D2", name: "Procesos y Delivery", score: null },
    { id: "D3", name: "Personas y Cultura", score: 50 },
    { id: "D4", name: "Ingeniería de Calidad", score: 75 },
    { id: "D5", name: "Tecnología y Datos", score: null },
    { id: "D6", name: "Negocio y Valor", score: 40 },
  ],
  signals: [
    { type: "Pain", count: 1 },
    { type: "Brecha", count: 0 },
    { type: "Fortaleza", count: 0 },
  ],
  gaps: [
    {
      questionId: "q1",
      mean: 1,
      rounded: 1,
      profilesAnswered: 1,
      rule: CATALOG[0].options[0],
      perspective: "Madurez",
      dimensionId: "D1",
      type: "Base",
    },
  ],
  impacts: [
    { key: "timeToMarket", label: "Time-to-Market", count: 3 },
    { key: "rework", label: "Retrabajo", count: 0 },
  ],
};

describe("ResultsPanel", () => {
  it("renderiza el health score con su valor y nivel", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument();
    expect(screen.getByText("62")).toBeInTheDocument();
    expect(screen.getByText("Gestionado")).toBeInTheDocument();
  });

  it("renderiza la tabla de benchmark con las 4 perspectivas y su brecha", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText("Benchmark por perspectiva")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Ejecución")).toBeInTheDocument();
    expect(within(table).getByText("-25")).toBeInTheDocument();
  });

  it("renderiza la grilla de dimensiones, incluyendo dimensiones sin datos", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText("Estado de las dimensiones")).toBeInTheDocument();
    expect(screen.getByText("Estrategia y Gobierno")).toBeInTheDocument();
    expect(screen.getAllByText("Sin datos")).toHaveLength(2);
  });

  it("renderiza los hallazgos (gaps) resolviendo el texto de la pregunta desde el catálogo", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText("Hallazgos (1)")).toBeInTheDocument();
    expect(screen.getByText("¿Existe un plan de calidad formalizado?")).toBeInTheDocument();
    expect(screen.getByText("Sin plan formal")).toBeInTheDocument();
  });

  it("renderiza el ranking de impactos ordenado por count", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText("Ranking de impactos")).toBeInTheDocument();
    expect(screen.getByText("Time-to-Market")).toBeInTheDocument();
    expect(screen.getByText("Retrabajo")).toBeInTheDocument();
  });

  it("renderiza los radares de perspectivas y dimensiones", () => {
    render(<ResultsPanel results={RESULTS} catalog={CATALOG} />);

    expect(screen.getByText("Perspectivas")).toBeInTheDocument();
    expect(screen.getByText("Dimensiones")).toBeInTheDocument();
  });
});
