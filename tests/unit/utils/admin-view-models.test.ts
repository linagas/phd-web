import {
  buildClientRows,
  buildReviewHref,
  canPublish,
  buildPageRange,
  buildPublicationSteps,
  calculateCoverage,
  describePublicationState,
  ClientRow,
  countRowsByState,
  derivePublicationState,
  enrichPendingReview,
  filterRowsByName,
  filterRowsByState,
  formatCompletion,
  formatLastUpdate,
  formatRowScore,
  paginateRows,
  resolveReviewEligibility,
  scoreTone,
  safeDecodeParam,
} from "@/utils/quality-pulse/admin-view-models";
import { ClientDashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { calculateResults } from "@/utils/quality-pulse/scoring";

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

describe("buildClientRows", () => {
  it("incluye clientes registrados y legacy (sin alta) en un mismo listado", () => {
    const catalog = [buildQuestion()];
    const clients = [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })];
    const submissions = [
      buildSubmission({ clientKey: "reg-a", clientName: "Registrado A", profile: "Calidad" }),
      buildSubmission({ clientKey: "legacy-b", clientName: "Legacy B", profile: "Calidad" }),
    ];

    const rows = buildClientRows(clients, submissions, catalog);

    expect(rows.map((row) => row.clientKey).sort()).toEqual(["legacy-b", "reg-a"]);
    const legacyRow = rows.find((row) => row.clientKey === "legacy-b");
    expect(legacyRow?.isRegistered).toBe(false);
    const registeredRow = rows.find((row) => row.clientKey === "reg-a");
    expect(registeredRow?.isRegistered).toBe(true);
  });

  it("un cliente legacy siempre tiene isPublished=false, sin importar submissions previas", () => {
    const catalog = [buildQuestion()];
    const submissions = [
      buildSubmission({ clientKey: "legacy-b", clientName: "Legacy B", profile: "Calidad" }),
    ];

    const rows = buildClientRows([], submissions, catalog);

    expect(rows[0].isPublished).toBe(false);
  });

  it("el score de una fila coincide con calculateResults sobre las mismas submissions (paridad con buildClientSummary)", () => {
    const catalog = [buildQuestion()];
    const clients = [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })];
    const clientSubmissions = [
      buildSubmission({ clientKey: "reg-a", clientName: "Registrado A", profile: "Calidad" }),
    ];

    const rows = buildClientRows(clients, clientSubmissions, catalog);
    const expected = calculateResults(clientSubmissions, catalog).healthScore;

    expect(rows[0].healthScore).toBe(expected);
    expect(rows[0].answeredCount).toBe(1);
  });

  it("ordena las filas por nombre de cliente", () => {
    const catalog = [buildQuestion()];
    const clients = [
      buildClient({ clientKey: "z", clientName: "Zeta" }),
      buildClient({ clientKey: "a", clientName: "Alfa" }),
    ];

    const rows = buildClientRows(clients, [], catalog);

    expect(rows.map((row) => row.clientName)).toEqual(["Alfa", "Zeta"]);
  });
});

function buildRow(overrides: Partial<ClientRow> = {}): ClientRow {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    isRegistered: true,
    isPublished: false,
    answeredCount: 0,
    healthScore: null,
    profileScores: [],
    ...overrides,
  };
}

describe("derivePublicationState", () => {
  it('cliente publicado -> "Publicado"', () => {
    expect(derivePublicationState(buildRow({ isPublished: true, answeredCount: 4 }))).toBe(
      "Publicado"
    );
  });

  it('4/4 y no publicado -> "Pendiente de revisión"', () => {
    expect(derivePublicationState(buildRow({ isPublished: false, answeredCount: 4 }))).toBe(
      "Pendiente de revisión"
    );
  });

  it('menos de 4/4 -> "En progreso"', () => {
    expect(derivePublicationState(buildRow({ isPublished: false, answeredCount: 2 }))).toBe(
      "En progreso"
    );
  });
});

describe("canPublish", () => {
  it("true para cliente registrado, 4/4 y no publicado", () => {
    expect(
      canPublish(buildRow({ isRegistered: true, answeredCount: 4, isPublished: false }))
    ).toBe(true);
  });

  it("false para cliente legacy (no registrado) aunque esté 4/4 y no publicado", () => {
    expect(
      canPublish(buildRow({ isRegistered: false, answeredCount: 4, isPublished: false }))
    ).toBe(false);
  });

  it("false si está publicado", () => {
    expect(
      canPublish(buildRow({ isRegistered: true, answeredCount: 4, isPublished: true }))
    ).toBe(false);
  });

  it("false si es parcial (<4/4)", () => {
    expect(
      canPublish(buildRow({ isRegistered: true, answeredCount: 3, isPublished: false }))
    ).toBe(false);
  });
});

