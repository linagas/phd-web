import { z } from "zod";
import { InterpretationRulesRepository } from "@/repositories/quality-pulse/interpretation-rules-repository";
import { InterpretationRules } from "@/models/quality-pulse/interpretation-rules-model";

const scoreRuleSchema = z
  .object({
    id: z.string().trim().min(1, "El id de la regla es obligatorio"),
    minScore: z.number().finite(),
    maxScore: z.number().finite(),
    interpretation: z.string(),
  })
  .refine((rule) => rule.minScore <= rule.maxScore, {
    message: "La condición mínima no puede superar la máxima",
    path: ["minScore"],
  });

const signalRuleSchema = z.object({
  id: z.string().trim().min(1, "El id de la regla es obligatorio"),
  minPain: z.number().finite(),
  minBrecha: z.number().finite(),
  minFortaleza: z.number().finite(),
  condition: z.string(),
  reading: z.string(),
  order: z.number().finite(),
});

export const interpretationRulesSchema = z.object({
  scoreRules: z.array(scoreRuleSchema).min(1, "Se requiere al menos una regla de puntaje"),
  signalRules: z.array(signalRuleSchema).min(1, "Se requiere al menos una regla de señales"),
});

export class InterpretationRulesService {
  constructor(
    private repository: InterpretationRulesRepository = new InterpretationRulesRepository()
  ) {}

  async replaceRules(rules: InterpretationRules): Promise<void> {
    await this.repository.replaceAll(rules);
  }

  async getRules(): Promise<InterpretationRules> {
    return this.repository.get();
  }
}
