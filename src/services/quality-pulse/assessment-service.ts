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

const REQUIRED_PROFILE_COUNT = QUALITY_PULSE_PROFILES.length;

/**
 * DTO público del estado de un assessment (D4). `answeredProfiles` siempre
 * es público (el flujo del cuestionario lo necesita para saber qué perfiles
 * ya respondieron); `submissions` solo se expone cuando el gate deja pasar:
 * cliente publicado Y 4/4 perfiles respondidos. `isPublished` es el estado
 * EFECTIVO (flag guardado && 4/4), no el flag crudo — así una publicación
 * obsoleta tras un reset parcial nunca queda expuesta como publicada.
 */
export interface PublicAssessmentStatus {
  answeredProfiles: QualityPulseProfile[];
  isPublished: boolean;
  submissions: QualityPulseAssessment[] | null;
}

export class AssessmentService {
  constructor(
    private repository: AssessmentRepository = new AssessmentRepository(),
    private clientRepository: ClientRepository = new ClientRepository()
  ) {}

  /**
   * Único punto de lectura pública por cliente (D4). Nunca devuelve
   * `submissions` si el gate no se cumple: no existe otro camino de código
   * que sirva respuestas crudas sin pasar por acá.
   */
  async getPublicStatus(clientName: string): Promise<PublicAssessmentStatus> {
    const clientKey = toClientKey(clientName);
    const [client, submissions] = await Promise.all([
      this.clientRepository.findByKey(clientKey),
      this.repository.findByClientKey(clientKey),
    ]);

    const answeredProfiles = submissions.map((submission) => submission.profile);
    const isPublished =
      client?.isPublished === true && answeredProfiles.length === REQUIRED_PROFILE_COUNT;

    return {
      answeredProfiles,
      isPublished,
      submissions: isPublished ? submissions : null,
    };
  }

  async getAllAssessments(): Promise<QualityPulseAssessment[]> {
    const [submissions, deletedKeys] = await Promise.all([
      this.repository.findAll(),
      this.clientRepository.findDeletedKeys(),
    ]);
    // Soft-deleted clients keep their submissions; hide them from admin lists.
    const hidden = new Set(deletedKeys);
    return submissions.filter((submission) => !hidden.has(submission.clientKey));
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

  /**
   * Auto-unpublica ANTES de borrar (D8): si el borrado falla, el cliente
   * igual queda despublicado (fail-closed). No importa cuál perfil se
   * resetee ni cuántos queden respondidos — cualquier reset invalida la
   * publicación vigente.
   */
  async resetProfile(clientKey: string, profile: QualityPulseProfile): Promise<number> {
    await this.clientRepository.setUnpublished(clientKey);
    return this.repository.deleteByProfile(clientKey, profile);
  }

  async resetClient(clientKey: string): Promise<number> {
    await this.clientRepository.setUnpublished(clientKey);
    return this.repository.deleteByClient(clientKey);
  }
}