describe("formatCompletion", () => {
  it('formatea "n/4"', () => {
    expect(formatCompletion(0)).toBe("0/4");
    expect(formatCompletion(2)).toBe("2/4");
    expect(formatCompletion(4)).toBe("4/4");
  });
});

describe("formatRowScore", () => {
  it("formatea el número tal cual cuando no es null", () => {
    expect(formatRowScore(72)).toBe("72");
    expect(formatRowScore(0)).toBe("0");
  });

  it('devuelve "—" cuando el score es null (sin datos)', () => {
    expect(formatRowScore(null)).toBe("—");
  });
});

describe("filterRowsByName", () => {
  const rows = [
    buildRow({ clientKey: "a", clientName: "Compañía Ñandú" }),
    buildRow({ clientKey: "b", clientName: "Banco Sur" }),
  ];

  it("filtra sin distinguir mayúsculas/minúsculas", () => {
    expect(filterRowsByName(rows, "banco").map((row) => row.clientKey)).toEqual(["b"]);
  });

  it("filtra ignorando tildes/ñ (case+accent-insensitive, NFD)", () => {
    expect(filterRowsByName(rows, "nandu").map((row) => row.clientKey)).toEqual(["a"]);
    expect(filterRowsByName(rows, "compania").map((row) => row.clientKey)).toEqual(["a"]);
  });

  it("recorta espacios (trim) antes de comparar", () => {
    expect(filterRowsByName(rows, "  banco  ").map((row) => row.clientKey)).toEqual(["b"]);
  });

  it("query vacía devuelve todas las filas", () => {
    expect(filterRowsByName(rows, "").map((row) => row.clientKey)).toEqual(["a", "b"]);
    expect(filterRowsByName(rows, "   ").map((row) => row.clientKey)).toEqual(["a", "b"]);
  });
});

function buildClientDashboardSummary(
  overrides: Partial<ClientDashboardSummary> = {}
): ClientDashboardSummary {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    isPublished: false,
    answeredCount: 4,
    healthScore: 72,
    profileScores: [],
    ...overrides,
  };
}

describe("resolveReviewEligibility", () => {
  it('clientKey sin fila asociada -> {kind: "blocked", reason: "unknown"}', () => {
    const result = resolveReviewEligibility([], "no-existe");

    expect(result).toEqual({ kind: "blocked", reason: "unknown" });
  });

  it('cliente ya publicado -> {kind: "blocked", reason: "published"}, incluso antes que "unregistered"', () => {
    const row = buildRow({ isRegistered: false, isPublished: true, answeredCount: 4 });

    const result = resolveReviewEligibility([row], row.clientKey);

    expect(result).toEqual({ kind: "blocked", reason: "published", row });
  });

  it('cliente legacy (no registrado), no publicado, 4/4 -> {kind: "blocked", reason: "unregistered"}', () => {
    const row = buildRow({ isRegistered: false, isPublished: false, answeredCount: 4 });

    const result = resolveReviewEligibility([row], row.clientKey);

    expect(result).toEqual({ kind: "blocked", reason: "unregistered", row });
  });

  it('cliente registrado, no publicado, <4/4 -> {kind: "blocked", reason: "incomplete"}', () => {
    const row = buildRow({ isRegistered: true, isPublished: false, answeredCount: 2 });

    const result = resolveReviewEligibility([row], row.clientKey);

    expect(result).toEqual({ kind: "blocked", reason: "incomplete", row });
  });

  it('cliente registrado, no publicado, 4/4 -> {kind: "eligible"}', () => {
    const row = buildRow({ isRegistered: true, isPublished: false, answeredCount: 4 });

    const result = resolveReviewEligibility([row], row.clientKey);

    expect(result).toEqual({ kind: "eligible", row });
  });
});

describe("buildReviewHref", () => {
  it("arma el path con el clientKey codificado", () => {
    expect(buildReviewHref("cliente-a")).toBe("/administracion/clientes/cliente-a/revisar");
  });

  it("codifica espacios en el clientKey", () => {
    expect(buildReviewHref("Cliente Uno")).toBe(
      "/administracion/clientes/Cliente%20Uno/revisar"
    );
  });

  it("codifica acentos/ñ en el clientKey", () => {
    expect(buildReviewHref("Compañía Ñandú")).toBe(
      `/administracion/clientes/${encodeURIComponent("Compañía Ñandú")}/revisar`
    );
  });

  it("codifica '/' en el clientKey para que no rompa el segmento de ruta", () => {
    expect(buildReviewHref("a/b")).toBe("/administracion/clientes/a%2Fb/revisar");
  });
});

