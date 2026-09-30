"use client";
import Link from "next/link";
import { buildReviewHref, PendingReviewEntry } from "@/utils/quality-pulse/admin-view-models";
import { ProfileScore } from "@/utils/quality-pulse/scoring";

interface PendingReviewListProps {
  items: PendingReviewEntry[];
}

/** Chip de estado por perfil (D: color mapping): "Respondido" en phd-cyan, "Pendiente" en slate neutro. */
function ProfileChip({ profileScore }: { profileScore: ProfileScore }) {
  const answered = profileScore.status === "answered";
  return (
    <span
      aria-label={profileScore.profile}
      className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border ${
        answered
          ? "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan"
          : "border-white/10 bg-white/5 text-slate-500"
      }`}
    >
      {answered ? "Respondido" : "Pendiente"}
    </span>
  );
}

/**
 * "Pendientes de Revisión" (spec `qp-admin-dashboard`): solo recibe clientes
 * ya filtrados por `buildDashboardSummary` (4/4 && !isPublished), este
 * componente no vuelve a filtrar. "Revisar y publicar" es un `<Link>` real
 * hacia `/administracion/clientes/{clientKey}/revisar` (`buildReviewHref`);
 * la publicación ya no ocurre acá, vive en `PublishReviewView`. Cada item
 * puede llegar enriquecido (`enrichPendingReview`) con
 * `healthScore`/`profileScores`; un miss (name-only) sigue renderizando sin
 * score ni chips.
 */
export default function PendingReviewList({ items }: PendingReviewListProps) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
      <h2 className="font-heading font-semibold text-white text-lg">Pendientes de Revisión</h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No hay clientes pendientes de revisión.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.clientKey}
              className="flex flex-col gap-3 rounded-xl border border-phd-purple/20 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">{item.clientName}</span>
                  {item.healthScore != null && (
                    <span className="font-heading font-bold text-phd-cyan text-sm">
                      {item.healthScore}
                    </span>
                  )}
                </div>
                <Link
                  href={buildReviewHref(item.clientKey)}
                  className="text-xs font-semibold bg-phd-cyan/10 hover:bg-phd-cyan/20 border border-phd-cyan/30 text-phd-cyan rounded-full px-4 py-1.5 transition-all"
                >
                  Revisar y publicar
                </Link>
              </div>

              {item.profileScores && (
                <div className="flex flex-wrap gap-2">
                  {item.profileScores.map((profileScore) => (
                    <ProfileChip key={profileScore.profile} profileScore={profileScore} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
