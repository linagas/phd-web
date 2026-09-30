import { NextApiRequest, NextApiResponse } from "next";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";

/**
 * Verifica la cookie de sesión de administración. Es defensa en profundidad:
 * `middleware.ts` ya protege estas rutas, pero el controller nunca debe
 * confiar únicamente en el middleware. Compartido por todos los controllers
 * `/api/quality-pulse/admin/*` para evitar duplicar esta lógica (D7).
 */
export async function requireAdminSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
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

/**
 * Extrae el email del admin autenticado, sin enviar ninguna respuesta HTTP.
 * Distinto de `requireAdminSession` (que gatea el acceso): se usa después de
 * que el gate ya aprobó, para atribuir acciones auditables como `publishedBy`
 * (D3). Devuelve `null` si no hay sesión válida.
 */
export async function getAdminEmail(req: NextApiRequest): Promise<string | null> {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const session = await verifySessionToken(token);
  return session?.email ?? null;
}
