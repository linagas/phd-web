import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!cachedClient) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      cachedClient = client;
    } catch (err) {
      cachedClient = null;
      cachedDb = null;
      throw err;
    }
  }

  const db = cachedClient.db(process.env.MONGODB_DB);
  cachedDb = db;

  return { client: cachedClient, db: cachedDb };
}
