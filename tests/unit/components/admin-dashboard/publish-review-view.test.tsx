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
      expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeInTheDocument()
    );
    expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument();
  });

  it("clientKey desconocido: bloquea sin panel ni botón", async () => {
    mockThreeGetsAndReturn(mockFetch, { clients: [], submissions: [] });

    render(<PublishReviewView clientKey="no-existe" />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Confirmar publicación" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Quality Health Score/i)).not.toBeInTheDocument();
  });

  it("cliente ya publicado: bloquea sin panel ni botón", async () => {
    mockThreeGetsAndReturn(mockFetch, { clients: [buildClient({ isPublished: true })] });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/ya fue publicado/i)
    );
    expect(screen.queryByRole("button", { name: "Confirmar publicación" })).not.toBeInTheDocument();
  });

  it("cliente no registrado (legacy): bloquea sin panel ni botón", async () => {
    mockThreeGetsAndReturn(mockFetch, {
      clients: [],
      submissions: FULL_SUBMISSIONS.map((s) => ({ ...s, clientKey: "cliente-a" })),
    });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/no está registrado/i)
    );
    expect(screen.queryByRole("button", { name: "Confirmar publicación" })).not.toBeInTheDocument();
  });

  it("cliente incompleto (<4/4): bloquea sin panel ni botón", async () => {
    mockThreeGetsAndReturn(mockFetch, { submissions: [buildSubmission({ profile: "Calidad" })] });

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/4 perfiles/i)
    );
    expect(screen.queryByRole("button", { name: "Confirmar publicación" })).not.toBeInTheDocument();
  });

  it("al confirmar, llama a POST /api/quality-pulse/admin/publication con el clientKey", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ isPublished: true }) });

    await user.click(screen.getByRole("button", { name: "Confirmar publicación" }));

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
      expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ isPublished: true }) });

    await user.click(screen.getByRole("button", { name: "Confirmar publicación" }));

    await waitFor(() => expect(screen.getByText("Publicado")).toBeInTheDocument());
    expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument();
  });

  it("409 al confirmar: muestra el mensaje del servidor y el botón sigue habilitado", async () => {
    const user = userEvent.setup();
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeInTheDocument()
    );

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'El cliente "cliente-a" no tiene los 4 perfiles respondidos (4/4).' }),
    });

    await user.click(screen.getByRole("button", { name: "Confirmar publicación" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        'El cliente "cliente-a" no tiene los 4 perfiles respondidos (4/4).'
      )
    );
    expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeEnabled();
  });

  it("el link 'Volver' siempre apunta a /administracion/clientes", async () => {
    mockThreeGetsAndReturn(mockFetch);

    render(<PublishReviewView clientKey="cliente-a" />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Volver" })).toHaveAttribute(
        "href",
        "/administracion/clientes"
      )
    );
  });
});
