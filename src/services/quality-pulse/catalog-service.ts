import { z } from "zod";
import {
  CatalogRepository,
  ImportQuestionsResult,
} from "@/repositories/quality-pulse/catalog-repository";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
} from "@/models/quality-pulse/catalog-question-model";

export const catalogQuestionSchema = z.object({
  id: z.string().min(1, "El id de la pregunta es obligatorio"),
  dimension: z.string(),
  dimensionId: z.string(),
  capability: z.string(),
  capabilityId: z.string(),
  perspective: z.string(),
  text: z.string().min(1, "El texto de la pregunta es obligatorio"),
  order: z.number(),
  required: z.boolean(),
  status: z.string(),
  objective: z.string(),
  type: z.string(),
  origins: z.array(z.string()),
  profiles: z
    .array(z.enum(QUALITY_PULSE_PROFILES))
    .min(1, "La pregunta debe tener al menos un perfil"),
  options: z
    .array(
      z.object({
        label: z.string(),
        score: z.number(),
        variable: z.string(),
        signal: z.string(),
        signalType: z.string(),
        priority: z.string(),
        impact: z.string(),
        outcomes: z.record(z.number()),
      })
    )
    .min(2, "La pregunta debe tener al menos 2 opciones"),
});

export const importCatalogSchema = z.object({
  questions: z.array(catalogQuestionSchema),
});

export class CatalogService {
  private repository: CatalogRepository;

  constructor() {
    this.repository = new CatalogRepository();
  }

  async getCatalog(): Promise<CatalogQuestion[]> {
    return this.repository.getAll();
  }

  async importQuestions(questions: CatalogQuestion[]): Promise<ImportQuestionsResult> {
    return this.repository.addQuestions(questions);
  }

  async updateQuestion(question: CatalogQuestion): Promise<void> {
    return this.repository.updateQuestion(question);
  }
}
