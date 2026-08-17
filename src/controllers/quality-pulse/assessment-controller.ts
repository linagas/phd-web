import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import {
  AlreadySubmittedError,
  AssessmentService,
  ClientNotRegisteredError,
  EmptyAnswersError,
  InvalidProfileError,
} from "@/services/quality-pulse/assessment-service";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

const saveAssessmentSchema = z.object({
  profile: z.string().min(1, "El perfil es obligatorio"),
  organization: z.string().min(1, "El nombre de la organización es obligatorio"),
  answers: z.record(z.number()),
});

async function hasAdminSession(req: NextApiRequest): Promise<boolean> {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) return false;
  const session = await verifySessionToken(token);
  return session !== null;
}

export class AssessmentController {
  private service: AssessmentService;

  constructor() {
    this.service = new AssessmentService();
  }

  async getStatus(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const organization = req.query.organization;
      const hasOrganization = typeof organization === "string" && organization.trim() !== "";

      if (!hasOrganization) {
        if (!(await hasAdminSession(req))) {
          res.status(403).json({
            error: "El parámetro 'organization' es obligatorio sin sesión de administrador.",
          });
          return;
        }

        const allSubmissions = await this.service.getAllAssessments();
        res.status(200).json(allSubmissions);
        return;
      }

      const submissions = await this.service.getStatusForClient(organization as string);
      res.status(200).json(submissions);
    } catch (error) {
      console.error("[AssessmentController] getStatus error:", error);
      res.status(500).json({ error: "Error al obtener el estado del assessment." });
    }
  }

  async saveAssessment(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const { profile, organization, answers } = saveAssessmentSchema.parse(req.body);

      const assessment = await this.service.saveAnswers(organization, profile, answers);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof AlreadySubmittedError) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error instanceof ClientNotRegisteredError) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof InvalidProfileError || error instanceof EmptyAnswersError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("[AssessmentController] saveAssessment error:", error);
      res.status(500).json({ error: "Error al guardar el assessment." });
    }
  }
}
