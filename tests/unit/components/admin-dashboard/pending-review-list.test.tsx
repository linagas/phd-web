/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import PendingReviewList from "@/app/administracion/(console)/components/pending-review-list";
import { buildReviewHref, PendingReviewEntry } from "@/utils/quality-pulse/admin-view-models";
import { ProfileScore } from "@/utils/quality-pulse/scoring";

// Migración intencional (Fase 4, spec relajado `qp-admin-dashboard`): el botón
// "Revisar y publicar" (con `onReview` disparando un endpoint) fue reemplazado
// por un `<Link href={buildReviewHref(clientKey)}>` real hacia
// `/administracion/clientes/{clientKey}/revisar`. La lista ya NO publica nada
// directamente; solo navega. Esto NO es una regresión: la acción de publicar
// se movió al contenedor de esa página (`PublishReviewView`, Fase 3).

function buildEnrichedItem(overrides: Partial<PendingReviewEntry> = {}): PendingReviewEntry {
  const profileScores: ProfileScore[] = [
    { profile: "Calidad", status: "answered", score: 80 },
    { profile: "Desarrollo", status: "answered", score: 80 },
    { profile: "Gestión", status: "answered", score: 80 },
    { profile: "Negocio", status: "pending", score: null },
  ];
  return {
    clientKey: "a",
    clientName: "Cliente A",
    healthScore: 80,
    profileScores,
    ...overrides,
  };
}

describe("PendingReviewList", () => {
  it("lista los clientes recibidos con un link 'Revisar y publicar' hacia la página de revisión", () => {
    render(<PendingReviewList items={[{ clientKey: "a", clientName: "Cliente A" }]} />);

    expect(screen.getByText("Cliente A")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Revisar y publicar" });
    expect(link).toHaveAttribute("href", buildReviewHref("a"));
  });

  it("estado vacío no lanza error", () => {
    render(<PendingReviewList items={[]} />);

    expect(screen.getByText("No hay clientes pendientes de revisión.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("el link codifica el clientKey (espacios/acentos) igual que buildReviewHref", () => {
    render(<PendingReviewList items={[{ clientKey: "Compañía Ñandú", clientName: "Compañía Ñandú" }]} />);

    const link = screen.getByRole("link", { name: "Revisar y publicar" });
    expect(link).toHaveAttribute("href", buildReviewHref("Compañía Ñandú"));
  });

  it("item enriquecido (via enrichPendingReview) muestra el score global y 4 chips de perfil", () => {
    render(<PendingReviewList items={[buildEnrichedItem()]} />);

    const item = screen.getByText("Cliente A").closest("li")!;
    expect(within(item).getByText("80")).toBeInTheDocument();
    expect(within(item).getAllByText("Respondido")).toHaveLength(3);
    expect(within(item).getAllByText("Pendiente")).toHaveLength(1);
  });

  it("item name-only (sin score/profileScores) no rompe y no muestra chips ni score", () => {
    render(<PendingReviewList items={[{ clientKey: "a", clientName: "Cliente A" }]} />);

    const item = screen.getByText("Cliente A").closest("li")!;
    expect(within(item).queryByText("Respondido")).not.toBeInTheDocument();
    expect(within(item).queryByText("Pendiente")).not.toBeInTheDocument();
  });
});
