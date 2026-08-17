import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import {
  QualityPulseAssessment,
  QualityPulseAssessmentModel,
} from "@/models/quality-pulse/assessment-model";
import {
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { toClientKey } from "@/utils/quality-pulse/client-key";

export class AlreadySubmittedError extends Error {
  constructor(clientKey: string, profile: QualityPulseProfile) {
    super(`El perfil "${profile}" ya respondió el assessment para "${clientKey}".`);
    this.name = "AlreadySubmittedError";
  }
}

export class ClientNotRegisteredError extends Error {
  constructor(clientName: string) {
    super(`"${clientName}" no es un cliente registrado.`);
    this.name = "ClientNotRegisteredError";
  }
}

export class InvalidProfileError extends Error {
  constructor(profile: string) {
    super(`Perfil inválido: "${profile}".`);
    this.name = "InvalidProfileError";
  }
}

export class EmptyAnswersError extends Error {
  constructor() {
    super("Las respuestas no pueden estar vacías.");
    this.name = "EmptyAnswersError";
  }
}

function isValidProfile(profile: string): profile is QualityPulseProfile {
  return (QUALITY_PULSE_PROFILES as readonly string[]).includes(profile);
}

export class AssessmentService {
  private repository: AssessmentRepository;
  private clientRepository: ClientRepository;

  constructor() {
    this.repository = new AssessmentRepository();
    this.clientRepository = new ClientRepository();
  }

  async getStatusForClient(clientName: string): Promise<QualityPulseAssessment[]> {
    const clientKey = toClientKey(clientName);
    return this.repository.findByClientKey(clientKey);
  }

  async getAllAssessments(): Promise<QualityPulseAssessment[]> {
    return this.repository.findAll();
  }

  async saveAnswers(
    clientName: string,
    profile: string,
    answers: Record<string, number>
  ): Promise<QualityPulseAssessment> {
    if (!isValidProfile(profile)) {
      throw new InvalidProfileError(profile);
    }

    if (Object.keys(answers).length === 0) {
      throw new EmptyAnswersError();
    }

    const clientKey = toClientKey(clientName);
    const client = await this.clientRepository.findByKey(clientKey);
    if (!client) {
      throw new ClientNotRegisteredError(clientName);
    }

    const assessment = QualityPulseAssessmentModel.create(
      clientKey,
      clientName,
      profile,
      answers
    );

    const saved = await this.repository.save(assessment);
    if (!saved) {
      throw new AlreadySubmittedError(clientKey, profile);
    }

    return assessment;
  }

  async resetProfile(clientKey: string, profile: QualityPulseProfile): Promise<number> {
    return this.repository.deleteByProfile(clientKey, profile);
  }

  async resetClient(clientKey: string): Promise<number> {
    return this.repository.deleteByClient(clientKey);
  }
}
