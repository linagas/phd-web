/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import QualityPulseView from "@/app/quality-pulse/components/quality-pulse-view";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams("cliente=Acme"),
}));

describe("QualityPulseView — consumo del DTO PublicAssessmentStatus", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("marca los perfiles respondidos usando `answeredProfiles` del DTO gateado, sin depender de `submissions`", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/clients")) {
        return Promise.resolve({ ok: true, json: async () => ({ exists: true }) });
      }
      if (url.includes("/assessments")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            answeredProfiles: ["Calidad"],
            isPublished: false,
            submissions: null,
          }),
        });
      }
      if (url.includes("/catalog")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });

    render(<QualityPulseView />);

    await waitFor(() => {
      const calidadCard = screen.getByRole("button", { name: /Calidad/ });
      expect(calidadCard).toBeDisabled();
    });

    expect(screen.getByText("Respondido")).toBeInTheDocument();
    const desarrolloCard = screen.getByRole("button", { name: /Desarrollo/ });
    expect(desarrolloCard).not.toBeDisabled();
  });
});
