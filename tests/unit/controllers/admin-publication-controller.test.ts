import { NextApiRequest, NextApiResponse } from "next";
import { AdminPublicationController } from "@/controllers/quality-pulse/admin-publication-controller";
import {
  PublicationService,
  ClientNotFoundError,
  NotEligibleError,
} from "@/services/quality-pulse/publication-service";
import {
  requireAdminSession,
  getAdminEmail,
} from "@/utils/quality-pulse/require-admin-session";

jest.mock("@/services/quality-pulse/publication-service");
jest.mock("@/utils/quality-pulse/require-admin-session", () => ({
  requireAdminSession: jest.fn(),
  getAdminEmail: jest.fn(),
}));

const MockedService = PublicationService as jest.MockedClass<typeof PublicationService>;
const mockedRequireAdminSession = requireAdminSession as jest.MockedFunction<
  typeof requireAdminSession
>;
const mockedGetAdminEmail = getAdminEmail as jest.MockedFunction<typeof getAdminEmail>;

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = { method: "POST", body: {}, ...overrides } as NextApiRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return { req, res };
}

describe("AdminPublicationController", () => {
  let controller: AdminPublicationController;
  let mockPublish: jest.Mock;
  let mockUnpublish: jest.Mock;

  beforeEach(() => {
    mockPublish = jest.fn();
    mockUnpublish = jest.fn();
    MockedService.mockImplementation(
      () => ({ publish: mockPublish, unpublish: mockUnpublish }) as unknown as PublicationService
    );
    mockedGetAdminEmail.mockResolvedValue("admin@phd.cl");
    controller = new AdminPublicationController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("publish", () => {
    it("responde 401 sin sesión admin válida, y no llama al service", async () => {
      mockedRequireAdminSession.mockImplementation(async (_req, res) => {
        res.status(401).json({ error: "No autenticado." });
        return false;
      });
      const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

      await controller.publish(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it("responde 400 cuando falta clientKey en el body", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      const { req, res } = createMockReqRes({ body: {} });

      await controller.publish(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it("responde 404 cuando el cliente no existe (ClientNotFoundError)", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      mockPublish.mockRejectedValue(new ClientNotFoundError("inexistente"));
      const { req, res } = createMockReqRes({ body: { clientKey: "inexistente" } });

      await controller.publish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("responde 409 cuando el cliente no está 4/4 (NotEligibleError)", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      mockPublish.mockRejectedValue(new NotEligibleError("acme"));
      const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

      await controller.publish(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("responde 200 y publica usando el email del admin autenticado como publishedBy", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      mockedGetAdminEmail.mockResolvedValue("admin@phd.cl");
      mockPublish.mockResolvedValue({ isPublished: true });
      const { req, res } = createMockReqRes({ body: { clientKey: "acme" } });

      await controller.publish(req, res);

      expect(mockPublish).toHaveBeenCalledWith("acme", "admin@phd.cl");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isPublished: true });
    });

    it("responde 405 cuando el método no es POST", async () => {
      const { req, res } = createMockReqRes({ method: "GET" });

      await controller.publish(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(mockedRequireAdminSession).not.toHaveBeenCalled();
    });
  });

  describe("unpublish", () => {
    it("responde 401 sin sesión admin válida, y no llama al service", async () => {
      mockedRequireAdminSession.mockImplementation(async (_req, res) => {
        res.status(401).json({ error: "No autenticado." });
        return false;
      });
      const { req, res } = createMockReqRes({ method: "DELETE", body: { clientKey: "acme" } });

      await controller.unpublish(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockUnpublish).not.toHaveBeenCalled();
    });

    it("responde 404 cuando el cliente no existe (ClientNotFoundError)", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      mockUnpublish.mockRejectedValue(new ClientNotFoundError("inexistente"));
      const { req, res } = createMockReqRes({
        method: "DELETE",
        body: { clientKey: "inexistente" },
      });

      await controller.unpublish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("responde 200 y despublica sin requerir 4/4 (siempre permitido)", async () => {
      mockedRequireAdminSession.mockResolvedValue(true);
      mockUnpublish.mockResolvedValue({ isPublished: false });
      const { req, res } = createMockReqRes({ method: "DELETE", body: { clientKey: "acme" } });

      await controller.unpublish(req, res);

      expect(mockUnpublish).toHaveBeenCalledWith("acme");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isPublished: false });
    });

    it("responde 405 cuando el método no es DELETE", async () => {
      const { req, res } = createMockReqRes({ method: "POST" });

      await controller.unpublish(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(mockedRequireAdminSession).not.toHaveBeenCalled();
    });
  });
});
