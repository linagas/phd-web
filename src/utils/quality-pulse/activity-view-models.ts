import { ActivityEventType, RecentActivityEvent } from "@/utils/quality-pulse/recent-activity";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_DAYS = 30;
const YEAR_DAYS = 365;

function pluralize(count: number, singular: string, plural: string): string {
  return `hace ${count} ${count === 1 ? singular : plural}`;
}

/**
 * Spanish relative time ("hace 2 horas"). Pure: `now` is injected. Future
 * dates (clock skew) collapse to "hace un momento"; an unparseable date
 * yields an empty string so the UI can simply omit it.
 */
export function formatRelativeTime(isoDate: string, now: Date): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return "";

  const elapsed = now.getTime() - timestamp;
  if (elapsed < MINUTE_MS) return "hace un momento";
  if (elapsed < HOUR_MS) return pluralize(Math.floor(elapsed / MINUTE_MS), "minuto", "minutos");
  if (elapsed < DAY_MS) return pluralize(Math.floor(elapsed / HOUR_MS), "hora", "horas");

  const days = Math.floor(elapsed / DAY_MS);
  if (days < MONTH_DAYS) return pluralize(days, "día", "días");
  if (days < YEAR_DAYS) return pluralize(Math.floor(days / MONTH_DAYS), "mes", "meses");
  return pluralize(Math.floor(days / YEAR_DAYS), "año", "años");
}

export interface ActivityEventView {
  badge: ActivityEventType;
  badgeClassName: string;
  /** Message split around the client name so the UI can bold it. */
  before: string;
  clientName: string;
  after: string;
  detail?: string;
}

const BADGE_CLASSES: Record<ActivityEventType, string> = {
  REGISTRO: "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan",
  PUBLICADO: "border-blue-1/30 bg-blue-1/10 text-blue-1",
  RESPONDIDO: "border-phd-pink/30 bg-phd-pink/10 text-phd-pink",
  ELIMINADO: "border-white/10 bg-white/5 text-slate-500",
};

function buildDetail(label: string, actor?: string): string | undefined {
  return actor ? `${label}: ${actor}` : undefined;
}

/** Maps a feed event to the copy and badge style shown in the timeline. */
export function describeActivityEvent(event: RecentActivityEvent): ActivityEventView {
  const base = {
    badge: event.type,
    badgeClassName: BADGE_CLASSES[event.type],
    clientName: event.clientName,
    after: "",
  };

  switch (event.type) {
    case "REGISTRO":
      return {
        ...base,
        before: "Nuevo cliente registrado: ",
        detail: buildDetail("Registrado por", event.actor),
      };
    case "PUBLICADO":
      return {
        ...base,
        before: "Resultados publicados para ",
        detail: buildDetail("Publicado por", event.actor),
      };
    case "ELIMINADO":
      return {
        ...base,
        before: "Cliente eliminado: ",
        detail: buildDetail("Eliminado por", event.actor),
      };
    case "RESPONDIDO":
      return {
        ...base,
        before: event.profile
          ? `Evaluación ${event.profile} completada en `
          : "Evaluación completada en ",
        detail: buildDetail("Auditor", event.actor),
      };
  }
}
