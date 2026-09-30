import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { QualityPulseClient, QualityPulseClientModel } from "@/models/quality-pulse/client-model";
import { ClientNotFoundError } from "@/services/quality-pulse/publication-service";
import { toClientKey } from "@/utils/quality-pulse/client-key";

export class ClientAlreadyExistsError extends Error {
  constructor(clientName: string) {
    super(`Ya existe un cliente registrado como "${clientName}".`);
    this.name = "ClientAlreadyExistsError";
  }
}

export class EmptyClientNameError extends Error {
  constructor() {
    super("El nombre del cliente no puede estar vacío.");
    this.name = "EmptyClientNameError";
  }
}

export class ClientService {
  constructor(private repository: ClientRepository = new ClientRepository()) {}

  async listClients(): Promise<QualityPulseClient[]> {
    return this.repository.findAll();
  }

  async findByName(clientName: string): Promise<QualityPulseClient | null> {
    const clientKey = toClientKey(clientName);
    return this.repository.findByKey(clientKey);
  }

  async register(clientName: string, registeredBy: string): Promise<QualityPulseClient> {
    const trimmedName = clientName.trim();
    if (trimmedName === "") {
      throw new EmptyClientNameError();
    }

    const clientKey = toClientKey(trimmedName);
    const client = QualityPulseClientModel.create(clientKey, trimmedName, registeredBy);

    const created = await this.repository.create(client);
    if (!created) {
      throw new ClientAlreadyExistsError(trimmedName);
    }

    return client;
  }

  /** Soft-deletes an active client; throws ClientNotFoundError if missing or already deleted. */
  async softDelete(clientKey: string, deletedBy: string): Promise<void> {
    const client = await this.repository.findByKey(clientKey);
    if (!client) {
      throw new ClientNotFoundError(clientKey);
    }

    const deleted = await this.repository.softDelete(clientKey, deletedBy, new Date());
    if (!deleted) {
      throw new ClientNotFoundError(clientKey);
    }
  }

  async listDeleted(): Promise<QualityPulseClient[]> {
    return this.repository.findDeleted();
  }

  /** Restores a soft-deleted client; throws ClientNotFoundError if it is not currently deleted. */
  async restore(clientKey: string): Promise<void> {
    const restored = await this.repository.restore(clientKey);
    if (!restored) {
      throw new ClientNotFoundError(clientKey);
    }
  }
}
