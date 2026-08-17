import { MongoServerError } from "mongodb";
import { connectToDatabase } from "@/utils/database";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

const DUPLICATE_KEY_ERROR_CODE = 11000;

export class ClientRepository {
  private collectionName = "qualityPulseClients";

  private async getCollection() {
    const { db } = await connectToDatabase();
    const collection = db.collection<QualityPulseClient>(this.collectionName);
    await collection.createIndex({ clientKey: 1 }, { unique: true, name: "clientKey_unique" });
    return collection;
  }

  async findAll(): Promise<QualityPulseClient[]> {
    const collection = await this.getCollection();
    return collection.find({}).sort({ clientName: 1 }).toArray();
  }

  async findByKey(clientKey: string): Promise<QualityPulseClient | null> {
    const collection = await this.getCollection();
    return collection.findOne({ clientKey });
  }

  /**
   * Devuelve `false` en vez de lanzar cuando ya existe un cliente con ese
   * clientKey, replicando el patrón "INSERT OR IGNORE" usado en AssessmentRepository.save.
   */
  async create(client: QualityPulseClient): Promise<boolean> {
    const collection = await this.getCollection();
    try {
      await collection.insertOne(client);
      return true;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR_CODE) {
        return false;
      }
      throw error;
    }
  }
}
