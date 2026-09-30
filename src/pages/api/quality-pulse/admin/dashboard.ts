import { NextApiRequest, NextApiResponse } from "next";
import { AdminDashboardController } from "@/controllers/quality-pulse/admin-dashboard-controller";

const controller = new AdminDashboardController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.getSummary(req, res);
}
