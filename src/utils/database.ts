import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  // Accedemos a la base de datos especificada en las variables de entorno
  const db = cachedClient.db(process.env.MONGODB_DB);
  cachedDb = db;

  return { client: cachedClient, db: cachedDb };
}
