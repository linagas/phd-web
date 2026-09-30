/** @jest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPanel from "@/app/quality-pulse/components/admin-panel";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { buildReviewHref } from "@/utils/quality-pulse/admin-view-models";

// Migración intencional (Fase 4, spec relajado `qp-admin-console`): el
// `<select>` de un solo cliente fue reemplazado por `ClientsTable`, cuyas
// filas arrancan colapsadas. Los tests que antes leían el badge/acciones
// directamente ahora hacen click en la fila primero. El lenguaje de estados
// también cambió: el viejo booleano "No publicado" pasó a ser uno de 3
// estados derivados (`derivePublicationState`); un cliente 0/4 sin publicar
// ahora se etiqueta "En progreso", no "No publicado". Esto NO es una
// regresión: las acciones (endpoints, bodies, confirmaciones) siguen siendo
// las mismas, solo cambió la UI que las expone (ver design.md Q3).

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

const catalog = [buildQuestion()];

function buildClient(overrides: Partial<QualityPulseClient> = {}): QualityPulseClient {
  return {
    clientKey: "acme",
    clientName: "Acme",
    registeredBy: "admin@phd.cl",
    createdAt: new Date(),
    isPublished: false,
    ...overrides,
  };
}

function buildSubmission(overrides: Partial<QualityPulseAssessment>): QualityPulseAssessment {
  return {
    clientKey: "acme",
    clientName: "Acme",
    profile: "Calidad",
    answers: { Q1: 2 },
    questionCount: 1,
    submittedAt: new Date(),
    ...overrides,
  };
}

function fourProfileSubmissions(clientKey: string, clientName: string): QualityPulseAssessment[] {
  return ["Calidad", "Desarrollo", "Gestión", "Negocio"].map((profile) =>
    buildSubmission({
      clientKey,
      clientName,
      profile: profile as QualityPulseAssessment["profile"],
    })
  );
}

function rowFor(clientName: string): HTMLElement {
  return screen.getByText(clientName).closest("tr")!;
}

describe("AdminPanel — badge de publicación y despublicar", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  function mockLoadData(
    clients: QualityPulseClient[],
    submissions: QualityPulseAssessment[] = []
  ) {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/quality-pulse/assessments") {
        return Promise.resolve({ ok: true, json: async () => submissions });
      }
      if (url === "/api/quality-pulse/catalog") {
        return Promise.resolve({ ok: true, json: async () => catalog });
      }
      if (url === "/api/quality-pulse/clients") {
        return Promise.resolve({ ok: true, json: async () => clients });
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });
  }

  it("muestra badge 'En progreso' para un cliente sin publicar (migrado de 'No publicado')", async () => {
    mockLoadData([buildClient({ isPublished: false })]);

    render(<AdminPanel adminEmail="admin@phd.cl" />);

    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    expect(within(rowFor("Acme")).getByText("En progreso")).toBeInTheDocument();
  });

  it("muestra badge 'Publicado' para un cliente publicado", async () => {
    mockLoadData([buildClient({ isPublished: true })]);

    render(<AdminPanel adminEmail="admin@phd.cl" />);

    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    expect(within(rowFor("Acme")).getByText("Publicado")).toBeInTheDocument();
  });
});

// Migración intencional (Fase 4, spec relajado `qp-admin-console`): "Publicar"
// en la fila ya no dispara `handlePublish`/POST desde `AdminPanel` — es un
// `<Link>` (ver `clients-table.test.tsx`) hacia `/revisar`, único lugar que
// hace el POST a `/api/quality-pulse/admin/publication` (`PublishReviewView`,
// Fase 3). Esto NO es una regresión.
describe("AdminPanel — Publicar desde la fila (ahora un link a /revisar)", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  function mockLoadData(
    clients: QualityPulseClient[],
    submissions: QualityPulseAssessment[] = []
  ) {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/quality-pulse/assessments") {
        return Promise.resolve({ ok: true, json: async () => submissions });
      }
      if (url === "/api/quality-pulse/catalog") {
        return Promise.resolve({ ok: true, json: async () => catalog });
      }
      if (url === "/api/quality-pulse/clients") {
        return Promise.resolve({ ok: true, json: async () => clients });
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });
  }

  it("'Publicar' de un cliente registrado 4/4 es un link hacia buildReviewHref(clientKey), sin fetch adicional", async () => {
    mockLoadData([buildClient()], fourProfileSubmissions("acme", "Acme"));

    render(<AdminPanel adminEmail="admin@phd.cl" />);

    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    await userEvent.setup().click(
      within(rowFor("Acme")).getByRole("button", { name: "Más acciones para Acme" })
    );
    const publishLink = screen.getByRole("menuitem", { name: "Publicar" });

    expect(publishLink).toHaveAttribute("href", buildReviewHref("acme"));
    expect(mockFetch).toHaveBeenCalledTimes(3); // solo la carga inicial (assessments+catalog+clients)
  });

  it("'Publicar' está ausente para un cliente legacy 4/4 no registrado", async () => {
    mockLoadData([], fourProfileSubmissions("legacy-key", "Legacy Co"));

    render(<AdminPanel adminEmail="admin@phd.cl" />);

    await waitFor(() => expect(screen.getByText("Legacy Co")).toBeInTheDocument());
    expect(
      within(rowFor("Legacy Co")).queryByRole("link", { name: "Publicar" })
    ).not.toBeInTheDocument();
    expect(within(rowFor("Legacy Co")).getByText("Pendiente de revisión")).toBeInTheDocument();
  });
});

describe("AdminPanel — Eliminar cliente (soft delete)", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/quality-pulse/assessments") {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url === "/api/quality-pulse/catalog") {
        return Promise.resolve({ ok: true, json: async () => catalog });
      }
      if (url === "/api/quality-pulse/clients") {
        return Promise.resolve({
          ok: true,
          json: async () => [buildClient(), buildClient({ clientKey: "beta", clientName: "Beta" })],
        });
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("confirma, llama DELETE /api/quality-pulse/admin/clients y quita la fila", async () => {
    const user = userEvent.setup();
    render(<AdminPanel adminEmail="admin@phd.cl" />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ deleted: true }) })
    );

    await user.click(
      within(rowFor("Acme")).getByRole("button", { name: "Más acciones para Acme" })
    );
    await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    await user.click(
      within(rowFor("Acme")).getByRole("button", { name: "Confirmar eliminación" })
    );

    await waitFor(() => expect(screen.queryByText("Acme")).not.toBeInTheDocument());
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith("/api/quality-pulse/admin/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientKey: "acme" }),
    });
  });

  it("muestra error accesible (role=alert) y conserva la fila si el DELETE falla", async () => {
    const user = userEvent.setup();
    render(<AdminPanel adminEmail="admin@phd.cl" />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: "El cliente no existe." }),
      })
    );

    await user.click(
      within(rowFor("Acme")).getByRole("button", { name: "Más acciones para Acme" })
    );
    await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    await user.click(
      within(rowFor("Acme")).getByRole("button", { name: "Confirmar eliminación" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("El cliente no existe.");
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});

describe("AdminPanel — Eliminados y Restaurar", () => {
  const mockFetch = jest.fn();
  const deletedAcme = buildClient({ clientKey: "gone", clientName: "Gone Co", deletedAt: new Date() });

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/quality-pulse/assessments") {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url === "/api/quality-pulse/catalog") {
        return Promise.resolve({ ok: true, json: async () => catalog });
      }
      if (url === "/api/quality-pulse/clients") {
        return Promise.resolve({ ok: true, json: async () => [buildClient()] });
      }
      if (url === "/api/quality-pulse/admin/clients/deleted") {
        return Promise.resolve({ ok: true, json: async () => [deletedAcme] });
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("lista los clientes eliminados al abrir la sección 'Eliminados'", async () => {
    const user = userEvent.setup();
    render(<AdminPanel adminEmail="admin@phd.cl" />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());

    expect(screen.queryByText("Gone Co")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Eliminados/ }));

    expect(await screen.findByText("Gone Co")).toBeInTheDocument();
  });

  it("Restaurar llama POST /api/quality-pulse/admin/clients/restore y recarga los datos", async () => {
    const user = userEvent.setup();
    render(<AdminPanel adminEmail="admin@phd.cl" />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Eliminados/ }));
    await screen.findByText("Gone Co");

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ restored: true }) })
    );
    await user.click(screen.getByRole("button", { name: "Restaurar" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/quality-pulse/admin/clients/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: "gone" }),
      })
    );
    await waitFor(() => expect(screen.queryByText("Gone Co")).not.toBeInTheDocument());
  });

  it("muestra error role=alert si Restaurar falla", async () => {
    const user = userEvent.setup();
    render(<AdminPanel adminEmail="admin@phd.cl" />);
    await waitFor(() => expect(screen.getByText("Acme")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Eliminados/ }));
    await screen.findByText("Gone Co");

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: async () => ({ error: "No eliminado." }) })
    );
    await user.click(screen.getByRole("button", { name: "Restaurar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No eliminado.");
    expect(screen.getByText("Gone Co")).toBeInTheDocument();
  });
});
