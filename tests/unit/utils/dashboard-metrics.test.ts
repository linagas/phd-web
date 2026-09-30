import { buildDashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

function buildOption(score: number, signalType: string): QuestionOption {
  return {
    label: `score-${score}`,
    score,
    variable: "",
    signal: "",
    signalType,
    priority: "",
    impact: "",
    outcomes: {},
  };
}

function buildQuestion(overrides: Partial<CatalogQuestion> = {}): CatalogQuestion {
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

function buildClient(overrides: Partial<QualityPulseClient> = {}): QualityPulseClient {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    registeredBy: "admin@phd.cl",
    createdAt: new Date(),
    isPublished: false,
    ...overrides,
  };
}

function buildSubmission(overrides: Partial<QualityPulseAssessment>): QualityPulseAssessment {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    profile: "Calidad",
    answers: { Q1: 2 },
    questionCount: 1,
    submittedAt: new Date(),
    ...overrides,
  };
}

describe("buildDashboardSummary", () => {
  it("refleja KPIs actuales: clientes, submissions/esperadas, completion% y pendientes", () => {
    const question = buildQuestion();
    const clients = [buildClient({ clientKey: "a" }), buildClient({ clientKey: "b" })];
    const submissions = [
      buildSubmission({ clientKey: "a", profile: "Calidad" }),
      buildSubmission({ clientKey: "a", profile: "Desarrollo" }),
    ];

    const summary = buildDashboardSummary(clients, submissions, [question]);

    expect(summary.kpis.registeredClients).toBe(2);
    expect(summary.kpis.submissions).toBe(2);
    expect(summary.kpis.expectedSubmissions).toBe(8); // 2 clients * 4 profiles
    expect(summary.kpis.completionPct).toBe(25); // 2/8
  });

  it("empty state: 0 clientes no lanza error y todos los KPIs son 0 con globalHealthScore null", () => {
    const summary = buildDashboardSummary([], [], []);

    expect(summary.kpis).toEqual({
      registeredClients: 0,
      submissions: 0,
      expectedSubmissions: 0,
      completionPct: 0,
      pendingReview: 0,
    });
    expect(summary.globalHealthScore).toBeNull();
    expect(summary.clients).toEqual([]);
    expect(summary.pendingReview).toEqual([]);
  });

  it("filtra 'Pendientes de Revisión' a clientes 4/4 && !isPublished, excluye parciales y publicados", () => {
    const question = buildQuestion();
    const clients = [
      buildClient({ clientKey: "full-unpublished", clientName: "Full Unpublished", isPublished: false }),
      buildClient({ clientKey: "partial", clientName: "Partial", isPublished: false }),
      buildClient({ clientKey: "full-published", clientName: "Full Published", isPublished: true }),
    ];
    const allProfiles = ["Calidad", "Desarrollo", "Gestión", "Negocio"] as const;
    const submissions = [
      ...allProfiles.map((profile) => buildSubmission({ clientKey: "full-unpublished", profile })),
      buildSubmission({ clientKey: "partial", profile: "Calidad" }),
      ...allProfiles.map((profile) => buildSubmission({ clientKey: "full-published", profile })),
    ];

    const summary = buildDashboardSummary(clients, submissions, [question]);

    expect(summary.pendingReview).toEqual([
      { clientKey: "full-unpublished", clientName: "Full Unpublished" },
    ]);
    expect(summary.kpis.pendingReview).toBe(1);
  });

  it("cuenta solo submissions de clientes registrados (huérfanas no inflan completionPct)", () => {
    const question = buildQuestion();
    const clients = [buildClient({ clientKey: "a" })];
    const submissions = [
      buildSubmission({ clientKey: "a", profile: "Calidad" }),
      buildSubmission({ clientKey: "orphan", clientName: "Orphan", profile: "Calidad" }),
    ];

    const summary = buildDashboardSummary(clients, submissions, [question]);

    expect(summary.kpis.submissions).toBe(1);
    expect(summary.kpis.completionPct).toBe(25); // 1/4, no 2/4
  });

  it("includes recentActivity derived from clients, deleted clients and submissions, newest first", () => {
    const clients = [
      buildClient({ clientKey: "a", createdAt: new Date("2026-01-01T00:00:00.000Z") }),
    ];
    const deleted = [
      buildClient({
        clientKey: "gone",
        clientName: "Gone",
        deletedAt: new Date("2026-01-03T00:00:00.000Z"),
        deletedBy: "admin@phd.cl",
      }),
    ];
    const submissions = [
      buildSubmission({ clientKey: "a", submittedAt: new Date("2026-01-02T00:00:00.000Z") }),
    ];

    const summary = buildDashboardSummary(clients, submissions, [buildQuestion()], deleted);

    expect(summary.recentActivity.map((event) => event.type)).toEqual([
      "ELIMINADO",
      "RESPONDIDO",
      "REGISTRO",
    ]);
    expect(summary.recentActivity[0].occurredAt).toBe("2026-01-03T00:00:00.000Z");
  });

  it("defaults recentActivity deletions to none when deleted clients are omitted", () => {
    const summary = buildDashboardSummary([buildClient()], [], [buildQuestion()]);

    expect(summary.recentActivity.map((event) => event.type)).toEqual(["REGISTRO"]);
  });
});
