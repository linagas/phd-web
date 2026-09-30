/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("cliente=Acme"),
}));

import ResultsView from "@/app/quality-pulse/resultados/components/results-view";

const ALL_ANSWERED = ["Calidad", "Desarrollo", "Gestión", "Negocio"];

function mockAssessmentsResponse(
  status: {
    answeredProfiles: string[];
    isPublished: boolean;
    submissions: unknown[] | null;
  },
  catalog: unknown[] = []
) {
  const mockFetch = jest.fn((url: string) => {
    if (url.includes("/clients")) {
      return Promise.resolve({ ok: true, json: async () => ({ exists: true }) });
    }
    if (url.includes("/assessments")) {
      return Promise.resolve({ ok: true, json: async () => status });
    }
    if (url.includes("/catalog")) {
      return Promise.resolve({ ok: true, json: async () => catalog });
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`));
  });
  global.fetch = mockFetch as unknown as typeof fetch;
  return mockFetch;
}

describe("ResultsView — DTO PublicAssessmentStatus y estado 'Resultados en revisión'", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("muestra 'Resultados en revisión' cuando 4/4 perfiles respondieron pero no está publicado (submissions=null)", async () => {
    mockAssessmentsResponse({
      answeredProfiles: ALL_ANSWERED,
      isPublished: false,
      submissions: null,
    });

    render(<ResultsView />);

    await waitFor(() =>
      expect(screen.getByText(/Resultados en revisión/i)).toBeInTheDocument()
    );
  });

  it("no lanza al recibir el DTO gateado (sin .map sobre un array crudo)", async () => {
    mockAssessmentsResponse({
      answeredProfiles: ["Calidad"],
      isPublished: false,
      submissions: null,
    });

    render(<ResultsView />);

    await waitFor(() => expect(screen.getByText(/Diagnóstico incompleto/i)).toBeInTheDocument());
  });

  it("muestra resultados completos cuando el cliente está publicado (submissions no nulo)", async () => {
    mockAssessmentsResponse(
      {
        answeredProfiles: ALL_ANSWERED,
        isPublished: true,
        submissions: [],
      },
      [{ id: "q1", options: [] }]
    );

    render(<ResultsView />);

    await waitFor(() =>
      expect(screen.getByText(/Quality Health Score/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Resultados en revisión/i)).not.toBeInTheDocument();
  });
});
