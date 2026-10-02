import {
  InterpretationRulesService,
  interpretationRulesSchema,
} from "@/services/quality-pulse/interpretation-rules-service";
import { InterpretationRulesRepository } from "@/repositories/quality-pulse/interpretation-rules-repository";
import { InterpretationRules } from "@/models/quality-pulse/interpretation-rules-model";

function validRules(): InterpretationRules {
  return {
    scoreRules: [{ id: "R1", minScore: 0, maxScore: 24, interpretation: "A" }],
    signalRules: [
      { id: "S1", minPain: 3, minBrecha: 0, minFortaleza: 0, condition: "", reading: "B", order: 1 },
    ],
  };
}

describe("interpretationRulesSchema", () => {
  it("accepts valid rules", () => {
    expect(interpretationRulesSchema.safeParse(validRules()).success).toBe(true);
  });

  it("rejects empty ids", () => {
    const rules = validRules();
    rules.scoreRules[0].id = "";
    expect(interpretationRulesSchema.safeParse(rules).success).toBe(false);
  });

  it("rejects non finite numbers", () => {
    const rules = validRules();
    rules.signalRules[0].minPain = Number.POSITIVE_INFINITY;
    expect(interpretationRulesSchema.safeParse(rules).success).toBe(false);
  });

  it("rejects minScore greater than maxScore", () => {
    const rules = validRules();
    rules.scoreRules[0].minScore = 50;
    expect(interpretationRulesSchema.safeParse(rules).success).toBe(false);
  });

  it("requires at least one rule in each list", () => {
    expect(
      interpretationRulesSchema.safeParse({ ...validRules(), scoreRules: [] }).success
    ).toBe(false);
    expect(
      interpretationRulesSchema.safeParse({ ...validRules(), signalRules: [] }).success
    ).toBe(false);
  });
});

describe("InterpretationRulesService", () => {
  it("delegates replace and get to the repository", async () => {
    const replaceAll = jest.fn().mockResolvedValue(undefined);
    const get = jest.fn().mockResolvedValue(validRules());
    const service = new InterpretationRulesService({
      replaceAll,
      get,
    } as unknown as InterpretationRulesRepository);

    await service.replaceRules(validRules());
    expect(replaceAll).toHaveBeenCalledWith(validRules());
    await expect(service.getRules()).resolves.toEqual(validRules());
  });
});
