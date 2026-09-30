import {
  buildClientRows,
  buildReviewHref,
  canPublish,
  ClientRow,
  derivePublicationState,
  enrichPendingReview,
  filterRowsByName,
  formatCompletion,
  formatRowScore,
  resolveReviewEligibility,
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
