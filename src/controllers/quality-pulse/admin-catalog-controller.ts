import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import {
  CatalogService,
  catalogQuestionSchema,
  importCatalogSchema,
} from "@/services/quality-pulse/catalog-service";
import { requireAdminSession } from "@/utils/quality-pulse/require-admin-session";

export class AdminCatalogController {
  private service: CatalogService;

  constructor() {
    this.service = new CatalogService();
  }

  async getCatalog(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const questions = await this.service.getCatalog();
      res.status(200).json(questions);
    } catch (error) {
      console.error("[AdminCatalogController] getCatalog error:", error);
      res.status(500).json({ error: "Error al obtener el catálogo de preguntas." });
    }
  }

  async importCatalog(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const { questions } = importCatalogSchema.parse(req.body);
      const result = await this.service.importQuestions(questions);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("[AdminCatalogController] importCatalog error:", error);
      res.status(500).json({ error: "Error al importar el catálogo de preguntas." });
    }
  }

  async updateQuestion(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PATCH") {
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const question = catalogQuestionSchema.parse(req.body);
      await this.service.updateQuestion(question);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("[AdminCatalogController] updateQuestion error:", error);
      res.status(500).json({ error: "Error al actualizar la pregunta." });
    }
  }
}
