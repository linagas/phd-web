import { connectToDatabase } from "@/utils/database";
import {
  InterpretationRules,
  ScoreInterpretationRule,
  SignalInterpretationRule,
} from "@/models/quality-pulse/interpretation-rules-model";

type StoredScoreRule = ScoreInterpretationRule & { kind: "score" };
type StoredSignalRule = SignalInterpretationRule & { kind: "signal" };
type StoredRule = StoredScoreRule | StoredSignalRule;

export class InterpretationRulesRepository {
  private collectionName = "qualityPulseInterpretationRules";

  /** Replace-all semantics: re-importing swaps the whole rule set. */
  async replaceAll(rules: InterpretationRules): Promise<void> {
    const { db } = await connectToDatabase();
    const collection = db.collection<StoredRule>(this.collectionName);

    const documents: StoredRule[] = [
      ...rules.scoreRules.map((rule): StoredRule => ({ kind: "score", ...rule })),
      ...rules.signalRules.map((rule): StoredRule => ({ kind: "signal", ...rule })),
    ];

    await collection.deleteMany({});
    if (documents.length > 0) {
      await collection.insertMany(documents);
    }
  }

  async get(): Promise<InterpretationRules> {
    const { db } = await connectToDatabase();
    const collection = db.collection<StoredRule>(this.collectionName);
    const documents = await collection.find({}).toArray();

    const scoreRules: ScoreInterpretationRule[] = [];
    const signalRules: SignalInterpretationRule[] = [];

    documents.forEach((doc) => {
      if (doc.kind === "score") {
        scoreRules.push({
          id: doc.id,
          minScore: doc.minScore,
          maxScore: doc.maxScore,
          interpretation: doc.interpretation,
        });
      } else if (doc.kind === "signal") {
        signalRules.push({
          id: doc.id,
          minPain: doc.minPain,
          minBrecha: doc.minBrecha,
          minFortaleza: doc.minFortaleza,
          condition: doc.condition,
          reading: doc.reading,
          order: doc.order,
        });
      }
    });

    scoreRules.sort((a, b) => a.minScore - b.minScore);
    signalRules.sort((a, b) => a.order - b.order);
    return { scoreRules, signalRules };
  }
}
