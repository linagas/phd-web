import { QUALITY_PULSE_PROFILES } from "@/models/quality-pulse/catalog-question-model";
import { ClientDashboardSummary } from "@/utils/quality-pulse/dashboard-metrics";
import { ProfileScore } from "@/utils/quality-pulse/scoring";

interface ClientScoreTableProps {
  clients: ClientDashboardSummary[];
  globalHealthScore: number | null;
}

function formatScore(score: number | null): string {
  return score === null ? "Sin datos" : String(score);
}

/**
 * Celda de score por perfil (D2): un perfil "pending" muestra el badge
 * "Pendiente" + "—" con `aria-label="Sin datos"`, nunca un 0 (que se leería
 * como crítico).
 */
function ProfileScoreCell({ profileScore }: { profileScore: ProfileScore }) {
  if (profileScore.status === "pending") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border border-white/10 bg-white/5 text-slate-500">
          Pendiente
        </span>
        <span className="text-slate-500" aria-label="Sin datos">
          —
        </span>
      </div>
    );
  }

  return (
    <span
      data-testid="profile-score-answered"
      className="font-heading font-semibold text-phd-cyan text-lg"
    >
      {profileScore.score}
    </span>
  );
}

/**
 * Quality Health Score global y por cliente/perfil (spec `qp-admin-dashboard`).
 * Las etiquetas de perfil vienen directo de `QUALITY_PULSE_PROFILES` /
 * `ProfileScore.profile` ("Calidad/Desarrollo/Gestión/Negocio"), nunca de
 * códigos internos (QA/DEV/MGT/BIZ no existen en este modelo).
 */
export default function ClientScoreTable({ clients, globalHealthScore }: ClientScoreTableProps) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-heading font-semibold text-white text-lg">Quality Health Score</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">Global</span>
          <span className="font-heading font-bold text-phd-cyan text-2xl">
            {formatScore(globalHealthScore)}
          </span>
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay clientes registrados.</p>
      ) : (
        <div data-testid="client-score-scroll" className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-phd-card">
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Cliente</th>
                <th className="pb-3 px-4">Score</th>
                {QUALITY_PULSE_PROFILES.map((profile) => (
                  <th key={profile} className="pb-3 px-4 text-center">
                    {profile}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.clientKey} className="border-t border-white/5">
                  <td className="py-3 pr-4 text-sm text-white font-semibold">
                    {client.clientName}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">
                    {formatScore(client.healthScore)}
                  </td>
                  {client.profileScores.map((profileScore) => (
                    <td key={profileScore.profile} className="py-3 px-4 text-center">
                      <ProfileScoreCell profileScore={profileScore} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
