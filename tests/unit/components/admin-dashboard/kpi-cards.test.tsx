/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import KpiCards from "@/app/administracion/(console)/components/kpi-cards";
import { DashboardKpis } from "@/utils/quality-pulse/dashboard-metrics";

function buildKpis(overrides: Partial<DashboardKpis> = {}): DashboardKpis {
  return {
    registeredClients: 2,
    submissions: 4,
    expectedSubmissions: 8,
    completionPct: 50,
    pendingReview: 1,
    ...overrides,
  };
}

describe("KpiCards", () => {
  it("muestra los KPIs con datos", () => {
    render(<KpiCards kpis={buildKpis()} globalHealthScore={72} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("4/8")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("zero-state: todos los KPIs en 0 no lanza error y el score global muestra Sin datos", () => {
    const zeroKpis = buildKpis({
      registeredClients: 0,
      submissions: 0,
      expectedSubmissions: 0,
      completionPct: 0,
      pendingReview: 0,
    });

    render(<KpiCards kpis={zeroKpis} globalHealthScore={null} />);

    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("el KPI 'Pendientes de revisión' usa el acento phd-pink", () => {
    render(<KpiCards kpis={buildKpis()} globalHealthScore={72} />);

    const pendingCard = screen.getByTestId("kpi-pending-review");
    expect(pendingCard.className).toContain("phd-pink");
  });

  it("iconos y barras de progreso son decorativos (aria-hidden) y no duplican valores como texto", () => {
    const { container } = render(<KpiCards kpis={buildKpis()} globalHealthScore={72} />);

    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(5);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
    expect(screen.getAllByText("72")).toHaveLength(1);
    expect(screen.getAllByText("1")).toHaveLength(1);
  });

  it("la barra de progreso refleja el porcentaje de completitud", () => {
    const { container } = render(<KpiCards kpis={buildKpis({ completionPct: 50 })} globalHealthScore={null} />);

    const bars = Array.from(container.querySelectorAll<HTMLElement>("[style]")).map((el) => el.style.width);
    expect(bars).toContain("50%");
  });
});
