import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import {
  ClientAlreadyExistsError,
  ClientService,
  EmptyClientNameError,
} from "@/services/quality-pulse/client-service";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

const registerClientSchema = z.object({
  clientName: z.string().min(1, "El nombre del cliente es obligatorio"),
});

async function requireAdminSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "No autenticado." });
    return null;
  }

  const session = await verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: "Sesión inválida o expirada." });
    return null;
  }

  return session.email;
}

export class ClientController {
  private service: ClientService;

  constructor() {
    this.service = new ClientService();
  }

  /**
   * GET con `?organization=` → validación pública de existencia (usada por
   * el formulario principal y por resultados). GET sin parámetro → listado
   * completo, solo con sesión de administrador.
   */
  async getStatus(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const organization = req.query.organization;
      const hasOrganization = typeof organization === "string" && organization.trim() !== "";

      if (hasOrganization) {
        const client = await this.service.findByName(organization);
        res.status(200).json({
          exists: client !== null,
          clientName: client?.clientName ?? null,
        });
        return;
      }

      if (!(await requireAdminSession(req, res))) return;

      const clients = await this.service.listClients();
      res.status(200).json(clients);
    } catch (error) {
      console.error("[ClientController] getStatus error:", error);
      res.status(500).json({ error: "Error al consultar clientes." });
    }
  }

  async register(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    const adminEmail = await requireAdminSession(req, res);
    if (!adminEmail) return;

    try {
      const { clientName } = registerClientSchema.parse(req.body);
      const client = await this.service.register(clientName, adminEmail);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof ClientAlreadyExistsError) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error instanceof EmptyClientNameError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("[ClientController] register error:", error);
      res.status(500).json({ error: "Error al registrar el cliente." });
    }
  }
}
