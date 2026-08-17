import { isAdminEmail } from "@/utils/quality-pulse/admin-allowlist";
import {
  signMagicLinkToken,
  signSessionToken,
  verifyMagicLinkToken,
} from "@/utils/quality-pulse/admin-session";

export class InvalidMagicLinkError extends Error {
  constructor() {
    super("El enlace de acceso es inválido o expiró.");
    this.name = "InvalidMagicLinkError";
  }
}

interface EmailJSPayload {
  service_id: string;
  template_id: string;
  user_id: string;
  accessToken: string | undefined;
  template_params: {
    from_name: string;
    to_name: string;
    from_email: string;
    to_email: string;
    message: string;
  };
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Reutiliza el mismo template de EmailJS que el formulario de contacto
 * (src/services/messageService.ts), poniendo el link de acceso en el campo
 * "message". El destinatario se envía explícitamente como `to_email` — para
 * que EmailJS lo use, el campo "To Email" del template en el dashboard debe
 * estar configurado como `{{to_email}}` (si quedó hardcodeado a otra
 * dirección, como en el template original de contacto, el magic link seguirá
 * llegando ahí sin importar este payload).
 */
async function sendMagicLinkEmail(email: string, verifyUrl: string): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("Variables de entorno EmailJS no configuradas.");
  }

  const payload: EmailJSPayload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      from_name: "Quality Pulse",
      to_name: "Administración PHD",
      from_email: email,
      to_email: email,
      message: `Solicitaste acceso al panel de administración de Quality Pulse. Ingresa con este enlace (expira en 15 minutos): ${verifyUrl}`,
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[AdminAuthService] EmailJS ${response.status}:`, body);
    throw new Error(`EmailJS error: ${response.status} — ${body}`);
  }
}

export class AdminAuthService {
  /**
   * Solicita un magic link de acceso al panel de administración. Por
   * seguridad (evitar user enumeration) esta función nunca informa al
   * caller si el email pertenece o no a la allowlist: si no pertenece,
   * simplemente no envía nada y retorna normalmente.
   */
  async requestMagicLink(email: string): Promise<void> {
    if (!isAdminEmail(email)) {
      return;
    }

    const token = await signMagicLinkToken(email);
    const verifyUrl = `${getSiteUrl()}/administracion/verificar?token=${token}`;

    await sendMagicLinkEmail(email, verifyUrl);
  }

  /**
   * Verifica el token del magic link y, si es válido, genera el token de
   * sesión (12 horas) que el controller debe setear como cookie.
   */
  async verifyMagicLink(token: string): Promise<{ email: string; sessionToken: string }> {
    const payload = await verifyMagicLinkToken(token);
    if (!payload) {
      throw new InvalidMagicLinkError();
    }

    const sessionToken = await signSessionToken(payload.email);
    return { email: payload.email, sessionToken };
  }
}
