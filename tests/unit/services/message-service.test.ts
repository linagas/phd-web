import { MessageService } from "@/services/messageService";
import { MessageRepository } from "@/repositories/messageRepository";

// Mock del repositorio
jest.mock("@/repositories/messageRepository");

const MockedRepository = MessageRepository as jest.MockedClass<typeof MessageRepository>;

describe("MessageService", () => {
  let service: MessageService;
  let mockSave: jest.Mock;
  let mockGetAll: jest.Mock;

  beforeEach(() => {
    mockSave = jest.fn().mockResolvedValue(undefined);
    mockGetAll = jest.fn().mockResolvedValue([]);

    MockedRepository.mockImplementation(() => ({
      save: mockSave,
      getAll: mockGetAll,
    } as unknown as MessageRepository));

    service = new MessageService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveMessage", () => {
    it("debe crear un Message y delegarlo al repositorio", async () => {
      await service.saveMessage("Juan", "juan@test.com", "Hola");

      expect(mockSave).toHaveBeenCalledTimes(1);
      const savedArg = mockSave.mock.calls[0][0];
      expect(savedArg).toMatchObject({
        name: "Juan",
        email: "juan@test.com",
        message: "Hola",
      });
      expect(savedArg.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("getMessages", () => {
    it("debe retornar los mensajes del repositorio", async () => {
      const messages = [
        { name: "Ana", email: "ana@t.com", message: "Hi", createdAt: new Date() },
      ];
      mockGetAll.mockResolvedValue(messages);

      const result = await service.getMessages();

      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(messages);
    });
  });
});
