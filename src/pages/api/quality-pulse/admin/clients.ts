import { NextApiRequest, NextApiResponse } from "next";
import { ClientController } from "@/controllers/quality-pulse/client-controller";

const controller = new ClientController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    return controller.remove(req, res);
  }
  return controller.register(req, res);
}
