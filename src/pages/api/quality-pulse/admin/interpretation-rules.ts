import { NextApiRequest, NextApiResponse } from "next";
import { AdminInterpretationRulesController } from "@/controllers/quality-pulse/admin-interpretation-rules-controller";

const controller = new AdminInterpretationRulesController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    return controller.replaceRules(req, res);
  }
  return controller.getRules(req, res);
}
