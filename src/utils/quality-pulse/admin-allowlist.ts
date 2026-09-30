/**
 * Verifica si un email pertenece a la lista blanca de administradores de
 * Quality Pulse, configurada en la variable de entorno
 * `QUALITY_PULSE_ADMIN_EMAILS` (emails separados por coma).
 */
export function isAdminEmail(email: string): boolean {
  const allowlist = process.env.QUALITY_PULSE_ADMIN_EMAILS || "";
  const normalizedEmail = email.trim().toLowerCase();

  return allowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .includes(normalizedEmail);
}
