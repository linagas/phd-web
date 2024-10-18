import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    // Usa la conexión y la base de datos en caché si existen
    return { client: cachedClient, db: cachedDb };
  }

  // Si no hay conexión en caché, crea una nueva
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 10, // Tamaño máximo del pool de conexiones
    });
    await cachedClient.connect();
  }

  // Accede a la base de datos
  const db = cachedClient.db();
  cachedDb = db;

  return { client: cachedClient, db: cachedDb };
}
