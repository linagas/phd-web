/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientsTable from "@/app/quality-pulse/components/clients-table";
import { CatalogQuestion, QuestionOption } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { buildReviewHref } from "@/utils/quality-pulse/admin-view-models";

// Migración intencional (Fase 4, spec relajado `qp-admin-clients-table`): el
// botón "Publicar" (con `onPublish` disparando un endpoint) fue reemplazado
// por un `<Link href={buildReviewHref(clientKey)}>` hacia `/revisar`, con
// `stopPropagation` en su `onClick` para no togglear la fila. Esto NO es una
// regresión: la publicación ahora vive en `PublishReviewView` (Fase 3).

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

const catalog = [buildQuestion()];

function rowFor(clientName: string): HTMLElement {
  return screen.getByText(clientName).closest("tr")!;
}

async function openMenu(user: ReturnType<typeof userEvent.setup>, clientName: string): Promise<void> {
  await user.click(
    within(rowFor(clientName)).getByRole("button", { name: `Más acciones para ${clientName}` })
  );
}

describe("ClientsTable", () => {
  it("muestra nombre, completitud, score y estado de un cliente registrado", () => {
    const clients = [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })];
    const submissions = [
      buildSubmission({ clientKey: "reg-a", clientName: "Registrado A", profile: "Calidad" }),
    ];

    render(<ClientsTable clients={clients} submissions={submissions} catalog={catalog} />);

    const row = rowFor("Registrado A");
    expect(within(row).getByText("1/4 completados")).toBeInTheDocument();
    expect(within(row).getByText("En progreso")).toBeInTheDocument();
  });

  it("cliente legacy (sin alta) se muestra marcado 'No registrado' con borde punteado", () => {
    const submissions = [
      buildSubmission({ clientKey: "legacy-b", clientName: "Legacy B", profile: "Calidad" }),
    ];

    render(<ClientsTable clients={[]} submissions={submissions} catalog={catalog} />);

    const row = rowFor("Legacy B");
    const badge = within(row).getByText("No registrado");
    expect(badge.className).toContain("border-dashed");
  });

  it("la búsqueda filtra filas por nombre insensible a tildes", async () => {
    const user = userEvent.setup();
    const clients = [
      buildClient({ clientKey: "a", clientName: "Compañía Ñandú" }),
      buildClient({ clientKey: "b", clientName: "Banco Sur" }),
    ];

    render(<ClientsTable clients={clients} submissions={[]} catalog={catalog} />);

    expect(screen.getByText("Compañía Ñandú")).toBeInTheDocument();
    expect(screen.getByText("Banco Sur")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /buscar/i }), "nandu");

    expect(screen.getByText("Compañía Ñandú")).toBeInTheDocument();
    expect(screen.queryByText("Banco Sur")).not.toBeInTheDocument();
  });

  it("'Publicar' (link a /revisar) aparece solo para un cliente registrado 4/4 no publicado", async () => {
    const user = userEvent.setup();
    const clients = [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })];
    const submissions = ["Calidad", "Desarrollo", "Gestión", "Negocio"].map((profile) =>
      buildSubmission({
        clientKey: "reg-a",
        clientName: "Registrado A",
        profile: profile as QualityPulseAssessment["profile"],
      })
    );

    render(<ClientsTable clients={clients} submissions={submissions} catalog={catalog} />);

    await openMenu(user, "Registrado A");
    const link = screen.getByRole("menuitem", { name: "Publicar" });
    expect(link).toHaveAttribute("href", buildReviewHref("reg-a"));
  });

  it("'Publicar' está ausente para un cliente legacy 4/4 (no registrado)", () => {
    const submissions = ["Calidad", "Desarrollo", "Gestión", "Negocio"].map((profile) =>
      buildSubmission({
        clientKey: "legacy-b",
        clientName: "Legacy B",
        profile: profile as QualityPulseAssessment["profile"],
      })
    );

    render(<ClientsTable clients={[]} submissions={submissions} catalog={catalog} />);

    const row = rowFor("Legacy B");
    expect(within(row).queryByRole("link", { name: "Publicar" })).not.toBeInTheDocument();
    expect(within(row).getByText("Pendiente de revisión")).toBeInTheDocument();
  });

  it("'Publicar' está ausente para un cliente registrado parcial o ya publicado", () => {
    const clients = [
      buildClient({ clientKey: "partial", clientName: "Parcial" }),
      buildClient({ clientKey: "published", clientName: "Publicado Ya", isPublished: true }),
    ];
    const submissions = [
      buildSubmission({ clientKey: "partial", clientName: "Parcial", profile: "Calidad" }),
      ...["Calidad", "Desarrollo", "Gestión", "Negocio"].map((profile) =>
        buildSubmission({
          clientKey: "published",
          clientName: "Publicado Ya",
          profile: profile as QualityPulseAssessment["profile"],
        })
      ),
    ];

    render(<ClientsTable clients={clients} submissions={submissions} catalog={catalog} />);

    expect(
      within(rowFor("Parcial")).queryByRole("link", { name: "Publicar" })
    ).not.toBeInTheDocument();
    expect(
      within(rowFor("Publicado Ya")).queryByRole("link", { name: "Publicar" })
    ).not.toBeInTheDocument();
  });

  describe("Eliminar (soft delete)", () => {
    function renderTable(onDelete: jest.Mock, clients: QualityPulseClient[], submissions: QualityPulseAssessment[] = []) {
      render(
        <ClientsTable
          clients={clients}
          submissions={submissions}
          catalog={catalog}
          onDelete={onDelete}
        />
      );
    }

    it("pide confirmación inline y no llama a onDelete hasta confirmar", async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      renderTable(onDelete, [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })]);

      await openMenu(user, "Registrado A");
      await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));

      expect(onDelete).not.toHaveBeenCalled();
      await user.click(
        within(rowFor("Registrado A")).getByRole("button", { name: "Confirmar eliminación" })
      );
      expect(onDelete).toHaveBeenCalledWith("reg-a");
    });

    it("'Cancelar' descarta la confirmación sin llamar a onDelete", async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      renderTable(onDelete, [buildClient({ clientKey: "reg-a", clientName: "Registrado A" })]);

      await openMenu(user, "Registrado A");
      await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));
      await user.click(within(rowFor("Registrado A")).getByRole("button", { name: "Cancelar" }));

      expect(onDelete).not.toHaveBeenCalled();
      expect(
        within(rowFor("Registrado A")).getByRole("button", { name: "Más acciones para Registrado A" })
      ).toBeInTheDocument();
    });

    it("'Eliminar' está ausente para clientes legacy no registrados", () => {
      const submissions = [
        buildSubmission({ clientKey: "legacy-b", clientName: "Legacy B", profile: "Calidad" }),
      ];
      renderTable(jest.fn(), [], submissions);

      expect(
        within(rowFor("Legacy B")).queryByRole("button", { name: /Más acciones/ })
      ).not.toBeInTheDocument();
    });
  });

  describe("filters, kebab menu and pagination", () => {
    function manyClients(count: number): QualityPulseClient[] {
      return Array.from({ length: count }, (_, index) =>
        buildClient({
          clientKey: `c-${String(index).padStart(2, "0")}`,
          clientName: `Cliente ${String(index).padStart(2, "0")}`,
        })
      );
    }

    it("shows chips with counts and filters by state with aria-pressed", async () => {
      const user = userEvent.setup();
      const clients = [
        buildClient({ clientKey: "a", clientName: "Alfa", isPublished: true }),
        buildClient({ clientKey: "b", clientName: "Beta" }),
      ];
      render(<ClientsTable clients={clients} submissions={[]} catalog={catalog} />);

      expect(screen.getByRole("button", { name: "Todos (2)" })).toHaveAttribute("aria-pressed", "true");
      await user.click(screen.getByRole("button", { name: "Publicado (1)" }));

      expect(screen.getByRole("button", { name: "Publicado (1)" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("Alfa")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    });

    it("paginates 10 rows per page and resets to page 1 when the query changes", async () => {
      const user = userEvent.setup();
      render(<ClientsTable clients={manyClients(12)} submissions={[]} catalog={catalog} />);

      expect(screen.getByText("Mostrando 1-10 de 12 clientes registrados")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
      expect(screen.getByText("Mostrando 11-12 de 12 clientes registrados")).toBeInTheDocument();

      await user.type(screen.getByLabelText("Buscar cliente"), "Cliente 0");
      expect(screen.getByText("Mostrando 1-10 de 10 clientes registrados")).toBeInTheDocument();
    });

    it("'Ver ficha' is a link to the client detail page and the menu closes with Escape", async () => {
      const user = userEvent.setup();
      render(<ClientsTable clients={manyClients(1)} submissions={[]} catalog={catalog} onDelete={jest.fn()} />);

      expect(screen.getByRole("link", { name: "Ver ficha de Cliente 00" })).toHaveAttribute(
        "href",
        buildReviewHref("c-00")
      );

      await openMenu(user, "Cliente 00");
      expect(screen.getByRole("menu")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("renders the open menu in a portal on document.body (not clipped by phd-glass)", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ClientsTable clients={manyClients(1)} submissions={[]} catalog={catalog} onDelete={jest.fn()} />
      );

      await openMenu(user, "Cliente 00");

      const menu = screen.getByRole("menu");
      expect(container.contains(menu)).toBe(false);
      expect(document.body.contains(menu)).toBe(true);
    });
  });
});
