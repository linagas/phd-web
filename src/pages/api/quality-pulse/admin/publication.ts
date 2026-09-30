import { NextApiRequest, NextApiResponse } from "next";
import { AdminPublicationController } from "@/controllers/quality-pulse/admin-publication-controller";

const controller = new AdminPublicationController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    return controller.unpublish(req, res);
  }
  return controller.publish(req, res);
}
