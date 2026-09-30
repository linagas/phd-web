import { NextApiRequest, NextApiResponse } from "next";
import { ClientController } from "@/controllers/quality-pulse/client-controller";
import { ClientService } from "@/services/quality-pulse/client-service";
import { ClientNotFoundError } from "@/services/quality-pulse/publication-service";
import { verifySessionToken } from "@/utils/quality-pulse/admin-session";

jest.mock("@/services/quality-pulse/client-service", () => ({
  ...jest.requireActual("@/services/quality-pulse/client-service"),
  ClientService: jest.fn(),
}));
jest.mock("@/utils/quality-pulse/admin-session", () => ({
  SESSION_COOKIE_NAME: "qp_admin_session",
  verifySessionToken: jest.fn(),
}));

const MockedService = ClientService as jest.MockedClass<typeof ClientService>;
const mockedVerify = verifySessionToken as jest.MockedFunction<typeof verifySessionToken>;

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = {
    method: "DELETE",
    body: {},
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

describe("ClientController.remove", () => {
  let controller: ClientController;
  let mockSoftDelete: jest.Mock;
  let mockRestore: jest.Mock;
  let mockListDeleted: jest.Mock;

  beforeEach(() => {
    mockSoftDelete = jest.fn();
    mockRestore = jest.fn();
    mockListDeleted = jest.fn();
    MockedService.mockImplementation(
      () =>
        ({
          softDelete: mockSoftDelete,
          restore: mockRestore,
          listDeleted: mockListDeleted,
        }) as unknown as ClientService
    );
    mockedVerify.mockResolvedValue({ email: "admin@phd.cl" } as never);
    controller = new ClientController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responde 405 cuando el método no es DELETE", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockSoftDelete).not.toHaveBeenCalled();
  });

  it("responde 401 sin cookie de sesión y no llama al service", async () => {
    const { req, res } = createMockReqRes({ cookies: {} });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockSoftDelete).not.toHaveBeenCalled();
  });

  it("responde 400 cuando falta clientKey", async () => {
    const { req, res } = createMockReqRes({ body: {} });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockSoftDelete).not.toHaveBeenCalled();
  });

  it("responde 404 cuando el cliente no existe o ya fue eliminado", async () => {
    mockSoftDelete.mockRejectedValue(new ClientNotFoundError("acme"));
    const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("responde 200 y elimina usando el email del admin como deletedBy", async () => {
    mockSoftDelete.mockResolvedValue(undefined);
    const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

    await controller.remove(req, res);

    expect(mockSoftDelete).toHaveBeenCalledWith("acme", "admin@phd.cl");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ deleted: true });
  });

  it("responde 500 con mensaje genérico ante errores inesperados", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockSoftDelete.mockRejectedValue(new Error("db down"));
    const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al eliminar el cliente." });
    spy.mockRestore();
  });
});

describe("ClientController.restore", () => {
  let controller: ClientController;
  let mockRestore: jest.Mock;

  beforeEach(() => {
    mockRestore = jest.fn();
    MockedService.mockImplementation(() => ({ restore: mockRestore }) as unknown as ClientService);
    mockedVerify.mockResolvedValue({ email: "admin@phd.cl" } as never);
    controller = new ClientController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responde 405 cuando el método no es POST", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });
    await controller.restore(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("responde 401 sin sesión y no llama al service", async () => {
    const { req, res } = createMockReqRes({ method: "POST", cookies: {} });
    await controller.restore(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockRestore).not.toHaveBeenCalled();
  });

  it("responde 400 cuando falta clientKey", async () => {
    const { req, res } = createMockReqRes({ method: "POST", body: {} });
    await controller.restore(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRestore).not.toHaveBeenCalled();
  });

  it("responde 404 cuando el cliente no está eliminado", async () => {
    mockRestore.mockRejectedValue(new ClientNotFoundError("acme"));
    const { req, res } = createMockReqRes({ method: "POST", body: { clientKey: "acme" } });
    await controller.restore(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("responde 200 {restored:true} al restaurar", async () => {
    mockRestore.mockResolvedValue(undefined);
    const { req, res } = createMockReqRes({ method: "POST", body: { clientKey: "acme" } });
    await controller.restore(req, res);
    expect(mockRestore).toHaveBeenCalledWith("acme");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ restored: true });
  });
});

describe("ClientController.listDeleted", () => {
  let controller: ClientController;
  let mockListDeleted: jest.Mock;

  beforeEach(() => {
    mockListDeleted = jest.fn();
    MockedService.mockImplementation(
      () => ({ listDeleted: mockListDeleted }) as unknown as ClientService
    );
    mockedVerify.mockResolvedValue({ email: "admin@phd.cl" } as never);
    controller = new ClientController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responde 405 cuando el método no es GET", async () => {
    const { req, res } = createMockReqRes({ method: "POST" });
    await controller.listDeleted(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("responde 401 sin sesión", async () => {
    const { req, res } = createMockReqRes({ method: "GET", cookies: {} });
    await controller.listDeleted(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockListDeleted).not.toHaveBeenCalled();
  });

  it("responde 200 con la lista de eliminados", async () => {
    mockListDeleted.mockResolvedValue([{ clientKey: "acme" }]);
    const { req, res } = createMockReqRes({ method: "GET" });
    await controller.listDeleted(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ clientKey: "acme" }]);
  });
});
