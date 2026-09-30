import { NextApiRequest, NextApiResponse } from "next";
import { AdminCatalogController } from "@/controllers/quality-pulse/admin-catalog-controller";

const controller = new AdminCatalogController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    return controller.importCatalog(req, res);
  }
  if (req.method === "PATCH") {
    return controller.updateQuestion(req, res);
  }
  return controller.getCatalog(req, res);
}
