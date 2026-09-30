import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { QUALITY_PULSE_PROFILES } from "@/models/quality-pulse/catalog-question-model";

const REQUIRED_PROFILE_COUNT = QUALITY_PULSE_PROFILES.length;

export class ClientNotFoundError extends Error {
  constructor(clientKey: string) {
    super(`El cliente "${clientKey}" no existe.`);
    this.name = "ClientNotFoundError";
  }
}

export class NotEligibleError extends Error {
  constructor(clientKey: string) {
    super(`El cliente "${clientKey}" no tiene los 4 perfiles respondidos (4/4).`);
    this.name = "NotEligibleError";
  }
}

export interface PublicationResult {
  isPublished: boolean;
}

/**
 * Publica/despublica clientes (D3, D4). Solo permite publicar clientes 4/4;
 * unpublish siempre está permitido sobre un cliente existente. `publishedBy`
 * es el email del admin autenticado (sin modelo de roles).
 */
export class PublicationService {
  constructor(
    private clientRepository: ClientRepository = new ClientRepository(),
    private assessmentRepository: AssessmentRepository = new AssessmentRepository()
  ) {}

  async publish(clientKey: string, publishedBy: string): Promise<PublicationResult> {
    const client = await this.clientRepository.findByKey(clientKey);
    if (!client) {
      throw new ClientNotFoundError(clientKey);
    }

    const submissions = await this.assessmentRepository.findByClientKey(clientKey);
    const answeredProfiles = new Set(submissions.map((submission) => submission.profile));
    if (answeredProfiles.size < REQUIRED_PROFILE_COUNT) {
      throw new NotEligibleError(clientKey);
    }

    await this.clientRepository.setPublished(clientKey, publishedBy, new Date());
    return { isPublished: true };
  }

  async unpublish(clientKey: string): Promise<PublicationResult> {
    const client = await this.clientRepository.findByKey(clientKey);
    if (!client) {
      throw new ClientNotFoundError(clientKey);
    }

    await this.clientRepository.setUnpublished(clientKey);
    return { isPublished: false };
  }
}
