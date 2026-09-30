/** @jest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import DashboardView from "@/app/administracion/(console)/components/dashboard-view";
import { DashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { buildReviewHref } from "@/utils/quality-pulse/admin-view-models";

// Migración intencional (Fase 4, spec relajado `qp-admin-dashboard`): el
// Dashboard ya NO publica clientes inline. "Revisar y publicar" ahora es un
// link (ver `pending-review-list.test.tsx`) hacia `/revisar`, y el POST a
// `/api/quality-pulse/admin/publication` vive únicamente en
// `PublishReviewView` (Fase 3). Por eso los tests viejos de click -> POST ->
// recarga se retiran de aquí; esto NO es una regresión, es un cambio de
// responsabilidad intencional documentado en design.md.

function buildSummary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
    kpis: {
      registeredClients: 1,
      submissions: 4,
      expectedSubmissions: 4,
      completionPct: 100,
      pendingReview: 1,
    },
    globalHealthScore: 80,
    clients: [
      {
        clientKey: "a",
        clientName: "Cliente A",
        isPublished: false,
        answeredCount: 4,
        healthScore: 80,
        profileScores: [
          { profile: "Calidad", status: "answered", score: 80 },
          { profile: "Desarrollo", status: "answered", score: 80 },
          { profile: "Gestión", status: "answered", score: 80 },
          { profile: "Negocio", status: "answered", score: 80 },
        ],
      },
    ],
    pendingReview: [{ clientKey: "a", clientName: "Cliente A" }],
    ...overrides,
  };
}

describe("DashboardView", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("muestra estado de carga, hace fetch al endpoint del dashboard y renderiza el resumen", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => buildSummary(),
    });

    render(<DashboardView />);

    expect(screen.getByText("Cargando datos…")).toBeInTheDocument();

    await waitFor(() => expect(screen.getAllByText("Cliente A").length).toBeGreaterThan(0));

    expect(mockFetch).toHaveBeenCalledWith("/api/quality-pulse/admin/dashboard");
  });

  it("muestra un error accesible cuando el fetch falla (respuesta no-ok)", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(<DashboardView />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "No se pudo cargar el resumen del dashboard."
      )
    );
  });

  it("muestra un error accesible cuando el fetch rechaza (network error)", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    render(<DashboardView />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("'Revisar y publicar' es un link hacia /revisar y no dispara ningún fetch adicional al renderizar", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => buildSummary() });

    render(<DashboardView />);

    await waitFor(() => expect(screen.getAllByText("Cliente A").length).toBeGreaterThan(0));

    const link = screen.getByRole("link", { name: "Revisar y publicar" });
    expect(link).toHaveAttribute("href", buildReviewHref("a"));
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("enriquece 'Pendientes de Revisión' via enrichPendingReview con score y chips por perfil, uniendo por clientKey contra summary.clients", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => buildSummary() });

    render(<DashboardView />);

    await waitFor(() => expect(screen.getAllByText("Cliente A").length).toBeGreaterThan(0));

    const reviewLink = screen.getByRole("link", { name: "Revisar y publicar" });
    const pendingItem = reviewLink.closest("li")!;
    expect(within(pendingItem).getAllByText("Respondido")).toHaveLength(4);
  });

  it("compone las secciones del dashboard dentro de un layout en grilla", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => buildSummary() });

    render(<DashboardView />);

    await waitFor(() => expect(screen.getAllByText("Cliente A").length).toBeGreaterThan(0));

    expect(screen.getByTestId("dashboard-layout").className).toContain("grid");
  });
});
