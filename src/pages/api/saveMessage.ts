import { MessageController } from "@/controllers/messageController";

const messageController = new MessageController();

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const response = await messageController.saveMessage(req, res);

      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error("Error en la API:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  } else {
    // Si no es POST, enviar un error 405
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
