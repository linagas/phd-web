import { NextApiRequest, NextApiResponse } from "next";
import { MessageController } from "@/controllers/message-controller";

const controller = new MessageController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.handleContactForm(req, res);
}
