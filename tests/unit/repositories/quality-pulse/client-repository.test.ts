import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

jest.mock("@/utils/database", () => ({
  connectToDatabase: jest.fn(),
}));

import { connectToDatabase } from "@/utils/database";

const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

describe("ClientRepository — normalización de lectura (D5)", () => {
  let repository: ClientRepository;
  let mockFindOne: jest.Mock;
  let mockToArray: jest.Mock;
  let mockSort: jest.Mock;
  let mockFind: jest.Mock;
  let mockCreateIndex: jest.Mock;
  let mockCollection: jest.Mock;

  let mockUpdateOne: jest.Mock;

  beforeEach(() => {
    repository = new ClientRepository();
    mockFindOne = jest.fn();
    mockToArray = jest.fn();
    mockSort = jest.fn().mockReturnValue({ toArray: mockToArray });
    mockFind = jest.fn().mockReturnValue({ sort: mockSort });
    mockCreateIndex = jest.fn().mockResolvedValue(undefined);
    mockUpdateOne = jest.fn().mockResolvedValue({ acknowledged: true });
    mockCollection = jest.fn().mockReturnValue({
      findOne: mockFindOne,
      find: mockFind,
      createIndex: mockCreateIndex,
      updateOne: mockUpdateOne,
    });

    mockConnectToDatabase.mockResolvedValue({
      db: { collection: mockCollection },
    } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByKey", () => {
    it("normaliza isPublished a false cuando el documento no tiene el campo (migración fail-closed)", async () => {
      const rawDoc = {
        clientKey: "acme",
        clientName: "Acme",
        registeredBy: "admin@phd.cl",
        createdAt: new Date(),
      } as QualityPulseClient;
      mockFindOne.mockResolvedValue(rawDoc);

      const result = await repository.findByKey("acme");

      expect(result?.isPublished).toBe(false);
    });

    it("conserva isPublished en true cuando el documento lo tiene explícitamente en true", async () => {
      const rawDoc = {
        clientKey: "acme",
        clientName: "Acme",
        registeredBy: "admin@phd.cl",
        createdAt: new Date(),
        isPublished: true,
        publishedBy: "admin@phd.cl",
        publishedAt: new Date(),
      } as QualityPulseClient;
      mockFindOne.mockResolvedValue(rawDoc);

      const result = await repository.findByKey("acme");

      expect(result?.isPublished).toBe(true);
    });

    it("normaliza a false valores truthy que no son estrictamente true (fail-closed)", async () => {
      const rawDoc = {
        clientKey: "acme",
        clientName: "Acme",
        registeredBy: "admin@phd.cl",
        createdAt: new Date(),
        isPublished: "true" as unknown as boolean,
      } as QualityPulseClient;
      mockFindOne.mockResolvedValue(rawDoc);

      const result = await repository.findByKey("acme");

      expect(result?.isPublished).toBe(false);
    });

    it("retorna null cuando el cliente no existe", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByKey("inexistente");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("normaliza isPublished en cada documento devuelto", async () => {
      mockToArray.mockResolvedValue([
        {
          clientKey: "acme",
          clientName: "Acme",
          registeredBy: "admin@phd.cl",
          createdAt: new Date(),
        },
        {
          clientKey: "beta",
          clientName: "Beta",
          registeredBy: "admin@phd.cl",
          createdAt: new Date(),
          isPublished: true,
        },
      ]);

      const results = await repository.findAll();

      expect(results.map((client) => client.isPublished)).toEqual([false, true]);
    });
  });

  describe("setPublished", () => {
    it("actualiza isPublished, publishedBy y publishedAt del cliente indicado", async () => {
      const publishedAt = new Date("2026-09-28T12:00:00.000Z");

      await repository.setPublished("acme", "admin@phd.cl", publishedAt);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { clientKey: "acme" },
        { $set: { isPublished: true, publishedBy: "admin@phd.cl", publishedAt } }
      );
    });
  });

  describe("setUnpublished", () => {
    it("pone isPublished en false y remueve publishedBy/publishedAt del cliente indicado", async () => {
      await repository.setUnpublished("acme");

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { clientKey: "acme" },
        { $set: { isPublished: false }, $unset: { publishedBy: "", publishedAt: "" } }
      );
    });
  });
  describe("soft delete", () => {
    it("findAll excluye clientes con deletedAt", async () => {
      mockToArray.mockResolvedValue([]);

      await repository.findAll();

      expect(mockFind).toHaveBeenCalledWith({ deletedAt: { $exists: false } });
    });

    it("findByKey excluye clientes con deletedAt", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByKey("acme");

      expect(mockFindOne).toHaveBeenCalledWith({ clientKey: "acme", deletedAt: { $exists: false } });
      expect(result).toBeNull();
    });

    it("softDelete marca deletedAt/deletedBy, despublica y limpia la auditoría de publicación", async () => {
      const deletedAt = new Date("2026-09-30T10:00:00.000Z");

      await repository.softDelete("acme", "admin@phd.cl", deletedAt);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { clientKey: "acme", deletedAt: { $exists: false } },
        {
          $set: { deletedAt, deletedBy: "admin@phd.cl", isPublished: false },
          $unset: { publishedBy: "", publishedAt: "" },
        }
      );
    });

    it("softDelete devuelve true si modificó un documento y false si no existía o ya estaba eliminado", async () => {
      mockUpdateOne.mockResolvedValueOnce({ matchedCount: 1 });
      await expect(repository.softDelete("acme", "a@phd.cl", new Date())).resolves.toBe(true);

      mockUpdateOne.mockResolvedValueOnce({ matchedCount: 0 });
      await expect(repository.softDelete("acme", "a@phd.cl", new Date())).resolves.toBe(false);
    });

    it("findDeletedKeys devuelve los clientKey de los clientes eliminados", async () => {
      mockToArray.mockResolvedValue([{ clientKey: "gone-a" }, { clientKey: "gone-b" }]);
      const mockProject = jest.fn().mockReturnValue({ toArray: mockToArray });
      mockFind.mockReturnValue({ project: mockProject });

      const keys = await repository.findDeletedKeys();

      expect(mockFind).toHaveBeenCalledWith({ deletedAt: { $exists: true } });
      expect(keys).toEqual(["gone-a", "gone-b"]);
    });
  });

  describe("restore", () => {
    it("restore quita deletedAt/deletedBy solo de clientes eliminados", async () => {
      mockUpdateOne.mockResolvedValueOnce({ matchedCount: 1 });

      const restored = await repository.restore("acme");

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { clientKey: "acme", deletedAt: { $exists: true } },
        { $unset: { deletedAt: "", deletedBy: "" } }
      );
      expect(restored).toBe(true);
    });

    it("restore devuelve false si no hay un cliente eliminado con esa key", async () => {
      mockUpdateOne.mockResolvedValueOnce({ matchedCount: 0 });

      await expect(repository.restore("acme")).resolves.toBe(false);
    });

    it("findDeleted devuelve los clientes eliminados ordenados por nombre", async () => {
      const deleted = [{ clientKey: "a", clientName: "A", deletedAt: new Date() }];
      mockToArray.mockResolvedValue(deleted);

      const result = await repository.findDeleted();

      expect(mockFind).toHaveBeenCalledWith({ deletedAt: { $exists: true } });
      expect(mockSort).toHaveBeenCalledWith({ clientName: 1 });
      expect(result).toHaveLength(1);
      expect(result[0].isPublished).toBe(false);
    });
  });
});