describe("safeDecodeParam", () => {
  it("decodifica un valor URL-encoded", () => {
    expect(safeDecodeParam(encodeURIComponent("Cliente Uno"))).toBe("Cliente Uno");
    expect(safeDecodeParam(encodeURIComponent("Compañía Ñandú"))).toBe("Compañía Ñandú");
  });

  it("devuelve el valor tal cual cuando ya viene sin codificar", () => {
    expect(safeDecodeParam("cliente-a")).toBe("cliente-a");
  });

  it("devuelve el valor crudo (sin explotar) cuando la secuencia '%' es inválida", () => {
    expect(safeDecodeParam("cliente-%E0%A4%A")).toBe("cliente-%E0%A4%A");
  });
});

describe("enrichPendingReview", () => {
  it("enriquece cada pendiente con el score y perfiles del cliente correspondiente (join por clientKey)", () => {
    const pending = [{ clientKey: "cliente-a", clientName: "Cliente A" }];
    const clients = [buildClientDashboardSummary({ clientKey: "cliente-a", healthScore: 72 })];

    const enriched = enrichPendingReview(pending, clients);

    expect(enriched).toEqual([
      {
        clientKey: "cliente-a",
        clientName: "Cliente A",
        healthScore: 72,
        profileScores: clients[0].profileScores,
      },
    ]);
  });

  it("si no hay match en clients, mantiene el pendiente solo con el nombre (sin score/perfiles)", () => {
    const pending = [{ clientKey: "sin-match", clientName: "Sin Match" }];

    const enriched = enrichPendingReview(pending, []);

    expect(enriched).toEqual([{ clientKey: "sin-match", clientName: "Sin Match" }]);
  });
});

describe("buildClientRows extra fields", () => {
  it("exposes registeredBy and the most recent activity date", () => {
    const catalog = [buildQuestion()];
    const clients = [
      buildClient({
        clientKey: "reg-a",
        registeredBy: "ana@phd.cl",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      }),
    ];
    const submissions = [
      buildSubmission({ clientKey: "reg-a", submittedAt: new Date("2026-03-01T00:00:00Z") }),
      buildSubmission({
        clientKey: "reg-a",
        profile: "Gestión",
        submittedAt: new Date("2026-05-01T00:00:00Z"),
      }),
    ];

    const [row] = buildClientRows(clients, submissions, catalog);

    expect(row.registeredBy).toBe("ana@phd.cl");
    expect(row.lastUpdatedAt).toEqual(new Date("2026-05-01T00:00:00Z"));
  });

  it("falls back to createdAt when there are no submissions and is null for legacy without dates", () => {
    const catalog = [buildQuestion()];
    const created = new Date("2026-01-01T00:00:00Z");
    const [row] = buildClientRows([buildClient({ createdAt: created })], [], catalog);
    expect(row.lastUpdatedAt).toEqual(created);
  });

  it("uses the latest submission for legacy clients and omits registeredBy", () => {
    const catalog = [buildQuestion()];
    const submittedAt = new Date("2026-02-02T00:00:00Z");
    const [row] = buildClientRows(
      [],
      [buildSubmission({ clientKey: "legacy", clientName: "Legacy", submittedAt })],
      catalog
    );
    expect(row.registeredBy).toBeUndefined();
    expect(row.lastUpdatedAt).toEqual(submittedAt);
  });
});

describe("scoreTone", () => {
  it("returns none for null", () => expect(scoreTone(null)).toBe("none"));
  it("classifies low, mid and high with thresholds 50 and 75", () => {
    expect(scoreTone(0)).toBe("low");
    expect(scoreTone(49)).toBe("low");
    expect(scoreTone(50)).toBe("mid");
    expect(scoreTone(74)).toBe("mid");
    expect(scoreTone(75)).toBe("high");
    expect(scoreTone(100)).toBe("high");
  });
});

describe("filterRowsByState / countRowsByState", () => {
  const rows = [
    buildRow({ clientKey: "a", answeredCount: 1 }),
    buildRow({ clientKey: "b", answeredCount: 4 }),
    buildRow({ clientKey: "c", answeredCount: 4, isPublished: true }),
    buildRow({ clientKey: "d", answeredCount: 0 }),
  ];

  it("returns every row for the 'all' filter", () => {
    expect(filterRowsByState(rows, "all")).toHaveLength(4);
  });

  it("filters by publication state", () => {
    expect(filterRowsByState(rows, "En progreso").map((r) => r.clientKey)).toEqual(["a", "d"]);
    expect(filterRowsByState(rows, "Pendiente de revisión").map((r) => r.clientKey)).toEqual(["b"]);
    expect(filterRowsByState(rows, "Publicado").map((r) => r.clientKey)).toEqual(["c"]);
  });

  it("counts rows per filter", () => {
    expect(countRowsByState(rows)).toEqual({
      all: 4,
      "En progreso": 2,
      "Pendiente de revisión": 1,
      Publicado: 1,
    });
  });
});

