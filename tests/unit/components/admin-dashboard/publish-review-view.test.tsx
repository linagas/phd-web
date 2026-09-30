/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PublishReviewView from "@/app/administracion/(console)/components/publish-review-view";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

const ASSESSMENTS_ENDPOINT = "/api/quality-pulse/assessments";
const CATALOG_ENDPOINT = "/api/quality-pulse/catalog";
const CLIENTS_ENDPOINT = "/api/quality-pulse/clients";
const PUBLICATION_ENDPOINT = "/api/quality-pulse/admin/publication";

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
    answers: {},
    questionCount: 0,
    submittedAt: new Date(),
    ...overrides,
  };
}

const FULL_SUBMISSIONS: QualityPulseAssessment[] = [
  buildSubmission({ profile: "Calidad" }),
  buildSubmission({ profile: "Desarrollo" }),
  buildSubmission({ profile: "Gestión" }),
  buildSubmission({ profile: "Negocio" }),
];

function mockThreeGetsAndReturn(
  mockFetch: jest.Mock,
  {
    clients = [buildClient()],
    submissions = FULL_SUBMISSIONS,
    catalog = [] as unknown[],
  }: { clients?: QualityPulseClient[]; submissions?: QualityPulseAssessment[]; catalog?: unknown[] } = {}
) {
  mockFetch.mockImplementation((url: string) => {
    if (url === ASSESSMENTS_ENDPOINT) {
      return Promise.resolve({ ok: true, json: async () => submissions });
    }
    if (url === CATALOG_ENDPOINT) {
      return Promise.resolve({ ok: true, json: async () => catalog });
    }
    if (url === CLIENTS_ENDPOINT) {
      return Promise.resolve({ ok: true, json: async () => clients });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
}

describe("PublishReviewView", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("muestra un estado de carga mientras llegan los 3 fetch", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<PublishReviewView clientKey="cliente-a" />);

    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it("cliente elegible (4/4, no publicado): muestra el detalle de resultados y el botón de confirmar", async () => {
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Publicar al cliente" })).toBeInTheDocument()
    );
    expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument();
  });

  it("clientKey desconocido: bloquea sin panel ni botón", async () => {
    mockThreeGetsAndReturn(mockFetch, { clients: [], submissions: [] });

    render(<PublishReviewView clientKey="no-existe" />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Publicar al cliente" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Quality Health Score/i)).not.toBeInTheDocument();
  });

  it("cliente ya publicado: muestra la ficha en solo lectura, sin publicar y con Despublicar", async () => {
    mockThreeGetsAndReturn(mockFetch, { clients: [buildClient({ isPublished: true })] });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() => expect(screen.getAllByText("Publicado").length).toBeGreaterThan(0));
    expect(screen.getByRole("heading", { level: 1, name: "Cliente A" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publicar al cliente" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Despublicar" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("cliente no registrado (legacy): muestra la ficha con 'No registrado' y sin publicar", async () => {
    mockThreeGetsAndReturn(mockFetch, { clients: [] });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() => expect(screen.getByText("No registrado")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Publicar al cliente" })).not.toBeInTheDocument();
  });

  it("cliente incompleto (<4/4): muestra las tarjetas por perfil y no ofrece publicar", async () => {
    mockThreeGetsAndReturn(mockFetch, { submissions: [buildSubmission({ profile: "Calidad" })] });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() => expect(screen.getAllByText("En progreso").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Respondido")).toHaveLength(1);
    expect(screen.getAllByText("Pendiente")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Publicar al cliente" })).not.toBeInTheDocument();
  });

  it("reiniciar perfil pide confirmación y llama a DELETE /admin/assessments con el perfil", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);
    render(<PublishReviewView clientKey="cliente-a" />);
    await waitFor(() => expect(screen.getAllByText("Respondido")).toHaveLength(4));

    mockFetch.mockClear();
    mockThreeGetsAndReturn(mockFetch);
    await user.click(screen.getAllByRole("button", { name: "Reiniciar perfil" })[0]);
    expect(mockFetch).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/quality-pulse/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: "cliente-a", profile: "Calidad" }),
      })
    );
  });

  it("Acciones avanzadas: 'Reiniciar todo el cliente' exige escribir REINICIAR", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);
    render(<PublishReviewView clientKey="cliente-a" />);
    await waitFor(() => expect(screen.getByText("Acciones avanzadas")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Reiniciar todo el cliente" }));
    const confirm = screen.getByRole("button", { name: "Confirmar reinicio total" });
    expect(confirm).toBeDisabled();

    mockFetch.mockClear();
    mockThreeGetsAndReturn(mockFetch);
    await user.type(screen.getByLabelText(/Escribe REINICIAR/i), "REINICIAR");
    await user.click(confirm);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/quality-pulse/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: "cliente-a", resetAll: true }),
      })
    );
  });

  it("Despublicar llama a DELETE /admin/publication", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch, { clients: [buildClient({ isPublished: true })] });
    render(<PublishReviewView clientKey="cliente-a" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Despublicar" })).toBeInTheDocument());

    mockFetch.mockClear();
    mockThreeGetsAndReturn(mockFetch);
    await user.click(screen.getByRole("button", { name: "Despublicar" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(PUBLICATION_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: "cliente-a" }),
      })
    );
  });

  it("al confirmar, llama a POST /api/quality-pulse/admin/publication con el clientKey", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Publicar al cliente" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ isPublished: true }) });

    await user.click(screen.getByRole("button", { name: "Publicar al cliente" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenLastCalledWith(PUBLICATION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: "cliente-a" }),
      })
    );
  });

  it("200 al confirmar: muestra el estado 'Publicado' sin redirigir", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Publicar al cliente" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ isPublished: true }) });

    await user.click(screen.getByRole("button", { name: "Publicar al cliente" }));

    await waitFor(() => expect(screen.getAllByText("Publicado").length).toBeGreaterThan(0));
    expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument();
  });

  it("409 al confirmar: muestra el mensaje del servidor y el botón sigue habilitado", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Publicar al cliente" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'El cliente "cliente-a" no tiene los 4 perfiles respondidos (4/4).' }),
    });

    await user.click(screen.getByRole("button", { name: "Publicar al cliente" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        'El cliente "cliente-a" no tiene los 4 perfiles respondidos (4/4).'
      )
    );
    expect(screen.getByRole("button", { name: "Publicar al cliente" })).toBeEnabled();
  });

  it("el link 'Volver' siempre apunta a /administracion/clientes", async () => {
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Volver a Clientes" })).toHaveAttribute(
        "href",
        "/administracion/clientes"
      )
    );
  });

  describe("hero", () => {
    it("shows registration meta, coverage and the publication stepper for a pending client", async () => {
      mockThreeGetsAndReturn(mockFetch, {
        clients: [
          buildClient({
            registeredBy: "ana@phd.cl",
            createdAt: new Date(2026, 0, 5, 12),
          }),
        ],
      });

      render(<PublishReviewView clientKey="cliente-a" />);

      await waitFor(() => expect(screen.getByText("Registrado por ana@phd.cl")).toBeInTheDocument());
      expect(screen.getByText("Registrado: 05-01-2026")).toBeInTheDocument();
      expect(screen.getByText(/Cobertura/i)).toBeInTheDocument();
      expect(screen.getByText(/AQI consolidado/i)).toBeInTheDocument();
      expect(screen.getByText("Etapa 2 de 3")).toBeInTheDocument();

      const current = screen.getByRole("listitem", { current: "step" });
      expect(current).toHaveTextContent("Pendiente de revisión");
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.queryByText("Aprobado")).not.toBeInTheDocument();
      expect(screen.getByText("Aún no publicado")).toBeInTheDocument();
    });

    it("omits meta lines that have no data (legacy client)", async () => {
      mockThreeGetsAndReturn(mockFetch, { clients: [] });

      render(<PublishReviewView clientKey="cliente-a" />);

      await waitFor(() => expect(screen.getByText("No registrado")).toBeInTheDocument());
      expect(screen.queryByText(/Registrado por/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Registrado:/)).not.toBeInTheDocument();
    });

    it("shows who and when published, and no publish button", async () => {
      mockThreeGetsAndReturn(mockFetch, {
        clients: [
          buildClient({
            isPublished: true,
            publishedBy: "ana@phd.cl",
            publishedAt: new Date(2026, 1, 3, 12),
          }),
        ],
      });

      render(<PublishReviewView clientKey="cliente-a" />);

      await waitFor(() =>
        expect(screen.getByText("Publicado por ana@phd.cl el 03-02-2026")).toBeInTheDocument()
      );
      expect(screen.getByText("Etapa 3 de 3")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Publicar al cliente" })).not.toBeInTheDocument();
    });
  });

  describe("Exportar PDF (print)", () => {
    const originalPrint = window.print;
    const printMock = jest.fn();

    beforeEach(() => {
      window.print = printMock;
      document.title = "Original";
    });

    afterEach(() => {
      window.print = originalPrint;
      printMock.mockReset();
    });

    it("is visible for any state (in-progress client) with a clear aria-label", async () => {
      mockThreeGetsAndReturn(mockFetch, { submissions: [buildSubmission({ profile: "Calidad" })] });

      render(<PublishReviewView clientKey="cliente-a" />);

      const button = await screen.findByRole("button", {
        name: "Exportar PDF de la ficha de Cliente A",
      });
      expect(button).toHaveTextContent("Exportar PDF");
      expect(button).toHaveClass("print:hidden");
    });

    it("sets the document title, calls window.print and restores the title on afterprint", async () => {
      const user = userEvent.setup();
      mockThreeGetsAndReturn(mockFetch);
      render(<PublishReviewView clientKey="cliente-a" />);

      await user.click(
        await screen.findByRole("button", { name: "Exportar PDF de la ficha de Cliente A" })
      );

      expect(printMock).toHaveBeenCalledTimes(1);
      expect(document.title).toBe("Quality Pulse - Cliente A");

      window.dispatchEvent(new Event("afterprint"));
      expect(document.title).toBe("Original");
    });

    it("hides navigation, actions and advanced controls when printing", async () => {
      mockThreeGetsAndReturn(mockFetch);
      render(<PublishReviewView clientKey="cliente-a" />);

      await waitFor(() => expect(screen.getByText("Acciones avanzadas")).toBeInTheDocument());

      expect(screen.getByRole("link", { name: "Volver a Clientes" }).closest("div")).toHaveClass(
        "print:hidden"
      );
      expect(screen.getByRole("button", { name: "Publicar al cliente" })).toHaveClass("print:hidden");
      expect(screen.getByText("Acciones avanzadas").closest("section")).toHaveClass("print:hidden");
      for (const button of screen.getAllByRole("button", { name: "Reiniciar perfil" })) {
        expect(button).toHaveClass("print:hidden");
      }
    });
  });
});
