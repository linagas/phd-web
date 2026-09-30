import { MongoServerError } from "mongodb";
import { connectToDatabase } from "@/utils/database";
import {
  QualityPulseAssessment,
} from "@/models/quality-pulse/assessment-model";
import { QualityPulseProfile } from "@/models/quality-pulse/catalog-question-model";

const DUPLICATE_KEY_ERROR_CODE = 11000;

export class AssessmentRepository {
  private collectionName = "qualityPulseAssessments";

  private async getCollection() {
    const { db } = await connectToDatabase();
    const collection = db.collection<QualityPulseAssessment>(this.collectionName);
    await collection.createIndex(
      { clientKey: 1, profile: 1 },
      { unique: true, name: "clientKey_profile_unique" }
    );
    return collection;
  }

  async findByClientKey(clientKey: string): Promise<QualityPulseAssessment[]> {
    const collection = await this.getCollection();
    return collection.find({ clientKey }).toArray();
  }

  async findAll(): Promise<QualityPulseAssessment[]> {
    const collection = await this.getCollection();
    return collection.find({}).toArray();
  }

  /**
   * Inserta la respuesta del perfil. Si ya existe una respuesta para
   * (clientKey, profile), atrapa el error de llave duplicada y devuelve
   * `false` en vez de lanzar, replicando el comportamiento "INSERT OR IGNORE"
   * del Quality Pulse original.
   */
  async save(assessment: QualityPulseAssessment): Promise<boolean> {
    const collection = await this.getCollection();
    try {
      await collection.insertOne(assessment);
      return true;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR_CODE) {
        return false;
      }
      throw error;
    }
  }

  async deleteByProfile(clientKey: string, profile: QualityPulseProfile): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({ clientKey, profile });
    return result.deletedCount ?? 0;
  }

  async deleteByClient(clientKey: string): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({ clientKey });
    return result.deletedCount ?? 0;
  }
}
