import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";
import AdminPanel from "@/app/quality-pulse/components/admin-panel";

/**
 * `/administracion/clientes`. El guard vive en `(console)/layout.tsx`; esta
 * página vuelve a leer la sesión únicamente para mostrar el email del admin
 * en `AdminPanel`, no para autorizar el acceso (D7).
 */
export default async function AdminClientesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <AdminPanel adminEmail={session?.email ?? ""} />;
}
