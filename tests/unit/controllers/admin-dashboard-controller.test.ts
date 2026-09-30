import { NextApiRequest, NextApiResponse } from "next";
import { AdminDashboardController } from "@/controllers/quality-pulse/admin-dashboard-controller";
import { DashboardService } from "@/services/quality-pulse/dashboard-service";
import { requireAdminSession } from "@/utils/quality-pulse/require-admin-session";

jest.mock("@/services/quality-pulse/dashboard-service");
jest.mock("@/utils/quality-pulse/require-admin-session", () => ({
  requireAdminSession: jest.fn(),
}));

const MockedService = DashboardService as jest.MockedClass<typeof DashboardService>;
const mockedRequireAdminSession = requireAdminSession as jest.MockedFunction<
  typeof requireAdminSession
>;

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = { method: "GET", ...overrides } as NextApiRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return { req, res };
}

describe("AdminDashboardController", () => {
  let controller: AdminDashboardController;
  let mockGetSummary: jest.Mock;

  beforeEach(() => {
    mockGetSummary = jest.fn();
    MockedService.mockImplementation(
      () => ({ getSummary: mockGetSummary } as unknown as DashboardService)
    );
    controller = new AdminDashboardController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responde 401 sin sesión admin válida, y no llama al service", async () => {
    mockedRequireAdminSession.mockImplementation(async (_req, res) => {
      res.status(401).json({ error: "No autenticado." });
      return false;
    });
    const { req, res } = createMockReqRes();

    await controller.getSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockGetSummary).not.toHaveBeenCalled();
  });

  it("responde 200 con el DashboardSummary cuando la sesión es válida", async () => {
    mockedRequireAdminSession.mockResolvedValue(true);
    const summary = {
      kpis: {
        registeredClients: 1,
        submissions: 1,
        expectedSubmissions: 4,
        completionPct: 25,
        pendingReview: 0,
      },
      globalHealthScore: 50,
      clients: [],
      pendingReview: [],
      recentActivity: [],
    };
    mockGetSummary.mockResolvedValue(summary);
    const { req, res } = createMockReqRes();

    await controller.getSummary(req, res);

    expect(mockGetSummary).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(summary);
  });

  it("responde 405 cuando el método no es GET", async () => {
    const { req, res } = createMockReqRes({ method: "POST" });

    await controller.getSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockedRequireAdminSession).not.toHaveBeenCalled();
  });

  it("responde 500 si el service lanza error", async () => {
    mockedRequireAdminSession.mockResolvedValue(true);
    mockGetSummary.mockRejectedValue(new Error("DB error"));
    const { req, res } = createMockReqRes();

    await controller.getSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
