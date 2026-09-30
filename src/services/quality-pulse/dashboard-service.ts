import { ClientRepository } from "@/repositories/quality-pulse/client-repository";
import { AssessmentRepository } from "@/repositories/quality-pulse/assessment-repository";
import { CatalogRepository } from "@/repositories/quality-pulse/catalog-repository";
import { DashboardSummary, buildDashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";

/**
 * Orquesta la carga de los 3 repositorios (D9) y delega el cómputo a la
 * función pura `buildDashboardSummary`. DI con defaults (D10): los call
 * sites reales no pasan nada; los tests inyectan fakes.
 */
export class DashboardService {
  constructor(
    private clientRepository: ClientRepository = new ClientRepository(),
    private assessmentRepository: AssessmentRepository = new AssessmentRepository(),
    private catalogRepository: CatalogRepository = new CatalogRepository()
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const [clients, allSubmissions, catalog, deletedKeys] = await Promise.all([
      this.clientRepository.findAll(),
      this.assessmentRepository.findAll(),
      this.catalogRepository.getAll(),
      this.clientRepository.findDeletedKeys(),
    ]);

    // Soft-deleted clients keep their submissions; hide them from metrics.
    const hidden = new Set(deletedKeys);
    const submissions = allSubmissions.filter((submission) => !hidden.has(submission.clientKey));

    return buildDashboardSummary(clients, submissions, catalog);
  }
}
