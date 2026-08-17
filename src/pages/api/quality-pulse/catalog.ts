import { NextApiRequest, NextApiResponse } from "next";
import { CatalogController } from "@/controllers/quality-pulse/catalog-controller";

const controller = new CatalogController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.getCatalog(req, res);
}
