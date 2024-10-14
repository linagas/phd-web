import { MessageController } from "@/controllers/messageController";

const messageController = new MessageController();

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return messageController.saveMessage(req, res);
  }

  return res.status(405).json({ message: "Método no permitido" });
}
