/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import ClientScoreTable from "@/app/administracion/(console)/components/client-score-table";
import { ClientDashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { ProfileScore } from "@/utils/quality-pulse/scoring";

function buildProfileScores(overrides: Partial<Record<string, ProfileScore>> = {}): ProfileScore[] {
  const base: ProfileScore[] = [
    { profile: "Calidad", status: "answered", score: 80 },
    { profile: "Desarrollo", status: "answered", score: 60 },
    { profile: "Gestión", status: "answered", score: 70 },
    { profile: "Negocio", status: "pending", score: null },
  ];
  return base.map((profileScore) => overrides[profileScore.profile] ?? profileScore);
}

function buildClient(overrides: Partial<ClientDashboardSummary> = {}): ClientDashboardSummary {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    isPublished: false,
    answeredCount: 3,
    healthScore: 70,
    profileScores: buildProfileScores(),
    ...overrides,
  };
}

describe("ClientScoreTable", () => {
  it("muestra el score global y usa las etiquetas exactas Calidad/Desarrollo/Gestión/Negocio", () => {
    render(<ClientScoreTable clients={[buildClient()]} globalHealthScore={65} />);

    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("Calidad")).toBeInTheDocument();
    expect(screen.getByText("Desarrollo")).toBeInTheDocument();
    expect(screen.getByText("Gestión")).toBeInTheDocument();
    expect(screen.getByText("Negocio")).toBeInTheDocument();
    expect(screen.queryByText("QA")).not.toBeInTheDocument();
    expect(screen.queryByText("DEV")).not.toBeInTheDocument();
    expect(screen.queryByText("MGT")).not.toBeInTheDocument();
    expect(screen.queryByText("BIZ")).not.toBeInTheDocument();
  });

  it("muestra el badge Pendiente para perfiles sin responder, no un 0", () => {
    render(<ClientScoreTable clients={[buildClient()]} globalHealthScore={65} />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByLabelText("Sin datos")).toBeInTheDocument();
    expect(screen.queryByText("0", { selector: "span.font-heading" })).not.toBeInTheDocument();
  });

  it("score global null se muestra como Sin datos, y la tabla vacía no lanza error", () => {
    render(<ClientScoreTable clients={[]} globalHealthScore={null} />);

    expect(screen.getAllByText("Sin datos").length).toBeGreaterThan(0);
    expect(screen.getByText("Aún no hay clientes registrados.")).toBeInTheDocument();
  });

  it("el score de un perfil respondido usa tipografía phd-cyan, sin duplicar el texto del valor", () => {
    render(<ClientScoreTable clients={[buildClient()]} globalHealthScore={65} />);

    const answeredScores = screen.getAllByTestId("profile-score-answered");
    expect(answeredScores.length).toBeGreaterThan(0);
    answeredScores.forEach((el) => expect(el.className).toContain("phd-cyan"));
    expect(screen.getAllByText("80")).toHaveLength(1);
  });
});
