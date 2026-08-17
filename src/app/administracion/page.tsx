import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/utils/quality-pulse/admin-session";
import AdminPanel from "@/app/quality-pulse/components/admin-panel";

export default async function QualityPulseAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/administracion/ingresar");
  }

  return <AdminPanel adminEmail={session.email} />;
}
