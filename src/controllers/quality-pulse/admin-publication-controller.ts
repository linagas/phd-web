import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import {
  ClientNotFoundError,
  NotEligibleError,
  PublicationService,
} from "@/services/quality-pulse/publication-service";
import { getAdminEmail, requireAdminSession } from "@/utils/quality-pulse/require-admin-session";

const publicationSchema = z.object({
  clientKey: z.string().min(1, "clientKey es obligatorio"),
});

export class AdminPublicationController {
  private service: PublicationService;

  constructor() {
    this.service = new PublicationService();
  }

  async publish(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const { clientKey } = publicationSchema.parse(req.body);
      const email = await getAdminEmail(req);
      if (!email) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const result = await this.service.publish(clientKey, email);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof ClientNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof NotEligibleError) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("[AdminPublicationController] publish error:", error);
      res.status(500).json({ error: "Error al publicar el cliente." });
    }
  }

  async unpublish(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    if (!(await requireAdminSession(req, res))) return;

    try {
      const { clientKey } = publicationSchema.parse(req.body);
      const result = await this.service.unpublish(clientKey);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof ClientNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("[AdminPublicationController] unpublish error:", error);
      res.status(500).json({ error: "Error al despublicar el cliente." });
    }
  }
}
