import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { QualityPulseClient, QualityPulseClientModel } from "@/models/quality-pulse/client-model";
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
  private repository: ClientRepository;

  constructor() {
    this.repository = new ClientRepository();
  }

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
}
