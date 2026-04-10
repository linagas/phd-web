import { MessageController } from "@/controllers/message-controller";
import { MessageService } from "@/services/messageService";
import { verifyRecaptcha } from "@/utils/recaptcha";
import { NextApiRequest, NextApiResponse } from "next";

// Mocks
jest.mock("@/services/messageService");
jest.mock("@/utils/recaptcha");

const MockedService = MessageService as jest.MockedClass<typeof MessageService>;
const mockedVerifyRecaptcha = verifyRecaptcha as jest.MockedFunction<typeof verifyRecaptcha>;

function createMockReqRes(overrides: Partial<NextApiRequest> = {}) {
  const req = {
    method: "POST",
    body: {},
    ...overrides,
  } as NextApiRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;

  return { req, res };
}

describe("MessageController", () => {
  let controller: MessageController;
  let mockSaveMessage: jest.Mock;
  let mockGetMessages: jest.Mock;

  beforeEach(() => {
    mockSaveMessage = jest.fn().mockResolvedValue(undefined);
    mockGetMessages = jest.fn().mockResolvedValue([]);

    MockedService.mockImplementation(() => ({
      saveMessage: mockSaveMessage,
      getMessages: mockGetMessages,
    } as unknown as MessageService));

    controller = new MessageController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveMessage", () => {
    it("debe rechazar métodos que no sean POST con 405", async () => {
      const { req, res } = createMockReqRes({ method: "GET" });

      await controller.saveMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: "Método no permitido" });
    });

    it("debe retornar 400 si falta el nombre", async () => {
      const { req, res } = createMockReqRes({
        body: { email: "a@b.com", message: "hi", recaptchaToken: "tok" },
      });

      await controller.saveMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar 400 si el email es inválido", async () => {
      const { req, res } = createMockReqRes({
        body: { name: "Ana", email: "no-email", message: "hi", recaptchaToken: "tok" },
      });

      await controller.saveMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar 400 si reCAPTCHA falla", async () => {
      mockedVerifyRecaptcha.mockResolvedValue(false);

      const { req, res } = createMockReqRes({
        body: { name: "Ana", email: "ana@test.com", message: "Hola", recaptchaToken: "tok" },
      });

      await controller.saveMessage(req, res);

      expect(mockedVerifyRecaptcha).toHaveBeenCalledWith("tok");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Verificación de reCAPTCHA fallida" });
    });

    it("debe guardar mensaje y retornar 200 cuando todo es válido", async () => {
      mockedVerifyRecaptcha.mockResolvedValue(true);

      const { req, res } = createMockReqRes({
        body: { name: "Ana", email: "ana@test.com", message: "Hola", recaptchaToken: "tok" },
      });

      await controller.saveMessage(req, res);

      expect(mockedVerifyRecaptcha).toHaveBeenCalledWith("tok");
      expect(mockSaveMessage).toHaveBeenCalledWith("Ana", "ana@test.com", "Hola");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Mensaje guardado correctamente" });
    });

    it("debe retornar 500 si el servicio lanza error", async () => {
      mockedVerifyRecaptcha.mockResolvedValue(true);
      mockSaveMessage.mockRejectedValue(new Error("DB error"));

      const { req, res } = createMockReqRes({
        body: { name: "Ana", email: "ana@test.com", message: "Hola", recaptchaToken: "tok" },
      });

      await controller.saveMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al guardar el mensaje" });
    });
  });

  describe("getMessages", () => {
    it("debe retornar los mensajes con 200", async () => {
      const msgs = [{ name: "A", email: "a@b.com", message: "x", createdAt: new Date() }];
      mockGetMessages.mockResolvedValue(msgs);

      const { req, res } = createMockReqRes({ method: "GET" });

      await controller.getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(msgs);
    });

    it("debe retornar 500 si falla la obtención de mensajes", async () => {
      mockGetMessages.mockRejectedValue(new Error("DB error"));

      const { req, res } = createMockReqRes({ method: "GET" });

      await controller.getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener los mensajes" });
    });
  });
});
