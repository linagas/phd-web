import { AssessmentService, ClientNotRegisteredError } from "@/services/quality-pulse/assessment-service";
import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
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

const ALL_FOUR: QualityPulseProfile[] = ["Calidad", "Desarrollo", "Gestión", "Negocio"];

function buildFakeAssessmentRepository(
  overrides: Partial<AssessmentRepository> = {}
): AssessmentRepository {
  return {
    findByClientKey: jest.fn().mockResolvedValue([]),
    deleteByProfile: jest.fn().mockResolvedValue(1),
    deleteByClient: jest.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as AssessmentRepository;
}

function buildFakeClientRepository(
  overrides: Partial<ClientRepository> = {}
): ClientRepository {
  return {
    findByKey: jest.fn().mockResolvedValue(buildClient()),
    findDeletedKeys: jest.fn().mockResolvedValue([]),
    setUnpublished: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ClientRepository;
}

function buildService(
  assessmentRepository: AssessmentRepository,
  clientRepository: ClientRepository
): AssessmentService {
  return new AssessmentService(assessmentRepository, clientRepository);
}

describe("AssessmentService — gate público (getPublicStatus)", () => {
  it("cliente 4/4 pero NO publicado: expone answeredProfiles pero submissions=null e isPublished=false", async () => {
    const assessmentRepository = buildFakeAssessmentRepository({
      findByClientKey: jest.fn().mockResolvedValue(ALL_FOUR.map(buildSubmission)),
    });
    const clientRepository = buildFakeClientRepository({
      findByKey: jest.fn().mockResolvedValue(buildClient({ isPublished: false })),
    });
    const service = buildService(assessmentRepository, clientRepository);

    const status = await service.getPublicStatus("acme");

    expect(status.answeredProfiles).toEqual(expect.arrayContaining(ALL_FOUR));
    expect(status.answeredProfiles).toHaveLength(4);
    expect(status.isPublished).toBe(false);
    expect(status.submissions).toBeNull();
  });

  it("cliente 4/4 y publicado: devuelve las submissions completas e isPublished=true", async () => {
    const submissions = ALL_FOUR.map(buildSubmission);
    const assessmentRepository = buildFakeAssessmentRepository({
      findByClientKey: jest.fn().mockResolvedValue(submissions),
    });
    const clientRepository = buildFakeClientRepository({
      findByKey: jest.fn().mockResolvedValue(buildClient({ isPublished: true })),
    });
    const service = buildService(assessmentRepository, clientRepository);

    const status = await service.getPublicStatus("acme");

    expect(status.isPublished).toBe(true);
    expect(status.submissions).toEqual(submissions);
  });

  it("cliente publicado (flag true) pero con menos de 4/4 tras un reset: no expone submissions", async () => {
    const assessmentRepository = buildFakeAssessmentRepository({
      findByClientKey: jest.fn().mockResolvedValue([buildSubmission("Calidad")]),
    });
    const clientRepository = buildFakeClientRepository({
      findByKey: jest.fn().mockResolvedValue(buildClient({ isPublished: true })),
    });
    const service = buildService(assessmentRepository, clientRepository);

    const status = await service.getPublicStatus("acme");

    expect(status.isPublished).toBe(false);
    expect(status.submissions).toBeNull();
    expect(status.answeredProfiles).toEqual(["Calidad"]);
  });

  it("cliente inexistente: no expone submissions ni marca publicado", async () => {
    const assessmentRepository = buildFakeAssessmentRepository({
      findByClientKey: jest.fn().mockResolvedValue([]),
    });
    const clientRepository = buildFakeClientRepository({
      findByKey: jest.fn().mockResolvedValue(null),
    });
    const service = buildService(assessmentRepository, clientRepository);

    const status = await service.getPublicStatus("inexistente");

    expect(status.isPublished).toBe(false);
    expect(status.submissions).toBeNull();
    expect(status.answeredProfiles).toEqual([]);
  });
});

describe("AssessmentService — reset auto-unpublica antes de borrar (D8)", () => {
  it("resetProfile llama setUnpublished ANTES de deleteByProfile", async () => {
    const callOrder: string[] = [];
    const assessmentRepository = buildFakeAssessmentRepository({
      deleteByProfile: jest.fn().mockImplementation(async () => {
        callOrder.push("deleteByProfile");
        return 1;
      }),
    });
    const clientRepository = buildFakeClientRepository({
      setUnpublished: jest.fn().mockImplementation(async () => {
        callOrder.push("setUnpublished");
      }),
    });
    const service = buildService(assessmentRepository, clientRepository);

    await service.resetProfile("acme", "Calidad");

    expect(callOrder).toEqual(["setUnpublished", "deleteByProfile"]);
  });

  it("resetClient llama setUnpublished ANTES de deleteByClient", async () => {
    const callOrder: string[] = [];
    const assessmentRepository = buildFakeAssessmentRepository({
      deleteByClient: jest.fn().mockImplementation(async () => {
        callOrder.push("deleteByClient");
        return 4;
      }),
    });
    const clientRepository = buildFakeClientRepository({
      setUnpublished: jest.fn().mockImplementation(async () => {
        callOrder.push("setUnpublished");
      }),
    });
    const service = buildService(assessmentRepository, clientRepository);

    await service.resetClient("acme");

    expect(callOrder).toEqual(["setUnpublished", "deleteByClient"]);
  });
});

describe("AssessmentService — clientes eliminados (soft delete)", () => {
  it("saveAnswers rechaza un cliente eliminado como no registrado y no guarda nada", async () => {
    const save = jest.fn();
    const service = buildService(
      buildFakeAssessmentRepository({ save } as Partial<AssessmentRepository>),
      buildFakeClientRepository({ findByKey: jest.fn().mockResolvedValue(null) })
    );

    await expect(service.saveAnswers("Acme", "Calidad", { Q1: 2 })).rejects.toBeInstanceOf(
      ClientNotRegisteredError
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("getAllAssessments excluye las submissions de clientes eliminados", async () => {
    const service = buildService(
      buildFakeAssessmentRepository({
        findAll: jest.fn().mockResolvedValue([
          buildSubmission("Calidad"),
          { ...buildSubmission("Calidad"), clientKey: "gone", clientName: "Gone" },
        ]),
      } as Partial<AssessmentRepository>),
      buildFakeClientRepository({ findDeletedKeys: jest.fn().mockResolvedValue(["gone"]) })
    );

    const result = await service.getAllAssessments();

    expect(result.map((submission) => submission.clientKey)).toEqual(["acme"]);
  });
});
