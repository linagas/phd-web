import DashboardView from "./components/dashboard-view";

/**
 * Dashboard (`/administracion`). El guard vive en `(console)/layout.tsx`;
 * esta página no necesita volver a verificar la sesión (D7). Los KPIs, el
 * Quality Health Score y "Pendientes de Revisión" se cargan client-side en
 * `DashboardView` desde `GET /api/quality-pulse/admin/dashboard`.
 */
export default function AdminDashboardPage() {
  return <DashboardView />;
}
