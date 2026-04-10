import { MessageRepository } from "@/repositories/messageRepository";
import { Message } from "@/models/messageModel";

// Mock de la conexión a BD
jest.mock("@/utils/database", () => ({
  connectToDatabase: jest.fn(),
}));

import { connectToDatabase } from "@/utils/database";

const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

describe("MessageRepository", () => {
  let repository: MessageRepository;
  let mockInsertOne: jest.Mock;
  let mockFind: jest.Mock;
  let mockToArray: jest.Mock;
  let mockCollection: jest.Mock;

  beforeEach(() => {
    repository = new MessageRepository();
    mockInsertOne = jest.fn().mockResolvedValue({ acknowledged: true });
    mockToArray = jest.fn();
    mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    mockCollection = jest.fn().mockReturnValue({
      insertOne: mockInsertOne,
      find: mockFind,
    });

    mockConnectToDatabase.mockResolvedValue({
      db: { collection: mockCollection },
    } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("debe insertar un mensaje en la colección 'messages'", async () => {
      const message: Message = {
        name: "Test",
        email: "test@test.com",
        message: "Hola",
        createdAt: new Date(),
      };

      await repository.save(message);

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(mockCollection).toHaveBeenCalledWith("messages");
      expect(mockInsertOne).toHaveBeenCalledWith(message);
    });
  });

  describe("getAll", () => {
    it("debe retornar todos los mensajes mapeados", async () => {
      const now = new Date();
      mockToArray.mockResolvedValue([
        { _id: "abc", name: "Ana", email: "ana@test.com", message: "Hi", createdAt: now },
      ]);

      const results = await repository.getAll();

      expect(mockCollection).toHaveBeenCalledWith("messages");
      expect(mockFind).toHaveBeenCalledWith({});
      expect(results).toEqual([
        { name: "Ana", email: "ana@test.com", message: "Hi", createdAt: now },
      ]);
    });

    it("debe retornar array vacío si no hay mensajes", async () => {
      mockToArray.mockResolvedValue([]);

      const results = await repository.getAll();

      expect(results).toEqual([]);
    });
  });
});
