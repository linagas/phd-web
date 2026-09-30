import { ReactNode } from "react";
import { DashboardKpis } from "@/utils/quality-pulse/dashboard-metrics";

interface KpiCardsProps {
  kpis: DashboardKpis;
  globalHealthScore: number | null;
}

type KpiAccent = "cyan" | "purple" | "pink";

interface KpiCardData {
  key: string;
  label: string;
  value: string;
  suffix?: string;
  caption: string;
  /** 0-100. `null` = la tarjeta no tiene una métrica de progreso. */
  progress: number | null;
  accent: KpiAccent;
  highlight: boolean;
  icon: ReactNode;
}

interface AccentStyle {
  border: string;
  text: string;
  chip: string;
  bar: string;
  glow: string;
  testId: string;
}

const ACCENT_STYLES: Record<KpiAccent, AccentStyle> = {
  cyan: {
    border: "border-phd-cyan/20",
    text: "text-phd-cyan",
    chip: "bg-phd-cyan/10",
    bar: "bg-phd-cyan",
    glow: "bg-phd-cyan/10",
    testId: "kpi-cyan",
  },
  purple: {
    border: "border-phd-purple/30",
    text: "text-phd-purple",
    chip: "bg-phd-purple/10",
    bar: "bg-phd-purple",
    glow: "bg-phd-purple/10",
    testId: "kpi-purple",
  },
  pink: {
    border: "border-phd-pink/30",
    text: "text-phd-pink",
    chip: "bg-phd-pink/10",
    bar: "bg-phd-pink",
    glow: "bg-phd-pink/10",
    testId: "kpi-pending-review",
  },
};

function clampPct(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

function ratioPct(part: number, total: number): number {
  return total > 0 ? clampPct((part / total) * 100) : 0;
}

/** Contenedor de los iconos decorativos (puramente visual: `aria-hidden`). */
function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  clients: (
    <IconSvg>
      <path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16" />
      <path d="M15 9h4a1 1 0 011 1v11" />
      <path d="M8 8h3M8 12h3M8 16h3M3 21h18" />
    </IconSvg>
  ),
  submissions: (
    <IconSvg>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 13l2 2 4-4" />
    </IconSvg>
  ),
  completion: (
    <IconSvg>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </IconSvg>
  ),
  pending: (
    <IconSvg>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 004 0" />
    </IconSvg>
  ),
  score: (
    <IconSvg>
      <path d="M4 17a8 8 0 1116 0" />
      <path d="M12 17l4-5" />
    </IconSvg>
  ),
};

function buildCards(kpis: DashboardKpis, globalHealthScore: number | null): KpiCardData[] {
  return [
    {
      key: "clients",
      label: "Clientes registrados",
      value: String(kpis.registeredClients),
      caption: "Dados de alta en la plataforma",
      progress: null,
      accent: "cyan",
      highlight: false,
      icon: ICONS.clients,
    },
    {
      key: "submissions",
      label: "Evaluaciones totales",
      value: `${kpis.submissions}/${kpis.expectedSubmissions}`,
      caption: "Enviadas sobre las esperadas",
      progress: ratioPct(kpis.submissions, kpis.expectedSubmissions),
      accent: "cyan",
      highlight: false,
      icon: ICONS.submissions,
    },
    {
      key: "completion",
      label: "Completitud",
      value: `${kpis.completionPct}%`,
      caption: "Avance global de respuestas",
      progress: clampPct(kpis.completionPct),
      accent: "purple",
      highlight: false,
      icon: ICONS.completion,
    },
    {
      key: "pending",
      label: "Pendientes de revisión",
      value: String(kpis.pendingReview),
      caption: kpis.pendingReview > 0 ? "Acción requerida del auditor" : "Sin pendientes por ahora",
      progress: ratioPct(kpis.pendingReview, kpis.registeredClients),
      accent: "pink",
      highlight: kpis.pendingReview > 0,
      icon: ICONS.pending,
    },
    {
      key: "score",
      label: "Quality Health Score global",
      value: globalHealthScore === null ? "Sin datos" : String(globalHealthScore),
      suffix: globalHealthScore === null ? undefined : "/ 100 pts",
      caption: "Promedio de todos los clientes",
      progress: globalHealthScore === null ? 0 : clampPct(globalHealthScore),
      accent: "cyan",
      highlight: false,
      icon: ICONS.score,
    },
  ];
}

/**
 * Tarjetas de KPIs del Dashboard admin. Zero-state safe: con 0 clientes y
 * `globalHealthScore: null` renderiza "0", "0/0", "0%" y "Sin datos" sin
 * lanzar error (spec: "Empty state does not error"). Acentos: `phd-cyan` =
 * constructivo (Clientes/Submissions/Score), `phd-purple` = avance
 * (Completitud), `phd-pink` = atención (Pendientes de revisión, con valor
 * resaltado solo cuando es > 0). Iconos y barras son decorativos (`aria-hidden`).
 */
export default function KpiCards({ kpis, globalHealthScore }: KpiCardsProps) {
  const cards = buildCards(kpis, globalHealthScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const styles = ACCENT_STYLES[card.accent];
        const isNumeric = card.value !== "Sin datos";

        return (
          <div
            key={card.key}
            data-testid={styles.testId}
            className={`phd-glass relative overflow-hidden rounded-3xl p-6 flex flex-col gap-4 border ${styles.border}`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full blur-2xl ${styles.glow}`}
            />

            <div className="relative flex items-start justify-between gap-3">
              <span
                className={`text-xs font-bold uppercase tracking-[0.2em] ${
                  card.highlight ? styles.text : "text-slate-400"
                }`}
              >
                {card.label}
              </span>
              <span className={`shrink-0 rounded-xl p-2 ${styles.chip} ${styles.text}`}>{card.icon}</span>
            </div>

            <div className="relative flex items-baseline gap-2">
              <span
                className={`font-heading font-bold ${isNumeric ? "text-5xl" : "text-2xl"} ${
                  card.highlight ? styles.text : "text-white"
                }`}
              >
                {card.value}
              </span>
              {card.suffix && <span className="text-xs text-slate-400">{card.suffix}</span>}
            </div>

            <div className="relative mt-auto flex flex-col gap-3">
              <div aria-hidden="true" className="h-1.5 w-full rounded-full bg-white/10">
                {card.progress !== null && (
                  <div
                    className={`h-full rounded-full ${styles.bar}`}
                    style={{ width: `${card.progress}%` }}
                  />
                )}
              </div>
              <span className="text-xs text-slate-500">{card.caption}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
