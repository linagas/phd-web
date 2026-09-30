import { NextApiRequest, NextApiResponse } from "next";
import { AssessmentController } from "@/controllers/quality-pulse/assessment-controller";
import { AssessmentService } from "@/services/quality-pulse/assessment-service";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

jest.mock("@/services/quality-pulse/assessment-service");
jest.mock("@/utils/quality-pulse/admin-session", () => ({
  SESSION_COOKIE_NAME: "qp_admin_session",
  verifySessionToken: jest.fn(),
}));

const MockedService = AssessmentService as jest.MockedClass<typeof AssessmentService>;
const mockedVerifySessionToken = verifySessionToken as jest.MockedFunction<
  typeof verifySessionToken
>;

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = { method: "GET", query: {}, cookies: {}, ...overrides } as NextApiRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return { req, res };
}

describe("AssessmentController — gate público (getStatus)", () => {
  let controller: AssessmentController;
  let mockGetPublicStatus: jest.Mock;
  let mockGetAllAssessments: jest.Mock;

  beforeEach(() => {
    mockGetPublicStatus = jest.fn();
    mockGetAllAssessments = jest.fn();
    MockedService.mockImplementation(
      () =>
        ({
          getPublicStatus: mockGetPublicStatus,
          getAllAssessments: mockGetAllAssessments,
        }) as unknown as AssessmentService
    );
    controller = new AssessmentController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("con 'organization', responde 200 con el DTO gateado (submissions=null si no está publicado) — el gate se cumple incluso llamando directo al endpoint", async () => {
    const gatedStatus = {
      answeredProfiles: ["Calidad", "Desarrollo", "Gestión", "Negocio"],
      isPublished: false,
      submissions: null,
    };
    mockGetPublicStatus.mockResolvedValue(gatedStatus);
    const { req, res } = createMockReqRes({ query: { organization: "Acme" } });

    await controller.getStatus(req, res);

    expect(mockGetPublicStatus).toHaveBeenCalledWith("Acme");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(gatedStatus);
    const jsonPayload = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonPayload.submissions).toBeNull();
  });

  it("con 'organization' y cliente publicado, responde 200 con submissions completas", async () => {
    const gatedStatus = {
      answeredProfiles: ["Calidad", "Desarrollo", "Gestión", "Negocio"],
      isPublished: true,
      submissions: [{ clientKey: "acme", profile: "Calidad" }],
    };
    mockGetPublicStatus.mockResolvedValue(gatedStatus);
    const { req, res } = createMockReqRes({ query: { organization: "Acme" } });

    await controller.getStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(gatedStatus);
  });

  it("sin 'organization' y sin sesión admin, responde 403 y no llama al service (comportamiento previo intacto)", async () => {
    const { req, res } = createMockReqRes({ query: {}, cookies: {} });

    await controller.getStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockGetAllAssessments).not.toHaveBeenCalled();
    expect(mockGetPublicStatus).not.toHaveBeenCalled();
  });

  it("sin 'organization' y con sesión admin válida, responde 200 con todas las assessments (comportamiento previo intacto)", async () => {
    mockedVerifySessionToken.mockResolvedValue({ email: "admin@phd.cl" });
    mockGetAllAssessments.mockResolvedValue([{ clientKey: "acme" }]);
    const { req, res } = createMockReqRes({
      query: {},
      cookies: { [SESSION_COOKIE_NAME]: "good-token" },
    });

    await controller.getStatus(req, res);

    expect(mockGetAllAssessments).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
