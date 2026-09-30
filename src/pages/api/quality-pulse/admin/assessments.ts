import { NextApiRequest, NextApiResponse } from "next";
import { AdminAssessmentController } from "@/controllers/quality-pulse/admin-assessment-controller";

const controller = new AdminAssessmentController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.resetAssessment(req, res);
}
