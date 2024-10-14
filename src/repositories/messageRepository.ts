import { connectToDatabase } from "../utils/database";
import { Message } from "@/models/messageModel";

export class MessageRepository {
  private collectionName = "contact_messages";

  async save(message: Message): Promise<void> {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(this.collectionName);

    await collection.insertOne(message);
  }

  async getAll(): Promise<Message[]> {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(this.collectionName);

    const documents = await collection.find({}).toArray();
    return documents.map(
      (doc) =>
        ({
          name: doc.name,
          email: doc.email,
          message: doc.message,
          createdAt: doc.createdAt,
        } as Message)
    );
  }
}
