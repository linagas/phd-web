/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import RecentActivity from "@/app/administracion/(console)/components/recent-activity";
import { RecentActivityEvent } from "@/utils/quality-pulse/recent-activity";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function buildEvent(overrides: Partial<RecentActivityEvent> = {}): RecentActivityEvent {
  return {
    type: "PUBLICADO",
    clientKey: "a",
    clientName: "Cliente A",
    actor: "boss@phd.cl",
    occurredAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

describe("RecentActivity", () => {
  it("renders the title and an empty state when there are no events", () => {
    render(<RecentActivity events={[]} now={NOW} />);

    expect(screen.getByRole("heading", { name: "Actividad Reciente" })).toBeInTheDocument();
    expect(screen.getByText("Todavía no hay actividad reciente.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders one item per event with badge, relative time, bold client name and detail", () => {
    render(<RecentActivity events={[buildEvent()]} now={NOW} />);

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("PUBLICADO")).toBeInTheDocument();
    expect(within(item).getByText("hace 2 horas")).toBeInTheDocument();
    expect(within(item).getByText("Cliente A").tagName).toBe("STRONG");
    expect(item).toHaveTextContent("Resultados publicados para Cliente A");
    expect(within(item).getByText("Publicado por: boss@phd.cl")).toBeInTheDocument();
  });

  it("renders events in the given order", () => {
    render(
      <RecentActivity
        events={[
          buildEvent({ type: "RESPONDIDO", profile: "Calidad", actor: undefined }),
          buildEvent({ type: "ELIMINADO", clientName: "Gone" }),
        ]}
        now={NOW}
      />
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Evaluación Calidad completada en Cliente A");
    expect(items[1]).toHaveTextContent("Cliente eliminado: Gone");
  });
});
