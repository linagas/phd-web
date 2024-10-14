import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);

  cachedClient = await client.connect();
  return cachedClient;
}
