import { MongoServerError } from "mongodb";
import { connectToDatabase } from "@/utils/database";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

const DUPLICATE_KEY_ERROR_CODE = 11000;
const NOT_DELETED_FILTER = { deletedAt: { $exists: false } } as const;

/**
 * Normaliza `isPublished` en lectura (D5): cualquier documento sin el campo
 * (clientes existentes antes de esta migración) o con un valor que no es
 * estrictamente `true` se trata como no publicado. Fail-closed: no hay script
 * de escritura, así que todo cliente preexistente —incluidos los 4/4— queda
 * oculto hasta que un admin lo publique explícitamente.
 */
function normalizePublicationState(doc: QualityPulseClient): QualityPulseClient {
  return { ...doc, isPublished: doc.isPublished === true };
}

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
    const docs = await collection.find(NOT_DELETED_FILTER).sort({ clientName: 1 }).toArray();
    return docs.map(normalizePublicationState);
  }

  async findByKey(clientKey: string): Promise<QualityPulseClient | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ clientKey, ...NOT_DELETED_FILTER });
    return doc ? normalizePublicationState(doc) : null;
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

  /** Marca el cliente como publicado y registra la auditoría (D3). */
  async setPublished(clientKey: string, publishedBy: string, publishedAt: Date): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { clientKey },
      { $set: { isPublished: true, publishedBy, publishedAt } }
    );
  }

  /**
   * Despublica el cliente y limpia los campos de auditoría. Usado tanto por
   * publish/unpublish explícito como por el auto-unpublish en reset (D8).
   */
  async setUnpublished(clientKey: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { clientKey },
      { $set: { isPublished: false }, $unset: { publishedBy: "", publishedAt: "" } }
    );
  }

  /**
   * Soft delete: marks the client as deleted and unpublishes it. Nothing is
   * removed (submissions stay untouched). Returns `false` when no active
   * client matched (missing or already deleted).
   */
  async softDelete(clientKey: string, deletedBy: string, deletedAt: Date): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { clientKey, ...NOT_DELETED_FILTER },
      {
        $set: { deletedAt, deletedBy, isPublished: false },
        $unset: { publishedBy: "", publishedAt: "" },
      }
    );
    return result.matchedCount > 0;
  }

  /** Soft-deleted clients, sorted by name. */
  async findDeleted(): Promise<QualityPulseClient[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({ deletedAt: { $exists: true } })
      .sort({ clientName: 1 })
      .toArray();
    return docs.map(normalizePublicationState);
  }

  /**
   * Restores a soft-deleted client. It stays unpublished (softDelete already
   * unpublished it). Returns `false` when no deleted client matched.
   */
  async restore(clientKey: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { clientKey, deletedAt: { $exists: true } },
      { $unset: { deletedAt: "", deletedBy: "" } }
    );
    return result.matchedCount > 0;
  }

  /** Keys of soft-deleted clients, used to hide their orphaned submissions. */
  async findDeletedKeys(): Promise<string[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({ deletedAt: { $exists: true } })
      .project<{ clientKey: string }>({ clientKey: 1, _id: 0 })
      .toArray();
    return docs.map((doc) => doc.clientKey);
  }
}
