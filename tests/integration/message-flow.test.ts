/**
 * Test de integración: flujo Controller → Service → Repository
 * con mocks solo en la capa de BD y reCAPTCHA (dependencias externas).
 */
import { MessageController } from "@/controllers/message-controller";
import { NextApiRequest, NextApiResponse } from "next";

// Mock solo de las dependencias externas
jest.mock("@/utils/database", () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              _id: "1",
              name: "Integration",
              email: "int@test.com",
              message: "Test msg",
              createdAt: new Date("2024-01-01"),
            },
          ]),
        }),
      }),
    },
  }),
}));

jest.mock("@/utils/recaptcha", () => ({
  verifyRecaptcha: jest.fn().mockResolvedValue(true),
}));

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

describe("Integration: MessageController → Service → Repository", () => {
  let controller: MessageController;

  beforeEach(() => {
    controller = new MessageController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe guardar un mensaje atravesando todas las capas", async () => {
    const { req, res } = createMockReqRes({
      body: {
        name: "Integration",
        email: "int@test.com",
        message: "Test msg",
        recaptchaToken: "valid",
      },
    });

    await controller.saveMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Mensaje guardado correctamente",
    });
  });

  it("debe obtener mensajes atravesando todas las capas", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });

    await controller.getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall).toHaveLength(1);
    expect(jsonCall[0]).toMatchObject({
      name: "Integration",
      email: "int@test.com",
      message: "Test msg",
    });
  });
});