describe("paginateRows", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("slices the requested page and reports the range", () => {
    const page = paginateRows(items, 2, 10);
    expect(page.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(page).toMatchObject({ page: 2, totalPages: 3, total: 25, from: 11, to: 20 });
  });

  it("clamps out-of-range pages", () => {
    expect(paginateRows(items, 99, 10).page).toBe(3);
    expect(paginateRows(items, 0, 10).page).toBe(1);
  });

  it("handles an empty list", () => {
    expect(paginateRows([], 1, 10)).toMatchObject({
      items: [],
      page: 1,
      totalPages: 1,
      total: 0,
      from: 0,
      to: 0,
    });
  });
});

describe("buildPageRange", () => {
  it("lists all pages when few", () => expect(buildPageRange(1, 3)).toEqual([1, 2, 3]));
  it("collapses far pages with ellipses", () => {
    expect(buildPageRange(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(buildPageRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(buildPageRange(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});

describe("formatLastUpdate", () => {
  it("returns an em dash for null/undefined/invalid", () => {
    expect(formatLastUpdate(null)).toBe("—");
    expect(formatLastUpdate(undefined)).toBe("—");
    expect(formatLastUpdate(new Date("nope"))).toBe("—");
  });

  it("formats dates as dd-mm-yyyy in es-CL and accepts ISO strings", () => {
    expect(formatLastUpdate(new Date(2026, 4, 7, 12))).toBe("07-05-2026");
    expect(formatLastUpdate(new Date(2026, 4, 7, 12).toISOString())).toBe("07-05-2026");
  });
});

describe("calculateCoverage", () => {
  const catalog = [
    buildQuestion({ id: "Q1", profiles: ["Calidad", "Desarrollo"] }),
    buildQuestion({ id: "Q2", profiles: ["Calidad"] }),
    buildQuestion({ id: "Q3", profiles: ["Negocio"], status: "Inactiva" }),
  ];

  it("counts total as active (question, profile) pairs and answered as matching answers", () => {
    const submissions = [
      buildSubmission({ profile: "Calidad", answers: { Q1: 0, Q2: 1 } }),
      buildSubmission({ profile: "Desarrollo", answers: { Q1: 2, Q2: 0 } }),
    ];

    // Q2 is not in Desarrollo's set, so that answer does not count.
    expect(calculateCoverage(submissions, catalog)).toEqual({ answered: 3, total: 3 });
  });

  it("returns 0 answered when there are no submissions", () => {
    expect(calculateCoverage([], catalog)).toEqual({ answered: 0, total: 3 });
  });
});

describe("buildPublicationSteps", () => {
  it("marks previous steps done, the current one active and the rest upcoming", () => {
    expect(buildPublicationSteps("Pendiente de revisión")).toEqual({
      stage: 2,
      total: 3,
      steps: [
        { label: "En progreso", status: "done" },
        { label: "Pendiente de revisión", status: "current" },
        { label: "Publicado", status: "upcoming" },
      ],
    });
  });

  it("reports stage 1 for En progreso and 3 for Publicado", () => {
    expect(buildPublicationSteps("En progreso").stage).toBe(1);
    expect(buildPublicationSteps("Publicado").stage).toBe(3);
  });
});

describe("describePublicationState", () => {
  it("returns a Spanish description per state", () => {
    expect(describePublicationState("En progreso")).toMatch(/faltan perfiles/i);
    expect(describePublicationState("Pendiente de revisión")).toMatch(/4 perfiles/i);
    expect(describePublicationState("Publicado")).toMatch(/entregado al cliente/i);
  });
});

describe("buildClientRows publication metadata", () => {
  it("exposes createdAt, publishedBy and publishedAt for registered clients", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    const publishedAt = new Date("2026-02-01T00:00:00Z");
    const [row] = buildClientRows(
      [buildClient({ createdAt, isPublished: true, publishedBy: "ana@phd.cl", publishedAt })],
      [],
      [buildQuestion()]
    );
    expect(row.createdAt).toEqual(createdAt);
    expect(row.publishedBy).toBe("ana@phd.cl");
    expect(row.publishedAt).toEqual(publishedAt);
  });
});
