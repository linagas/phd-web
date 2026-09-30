import {
  PublicationService,
  ClientNotFoundError,
  NotEligibleError,
} from "@/services/quality-pulse/publication-service";
import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseProfile } from "@/models/quality-pulse/catalog-question-model";

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

function buildSubmission(profile: QualityPulseProfile): QualityPulseAssessment {
  return {
    clientKey: "acme",
    clientName: "Acme",
    profile,
    answers: { Q1: 2 },
    questionCount: 1,
    submittedAt: new Date(),
  };
}

function buildFakeClientRepository(overrides: Partial<ClientRepository> = {}): ClientRepository {
  return {
    findByKey: jest.fn().mockResolvedValue(buildClient()),
    setPublished: jest.fn().mockResolvedValue(undefined),
    setUnpublished: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ClientRepository;
}

function buildFakeAssessmentRepository(
  submissions: QualityPulseAssessment[]
): AssessmentRepository {
  return {
    findByClientKey: jest.fn().mockResolvedValue(submissions),
  } as unknown as AssessmentRepository;
}

describe("PublicationService", () => {
  describe("publish", () => {
    it("publica un cliente 4/4 y registra publishedBy/publishedAt (auditoría)", async () => {
      const clientRepository = buildFakeClientRepository();
      const assessmentRepository = buildFakeAssessmentRepository([
        buildSubmission("Calidad"),
        buildSubmission("Desarrollo"),
        buildSubmission("Gestión"),
        buildSubmission("Negocio"),
      ]);
      const service = new PublicationService(clientRepository, assessmentRepository);

      const result = await service.publish("acme", "admin@phd.cl");

      expect(result.isPublished).toBe(true);
      expect(clientRepository.setPublished).toHaveBeenCalledWith(
        "acme",
        "admin@phd.cl",
        expect.any(Date)
      );
    });

    it("rechaza publicar un cliente con menos de 4/4 perfiles respondidos (NotEligibleError)", async () => {
      const clientRepository = buildFakeClientRepository();
      const assessmentRepository = buildFakeAssessmentRepository([
        buildSubmission("Calidad"),
        buildSubmission("Desarrollo"),
      ]);
      const service = new PublicationService(clientRepository, assessmentRepository);

      await expect(service.publish("acme", "admin@phd.cl")).rejects.toThrow(NotEligibleError);
      expect(clientRepository.setPublished).not.toHaveBeenCalled();
    });

    it("rechaza publicar un cliente inexistente (ClientNotFoundError)", async () => {
      const clientRepository = buildFakeClientRepository({
        findByKey: jest.fn().mockResolvedValue(null),
      });
      const assessmentRepository = buildFakeAssessmentRepository([]);
      const service = new PublicationService(clientRepository, assessmentRepository);

      await expect(service.publish("inexistente", "admin@phd.cl")).rejects.toThrow(
        ClientNotFoundError
      );
      expect(clientRepository.setPublished).not.toHaveBeenCalled();
    });
  });

  describe("unpublish", () => {
    it("despublica un cliente existente", async () => {
      const clientRepository = buildFakeClientRepository({
        findByKey: jest.fn().mockResolvedValue(buildClient({ isPublished: true })),
      });
      const assessmentRepository = buildFakeAssessmentRepository([]);
      const service = new PublicationService(clientRepository, assessmentRepository);

      const result = await service.unpublish("acme");

      expect(result.isPublished).toBe(false);
      expect(clientRepository.setUnpublished).toHaveBeenCalledWith("acme");
    });

    it("rechaza despublicar un cliente inexistente (ClientNotFoundError)", async () => {
      const clientRepository = buildFakeClientRepository({
        findByKey: jest.fn().mockResolvedValue(null),
      });
      const assessmentRepository = buildFakeAssessmentRepository([]);
      const service = new PublicationService(clientRepository, assessmentRepository);

      await expect(service.unpublish("inexistente")).rejects.toThrow(ClientNotFoundError);
      expect(clientRepository.setUnpublished).not.toHaveBeenCalled();
    });
  });

  describe("clientes eliminados (soft delete)", () => {
    it("publish lanza ClientNotFoundError cuando findByKey no encuentra el cliente eliminado", async () => {
      const clientRepository = buildFakeClientRepository({
        findByKey: jest.fn().mockResolvedValue(null),
      });
      const service = new PublicationService(clientRepository, buildFakeAssessmentRepository([]));

      await expect(service.publish("gone", "admin@phd.cl")).rejects.toBeInstanceOf(
        ClientNotFoundError
      );
      expect(clientRepository.setPublished).not.toHaveBeenCalled();
    });
  });
});
