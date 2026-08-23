import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return res.status(200).json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[MongoKeepaliveCron] ping error:", error);
    return res.status(500).json({ error: "Ping failed" });
  }
}
