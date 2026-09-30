import { NextApiRequest, NextApiResponse } from "next";
import { AdminAuthController } from "@/controllers/quality-pulse/admin-auth-controller";

const controller = new AdminAuthController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.verify(req, res);
}
