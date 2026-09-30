import { DashboardService } from "@/services/quality-pulse/dashboard-service";
import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { CatalogRepository } from "@/repositories/quality-pulse/catalog-repository";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";

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

function buildSubmission(overrides: Partial<QualityPulseAssessment> = {}): QualityPulseAssessment {
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

function buildFakeClientRepository(
  clients: QualityPulseClient[],
  deletedClients: QualityPulseClient[] = []
): ClientRepository {
  return {
    findAll: jest.fn().mockResolvedValue(clients),
    findDeleted: jest.fn().mockResolvedValue(deletedClients),
  } as unknown as ClientRepository;
}

function buildFakeAssessmentRepository(
  submissions: QualityPulseAssessment[]
): AssessmentRepository {
  return { findAll: jest.fn().mockResolvedValue(submissions) } as unknown as AssessmentRepository;
}

function buildFakeCatalogRepository(catalog: CatalogQuestion[]): CatalogRepository {
  return { getAll: jest.fn().mockResolvedValue(catalog) } as unknown as CatalogRepository;
}

describe("DashboardService", () => {
  it("carga clientes, submissions y catálogo, y arma el DashboardSummary vía buildDashboardSummary", async () => {
    const clients = [buildClient({ clientKey: "a" })];
    const submissions = [buildSubmission({ clientKey: "a", profile: "Calidad" })];
    const catalog = [buildQuestion()];

    const service = new DashboardService(
      buildFakeClientRepository(clients),
      buildFakeAssessmentRepository(submissions),
      buildFakeCatalogRepository(catalog)
    );

    const summary = await service.getSummary();

    expect(summary.kpis.registeredClients).toBe(1);
    expect(summary.kpis.submissions).toBe(1);
    expect(summary.kpis.expectedSubmissions).toBe(4);
  });

  it("con repositorios vacíos retorna el empty state sin lanzar error", async () => {
    const service = new DashboardService(
      buildFakeClientRepository([]),
      buildFakeAssessmentRepository([]),
      buildFakeCatalogRepository([])
    );

    const summary = await service.getSummary();

    expect(summary.kpis.registeredClients).toBe(0);
    expect(summary.globalHealthScore).toBeNull();
  });

  it("excluye de las métricas las submissions de clientes eliminados (soft delete)", async () => {
    const service = new DashboardService(
      buildFakeClientRepository(
        [buildClient({ clientKey: "a" })],
        [buildClient({ clientKey: "gone", clientName: "Gone", deletedAt: new Date(), deletedBy: "x" })]
      ),
      buildFakeAssessmentRepository([
        buildSubmission({ clientKey: "a", profile: "Calidad" }),
        buildSubmission({ clientKey: "gone", clientName: "Gone", profile: "Calidad" }),
      ]),
      buildFakeCatalogRepository([buildQuestion()])
    );

    const summary = await service.getSummary();

    expect(summary.kpis.submissions).toBe(1);
  });

  it("adds ELIMINADO events for deleted clients but no RESPONDIDO for their submissions", async () => {
    const deletedAt = new Date("2026-02-01T00:00:00.000Z");
    const service = new DashboardService(
      buildFakeClientRepository(
        [buildClient({ clientKey: "a" })],
        [buildClient({ clientKey: "gone", clientName: "Gone", deletedAt, deletedBy: "admin@phd.cl" })]
      ),
      buildFakeAssessmentRepository([
        buildSubmission({ clientKey: "gone", clientName: "Gone", profile: "Calidad" }),
      ]),
      buildFakeCatalogRepository([buildQuestion()])
    );

    const summary = await service.getSummary();

    const types = summary.recentActivity.map((event) => event.type);
    expect(types).toContain("ELIMINADO");
    expect(types).not.toContain("RESPONDIDO");
  });
});
