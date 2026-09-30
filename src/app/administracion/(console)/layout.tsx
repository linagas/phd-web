import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";
import AdminSidebar from "./components/admin-sidebar";

interface AdminConsoleLayoutProps {
  children: ReactNode;
}

/**
 * Guard de servidor para todas las sub-rutas del consola (`/administracion`,
 * `/administracion/clientes`, `/administracion/catalogo`). Es una capa
 * adicional de defensa en profundidad (D7): `middleware.ts` ya protege estas
 * rutas, pero un regresión en el matcher no debe abrir la consola.
 *
 * Este layout vive en el route group `(console)` para que `ingresar/` y
 * `verificar/` (rutas públicas de login) queden fuera de su alcance y no
 * generen un loop de redirección hacia sí mismas (D6).
 */
export default async function AdminConsoleLayout({ children }: AdminConsoleLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/administracion/ingresar");
  }

  return (
    <div className="min-h-screen bg-phd-dark phd-gradient-blur flex">
      <AdminSidebar adminEmail={session.email} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
