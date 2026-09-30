import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { AdminAuthService, InvalidMagicLinkError } from "@/services/quality-pulse/admin-auth-service";
import { buildSessionCookie } from "@/utils/quality-pulse/admin-session";

const requestLinkSchema = z.object({
  email: z.string().email("El correo electrónico no es válido"),
});

export class AdminAuthController {
  private service: AdminAuthService;

  constructor() {
    this.service = new AdminAuthService();
  }

  async requestLink(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const { email } = requestLinkSchema.parse(req.body);
      await this.service.requestMagicLink(email);
      // Respuesta genérica siempre 200, sin revelar si el email pertenece
      // o no a la allowlist de administradores (evita user enumeration).
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("[AdminAuthController] requestLink error:", error);
      res.status(500).json({ error: "Error al solicitar el enlace de acceso." });
    }
  }

  async verify(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const token = req.query.token;
      if (typeof token !== "string" || token.trim() === "") {
        res.status(400).json({ error: "El parámetro 'token' es obligatorio." });
        return;
      }

      const { sessionToken } = await this.service.verifyMagicLink(token);
      res.setHeader("Set-Cookie", buildSessionCookie(sessionToken));
      res.status(200).json({ verified: true });
    } catch (error) {
      if (error instanceof InvalidMagicLinkError) {
        res.status(401).json({ error: error.message });
        return;
      }
      console.error("[AdminAuthController] verify error:", error);
      res.status(500).json({ error: "Error al verificar el enlace de acceso." });
    }
  }
}
