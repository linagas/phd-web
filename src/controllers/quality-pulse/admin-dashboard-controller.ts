import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "@/services/quality-pulse/dashboard-service";
import { requireAdminSession } from "@/utils/quality-pulse/require-admin-session";

export class AdminDashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  async getSummary(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const summary = await this.service.getSummary();
      res.status(200).json(summary);
    } catch (error) {
      console.error("[AdminDashboardController] getSummary error:", error);
      res.status(500).json({ error: "Error al obtener el resumen del dashboard." });
    }
  }
}
