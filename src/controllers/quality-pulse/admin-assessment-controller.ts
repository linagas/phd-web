import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { AssessmentService } from "@/services/quality-pulse/assessment-service";
import { QUALITY_PULSE_PROFILES } from "@/models/quality-pulse/catalog-question-model";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

const resetAssessmentSchema = z.object({
  clientKey: z.string().min(1, "clientKey es obligatorio"),
  profile: z.enum(QUALITY_PULSE_PROFILES).optional(),
  resetAll: z.boolean().optional(),
});

async function requireAdminSession(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "No autenticado." });
    return false;
  }

  const session = await verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: "Sesión inválida o expirada." });
    return false;
  }

  return true;
}

export class AdminAssessmentController {
  private service: AssessmentService;

  constructor() {
    this.service = new AssessmentService();
  }

  async resetAssessment(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const { clientKey, profile, resetAll } = resetAssessmentSchema.parse(req.body);

      if (resetAll) {
        const deletedCount = await this.service.resetClient(clientKey);
        res.status(200).json({ deletedCount });
        return;
      }

      if (!profile) {
        res.status(400).json({ error: "Se requiere 'profile' o 'resetAll'." });
        return;
      }

      const deletedCount = await this.service.resetProfile(clientKey, profile);
      res.status(200).json({ deletedCount });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("[AdminAssessmentController] resetAssessment error:", error);
      res.status(500).json({ error: "Error al reiniciar el assessment." });
    }
  }
}
