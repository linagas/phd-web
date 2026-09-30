import { NextApiRequest, NextApiResponse } from "next";
import { CatalogService } from "@/services/quality-pulse/catalog-service";

export class CatalogController {
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

    try {
      const questions = await this.service.getCatalog();
      res.status(200).json(questions);
    } catch (error) {
      console.error("[CatalogController] getCatalog error:", error);
      res.status(500).json({ error: "Error al obtener el catálogo de preguntas." });
    }
  }
}
