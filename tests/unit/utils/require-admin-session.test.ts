import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminSession, getAdminEmail } from "@/utils/quality-pulse/require-admin-session";

jest.mock("@/utils/quality-pulse/admin-session", () => ({
  SESSION_COOKIE_NAME: "qp_admin_session",
  verifySessionToken: jest.fn(),
}));

import { verifySessionToken } from "@/utils/quality-pulse/admin-session";

const mockedVerifySessionToken = verifySessionToken as jest.MockedFunction<
  typeof verifySessionToken
>;

function createMockReqRes(cookies: Record<string, string> = {}) {
  const req = { cookies } as unknown as NextApiRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return { req, res };
}

describe("requireAdminSession", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responde 401 'No autenticado.' cuando no hay cookie de sesión", async () => {
    const { req, res } = createMockReqRes({});

    const result = await requireAdminSession(req, res);

    expect(result).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado." });
    expect(mockedVerifySessionToken).not.toHaveBeenCalled();
  });

  it("responde 401 'Sesión inválida o expirada.' cuando el token no verifica", async () => {
    mockedVerifySessionToken.mockResolvedValue(null);
    const { req, res } = createMockReqRes({ qp_admin_session: "bad-token" });

    const result = await requireAdminSession(req, res);

    expect(result).toBe(false);
    expect(mockedVerifySessionToken).toHaveBeenCalledWith("bad-token");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Sesión inválida o expirada." });
  });

  it("retorna true y no responde nada cuando la sesión es válida", async () => {
    mockedVerifySessionToken.mockResolvedValue({ email: "admin@phd.cl" });
    const { req, res } = createMockReqRes({ qp_admin_session: "good-token" });

    const result = await requireAdminSession(req, res);

    expect(result).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("getAdminEmail", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devuelve el email de la sesión válida", async () => {
    mockedVerifySessionToken.mockResolvedValue({ email: "admin@phd.cl" });
    const { req } = createMockReqRes({ qp_admin_session: "good-token" });

    const email = await getAdminEmail(req);

    expect(email).toBe("admin@phd.cl");
  });

  it("devuelve null cuando no hay cookie de sesión", async () => {
    const { req } = createMockReqRes({});

    const email = await getAdminEmail(req);

    expect(email).toBeNull();
    expect(mockedVerifySessionToken).not.toHaveBeenCalled();
  });

  it("devuelve null cuando el token no verifica", async () => {
    mockedVerifySessionToken.mockResolvedValue(null);
    const { req } = createMockReqRes({ qp_admin_session: "bad-token" });

    const email = await getAdminEmail(req);

    expect(email).toBeNull();
  });
});
