import { SignJWT, jwtVerify, JWTPayload } from "jose";

/**
 * Usamos `jose` en vez de `jsonwebtoken` porque este módulo debe verificar
 * el mismo token tanto en API routes (runtime Node.js) como en
 * `middleware.ts` (runtime Edge en Next.js 14). `jsonwebtoken` depende del
 * módulo nativo `crypto` de Node y no funciona en el Edge Runtime; `jose`
 * usa Web Crypto y es compatible con ambos.
 */

export const SESSION_COOKIE_NAME = "qp_admin_session";

const MAGIC_LINK_PURPOSE = "login";
const SESSION_PURPOSE = "session";

const MAGIC_LINK_EXPIRATION = "15m";
const SESSION_EXPIRATION = "12h";

interface AdminTokenPayload extends JWTPayload {
  email: string;
  purpose: typeof MAGIC_LINK_PURPOSE | typeof SESSION_PURPOSE;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.QUALITY_PULSE_AUTH_SECRET;
  if (!secret) {
    throw new Error("QUALITY_PULSE_AUTH_SECRET no está configurada.");
  }
  return new TextEncoder().encode(secret);
}

async function signToken(email: string, purpose: AdminTokenPayload["purpose"], expiresIn: string): Promise<string> {
  return new SignJWT({ email, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

async function verifyToken(
  token: string,
  purpose: AdminTokenPayload["purpose"]
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify<AdminTokenPayload>(token, getSecretKey());
    if (payload.purpose !== purpose || typeof payload.email !== "string") {
      console.error(
        `[admin-session] purpose mismatch: esperado="${purpose}" recibido="${payload.purpose}"`
      );
      return null;
    }
    return { email: payload.email };
  } catch (error) {
    console.error(
      `[admin-session] verifyToken(${purpose}) falló:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/** Firma el token de magic link (propósito "login"), expira en 15 minutos. */
export function signMagicLinkToken(email: string): Promise<string> {
  return signToken(email, MAGIC_LINK_PURPOSE, MAGIC_LINK_EXPIRATION);
}

/** Verifica un token de magic link. Devuelve el email si es válido. */
export function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  return verifyToken(token, MAGIC_LINK_PURPOSE);
}

/** Firma el token de sesión (propósito "session"), expira en 12 horas. */
export function signSessionToken(email: string): Promise<string> {
  return signToken(email, SESSION_PURPOSE, SESSION_EXPIRATION);
}

/** Verifica el token de sesión almacenado en la cookie `qp_admin_session`. */
export function verifySessionToken(token: string): Promise<{ email: string } | null> {
  return verifyToken(token, SESSION_PURPOSE);
}

/** Arma el header `Set-Cookie` para la cookie de sesión de administración. */
export function buildSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAgeSeconds = 12 * 60 * 60;

  const attributes = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProduction) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}
