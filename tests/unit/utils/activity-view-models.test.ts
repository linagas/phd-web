import {
  describeActivityEvent,
  formatRelativeTime,
} from "@/utils/quality-pulse/activity-view-models";
import { RecentActivityEvent } from "@/utils/quality-pulse/recent-activity";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function isoAgo(milliseconds: number): string {
  return new Date(NOW.getTime() - milliseconds).toISOString();
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it.each([
    [0, "hace un momento"],
    [30 * SECOND, "hace un momento"],
    [1 * MINUTE, "hace 1 minuto"],
    [5 * MINUTE, "hace 5 minutos"],
    [59 * MINUTE, "hace 59 minutos"],
    [1 * HOUR, "hace 1 hora"],
    [2 * HOUR, "hace 2 horas"],
    [23 * HOUR, "hace 23 horas"],
    [1 * DAY, "hace 1 día"],
    [3 * DAY, "hace 3 días"],
    [29 * DAY, "hace 29 días"],
    [30 * DAY, "hace 1 mes"],
    [90 * DAY, "hace 3 meses"],
    [365 * DAY, "hace 1 año"],
    [800 * DAY, "hace 2 años"],
  ])("formats %i ms ago as '%s'", (elapsed, expected) => {
    expect(formatRelativeTime(isoAgo(elapsed), NOW)).toBe(expected);
  });

  it("treats future dates (clock skew) as 'hace un momento'", () => {
    expect(formatRelativeTime(isoAgo(-5 * MINUTE), NOW)).toBe("hace un momento");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBe("");
  });
});

function buildEvent(overrides: Partial<RecentActivityEvent> = {}): RecentActivityEvent {
  return {
    type: "REGISTRO",
    clientKey: "a",
    clientName: "Cliente A",
    actor: "admin@phd.cl",
    occurredAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("describeActivityEvent", () => {
  it("describes REGISTRO", () => {
    const view = describeActivityEvent(buildEvent());

    expect(view.badge).toBe("REGISTRO");
    expect(view.before).toBe("Nuevo cliente registrado: ");
    expect(view.clientName).toBe("Cliente A");
    expect(view.after).toBe("");
    expect(view.detail).toBe("Registrado por: admin@phd.cl");
    expect(view.badgeClassName).toContain("phd-cyan");
  });

  it("describes PUBLICADO", () => {
    const view = describeActivityEvent(buildEvent({ type: "PUBLICADO", actor: "boss@phd.cl" }));

    expect(view.badge).toBe("PUBLICADO");
    expect(view.before).toBe("Resultados publicados para ");
    expect(view.detail).toBe("Publicado por: boss@phd.cl");
    expect(view.badgeClassName).toContain("blue-1");
  });

  it("describes ELIMINADO with a muted badge", () => {
    const view = describeActivityEvent(buildEvent({ type: "ELIMINADO", actor: "admin@phd.cl" }));

    expect(view.badge).toBe("ELIMINADO");
    expect(view.before).toBe("Cliente eliminado: ");
    expect(view.detail).toBe("Eliminado por: admin@phd.cl");
    expect(view.badgeClassName).toContain("slate");
  });

  it("describes RESPONDIDO with the profile and no detail line", () => {
    const view = describeActivityEvent(
      buildEvent({ type: "RESPONDIDO", profile: "Gestión", actor: undefined })
    );

    expect(view.badge).toBe("RESPONDIDO");
    expect(view.before).toBe("Evaluación Gestión completada en ");
    expect(view.detail).toBeUndefined();
    expect(view.badgeClassName).toContain("phd-pink");
  });

  it("shows 'Auditor: <actor>' for RESPONDIDO when the actor is known", () => {
    const view = describeActivityEvent(
      buildEvent({ type: "RESPONDIDO", profile: "Calidad", actor: "auditor@phd.cl" })
    );

    expect(view.detail).toBe("Auditor: auditor@phd.cl");
  });

  it("omits the detail line when the actor is unknown", () => {
    expect(describeActivityEvent(buildEvent({ actor: undefined })).detail).toBeUndefined();
  });
});
