import { ClientService } from "@/services/quality-pulse/client-service";
import { ClientNotFoundError } from "@/services/quality-pulse/publication-service";
import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

function buildClient(overrides: Partial<QualityPulseClient> = {}): QualityPulseClient {
  return {
    clientKey: "acme",
    clientName: "Acme",
    registeredBy: "admin@phd.cl",
    createdAt: new Date(),
    isPublished: false,
    ...overrides,
  };
}

function buildService(repo: Partial<Record<keyof ClientRepository, jest.Mock>>): ClientService {
  return new ClientService(repo as unknown as ClientRepository);
}

describe("ClientService.softDelete", () => {
  it("marca el cliente como eliminado con el email del admin y una fecha", async () => {
    const softDelete = jest.fn().mockResolvedValue(true);
    const service = buildService({
      findByKey: jest.fn().mockResolvedValue(buildClient()),
      softDelete,
    });

    await service.softDelete("acme", "admin@phd.cl");

    expect(softDelete).toHaveBeenCalledWith("acme", "admin@phd.cl", expect.any(Date));
  });

  it("lanza ClientNotFoundError si el cliente no existe o ya fue eliminado", async () => {
    const softDelete = jest.fn();
    const service = buildService({
      findByKey: jest.fn().mockResolvedValue(null),
      softDelete,
    });

    await expect(service.softDelete("acme", "admin@phd.cl")).rejects.toBeInstanceOf(
      ClientNotFoundError
    );
    expect(softDelete).not.toHaveBeenCalled();
  });

  it("lanza ClientNotFoundError si el repositorio no modificó ningún documento (carrera)", async () => {
    const service = buildService({
      findByKey: jest.fn().mockResolvedValue(buildClient()),
      softDelete: jest.fn().mockResolvedValue(false),
    });

    await expect(service.softDelete("acme", "admin@phd.cl")).rejects.toBeInstanceOf(
      ClientNotFoundError
    );
  });
});

describe("ClientService.restore / listDeleted", () => {
  it("restore delega al repositorio", async () => {
    const restore = jest.fn().mockResolvedValue(true);
    const service = buildService({ restore });

    await service.restore("acme");

    expect(restore).toHaveBeenCalledWith("acme");
  });

  it("restore lanza ClientNotFoundError si el cliente no está eliminado", async () => {
    const service = buildService({ restore: jest.fn().mockResolvedValue(false) });

    await expect(service.restore("acme")).rejects.toBeInstanceOf(ClientNotFoundError);
  });

  it("listDeleted devuelve los clientes eliminados del repositorio", async () => {
    const deleted = [buildClient({ deletedAt: new Date() })];
    const service = buildService({ findDeleted: jest.fn().mockResolvedValue(deleted) });

    await expect(service.listDeleted()).resolves.toEqual(deleted);
  });
});
