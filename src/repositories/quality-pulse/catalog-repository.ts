import { connectToDatabase } from "@/utils/database";
import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";

export interface ImportQuestionsResult {
  addedIds: string[];
  skippedIds: string[];
}

export class CatalogRepository {
  private collectionName = "qualityPulseCatalog";

  async getAll(): Promise<CatalogQuestion[]> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CatalogQuestion>(this.collectionName);
    const results = await collection.find({}).sort({ order: 1 }).toArray();
    return results.map(
      (result) =>
        ({
          id: result.id,
          dimension: result.dimension,
          dimensionId: result.dimensionId,
          capability: result.capability,
          capabilityId: result.capabilityId,
          perspective: result.perspective,
          text: result.text,
          order: result.order,
          required: result.required,
          status: result.status,
          objective: result.objective,
          type: result.type,
          origins: result.origins,
          profiles: result.profiles,
          options: result.options,
        } as CatalogQuestion)
    );
  }

  async addQuestions(questions: CatalogQuestion[]): Promise<ImportQuestionsResult> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CatalogQuestion>(this.collectionName);

    const incomingIds = questions.map((question) => question.id);
    const existing = await collection
      .find({ id: { $in: incomingIds } })
      .project({ id: 1 })
      .toArray();
    const existingIds = new Set(existing.map((result) => result.id as string));

    const toInsert = questions.filter((question) => !existingIds.has(question.id));
    const skippedIds = questions
      .filter((question) => existingIds.has(question.id))
      .map((question) => question.id);

    if (toInsert.length > 0) {
      await collection.insertMany(toInsert);
    }

    return {
      addedIds: toInsert.map((question) => question.id),
      skippedIds,
    };
  }

  async updateQuestion(question: CatalogQuestion): Promise<void> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CatalogQuestion>(this.collectionName);
    await collection.replaceOne({ id: question.id }, question, { upsert: true });
  }

  async countDistinctIds(): Promise<number> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CatalogQuestion>(this.collectionName);
    const ids = await collection.distinct("id");
    return ids.length;
  }
}
