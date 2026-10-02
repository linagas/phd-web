import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import {
  InterpretationRulesService,
  interpretationRulesSchema,
} from "@/services/quality-pulse/interpretation-rules-service";
import { requireAdminSession } from "@/utils/quality-pulse/require-admin-session";

export class AdminInterpretationRulesController {
  private service: InterpretationRulesService;

  constructor() {
    this.service = new InterpretationRulesService();
  }

  async getRules(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const rules = await this.service.getRules();
      res.status(200).json(rules);
    } catch (error) {
      console.error("[AdminInterpretationRulesController] getRules error:", error);
      res.status(500).json({ error: "Error al obtener las reglas de interpretación." });
    }
  }

  async replaceRules(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const rules = interpretationRulesSchema.parse(req.body);
      await this.service.replaceRules(rules);
      res.status(200).json({
        scoreRules: rules.scoreRules.length,
        signalRules: rules.signalRules.length,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("[AdminInterpretationRulesController] replaceRules error:", error);
      res.status(500).json({ error: "Error al guardar las reglas de interpretación." });
    }
  }
}
