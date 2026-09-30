import { NextApiRequest, NextApiResponse } from "next";
import { AssessmentController } from "@/controllers/quality-pulse/assessment-controller";

const controller = new AssessmentController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return controller.getStatus(req, res);
  }
  return controller.saveAssessment(req, res);
}
