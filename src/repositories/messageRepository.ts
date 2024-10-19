import { connectToDatabase } from "@/utils/database";
import { Message } from "@/models/messageModel";

export class MessageRepository {
  private collectionName = "messages";

  async save(message: Message): Promise<void> {
    // Obtener cliente y base de datos a través de la conexión
    const { db } = await connectToDatabase();

    // Acceder a la colección y guardar el mensaje
    const collection = db.collection(this.collectionName);
    await collection.insertOne(message);
  }

  async getAll(): Promise<Message[]> {
    const { db } = await connectToDatabase();
    const collection = db.collection(this.collectionName);
    console.time("before insertMessage");
    const results = await collection.find({}).toArray();
    console.timeEnd("After insertMessage");
    return results.map(
      (result) =>
        ({
          name: result.name,
          email: result.email,
          message: result.message,
          createdAt: result.createdAt,
        } as Message)
    );
  }
}
