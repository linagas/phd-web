import { NextApiRequest, NextApiResponse } from "next";
import { AdminInterpretationRulesController } from "@/controllers/quality-pulse/admin-interpretation-rules-controller";
import { InterpretationRulesService } from "@/services/quality-pulse/interpretation-rules-service";
import { verifySessionToken } from "@/utils/quality-pulse/admin-session";

jest.mock("@/services/quality-pulse/interpretation-rules-service", () => ({
  ...jest.requireActual("@/services/quality-pulse/interpretation-rules-service"),
  InterpretationRulesService: jest.fn(),
}));
jest.mock("@/utils/quality-pulse/admin-session", () => ({
  SESSION_COOKIE_NAME: "qp_admin_session",
  verifySessionToken: jest.fn(),
}));

const MockedService = InterpretationRulesService as jest.MockedClass<
  typeof InterpretationRulesService
>;
const mockedVerify = verifySessionToken as jest.MockedFunction<typeof verifySessionToken>;

const VALID_BODY = {
  scoreRules: [{ id: "R1", minScore: 0, maxScore: 24, interpretation: "A" }],
  signalRules: [
    { id: "S1", minPain: 3, minBrecha: 0, minFortaleza: 0, condition: "", reading: "B", order: 1 },
  ],
};

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = {
    method: "PUT",
    body: VALID_BODY,
    cookies: { qp_admin_session: "token" },
    ...overrides,
  } as unknown as NextApiRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return { req, res };
}

describe("AdminInterpretationRulesController", () => {
  let controller: AdminInterpretationRulesController;
  let replaceRules: jest.Mock;
  let getRules: jest.Mock;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    replaceRules = jest.fn().mockResolvedValue(undefined);
    getRules = jest.fn().mockResolvedValue(VALID_BODY);
    MockedService.mockImplementation(
      () => ({ replaceRules, getRules }) as unknown as InterpretationRulesService
    );
    mockedVerify.mockResolvedValue({ email: "admin@phd.cl" } as never);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    controller = new AdminInterpretationRulesController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    errorSpy.mockRestore();
  });

  it("PUT replaces rules and answers 200 with counts", async () => {
    const { req, res } = createMockReqRes();
    await controller.replaceRules(req, res);
    expect(replaceRules).toHaveBeenCalledWith(VALID_BODY);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ scoreRules: 1, signalRules: 1 });
  });

  it("PUT answers 405 for other methods", async () => {
    const { req, res } = createMockReqRes({ method: "POST" });
    await controller.replaceRules(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(replaceRules).not.toHaveBeenCalled();
  });

  it("PUT answers 401 without a session", async () => {
    const { req, res } = createMockReqRes({ cookies: {} });
    await controller.replaceRules(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(replaceRules).not.toHaveBeenCalled();
  });

  it("PUT answers 400 on invalid body", async () => {
    const { req, res } = createMockReqRes({ body: { scoreRules: [], signalRules: [] } });
    await controller.replaceRules(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(replaceRules).not.toHaveBeenCalled();
  });

  it("PUT answers 500 on unexpected errors", async () => {
    replaceRules.mockRejectedValue(new Error("boom"));
    const { req, res } = createMockReqRes();
    await controller.replaceRules(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("GET returns current rules", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });
    await controller.getRules(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(VALID_BODY);
  });

  it("GET answers 500 on errors", async () => {
    getRules.mockRejectedValue(new Error("boom"));
    const { req, res } = createMockReqRes({ method: "GET" });
    await controller.getRules(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
