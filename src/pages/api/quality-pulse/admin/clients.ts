import { NextApiRequest, NextApiResponse } from "next";
import { ClientController } from "@/controllers/quality-pulse/client-controller";

const controller = new ClientController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.register(req, res);
}
