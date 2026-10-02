import { InterpretationRulesRepository } from "@/repositories/quality-pulse/interpretation-rules-repository";
import { InterpretationRules } from "@/models/quality-pulse/interpretation-rules-model";

jest.mock("@/utils/database", () => ({
  connectToDatabase: jest.fn(),
}));

import { connectToDatabase } from "@/utils/database";

const mockConnect = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

const RULES: InterpretationRules = {
  scoreRules: [{ id: "R1", minScore: 0, maxScore: 24, interpretation: "A" }],
  signalRules: [
    { id: "S1", minPain: 3, minBrecha: 0, minFortaleza: 0, condition: "", reading: "B", order: 1 },
  ],
};

describe("InterpretationRulesRepository", () => {
  const deleteMany = jest.fn();
  const insertMany = jest.fn();
  const toArray = jest.fn();
  const sort = jest.fn();
  const find = jest.fn();
  const collection = jest.fn();

  beforeEach(() => {
    deleteMany.mockResolvedValue({});
    insertMany.mockResolvedValue({});
    sort.mockReturnValue({ toArray });
    find.mockReturnValue({ sort, toArray });
    collection.mockReturnValue({ deleteMany, insertMany, find });
    mockConnect.mockResolvedValue({ db: { collection } } as never);
  });

  afterEach(() => jest.clearAllMocks());

  it("replaceAll deletes everything then inserts a single document", async () => {
    await new InterpretationRulesRepository().replaceAll(RULES);

    expect(collection).toHaveBeenCalledWith("qualityPulseInterpretationRules");
    expect(deleteMany).toHaveBeenCalledWith({});
    expect(insertMany).toHaveBeenCalledTimes(1);
    expect(deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      insertMany.mock.invocationCallOrder[0]
    );
    const inserted = insertMany.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(inserted).toHaveLength(2);
    expect(inserted.map((d) => d.kind)).toEqual(["score", "signal"]);
  });

  it("get rebuilds the rules from stored documents, signal rules by order", async () => {
    toArray.mockResolvedValue([
      { kind: "score", id: "R1", minScore: 0, maxScore: 24, interpretation: "A", _id: "x" },
      { kind: "signal", id: "S2", minPain: 1, minBrecha: 3, minFortaleza: 0, condition: "", reading: "C", order: 2 },
      { kind: "signal", id: "S1", minPain: 3, minBrecha: 0, minFortaleza: 0, condition: "", reading: "B", order: 1 },
    ]);

    const result = await new InterpretationRulesRepository().get();

    expect(result.scoreRules).toEqual(RULES.scoreRules);
    expect(result.signalRules.map((r) => r.id)).toEqual(["S1", "S2"]);
  });
});
