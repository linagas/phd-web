import { buildRecentActivity } from "@/utils/quality-pulse/recent-activity";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";

function buildClient(overrides: Partial<QualityPulseClient> = {}): QualityPulseClient {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    registeredBy: "admin@phd.cl",
    createdAt: new Date("2026-01-01T10:00:00.000Z"),
    isPublished: false,
    ...overrides,
  };
}

function buildSubmission(overrides: Partial<QualityPulseAssessment> = {}): QualityPulseAssessment {
  return {
    clientKey: "cliente-a",
    clientName: "Cliente A",
    profile: "Calidad",
    answers: { Q1: 2 },
    questionCount: 1,
    submittedAt: new Date("2026-01-02T10:00:00.000Z"),
    ...overrides,
  };
}

describe("buildRecentActivity", () => {
  it("returns an empty feed when there is nothing to report", () => {
    expect(buildRecentActivity([], [], [])).toEqual([]);
  });

  it("derives a REGISTRO event from client createdAt with ISO string date and actor", () => {
    const events = buildRecentActivity([buildClient()], [], []);

    expect(events).toEqual([
      {
        type: "REGISTRO",
        clientKey: "cliente-a",
        clientName: "Cliente A",
        actor: "admin@phd.cl",
        occurredAt: "2026-01-01T10:00:00.000Z",
      },
    ]);
  });

  it("derives a PUBLICADO event from publishedAt/publishedBy", () => {
    const client = buildClient({
      isPublished: true,
      publishedAt: new Date("2026-01-03T10:00:00.000Z"),
      publishedBy: "boss@phd.cl",
    });

    const published = buildRecentActivity([client], [], []).find((e) => e.type === "PUBLICADO");

    expect(published).toEqual({
      type: "PUBLICADO",
      clientKey: "cliente-a",
      clientName: "Cliente A",
      actor: "boss@phd.cl",
      occurredAt: "2026-01-03T10:00:00.000Z",
    });
  });

  it("does not emit PUBLICADO when publishedAt is missing", () => {
    const events = buildRecentActivity([buildClient({ isPublished: true })], [], []);

    expect(events.map((e) => e.type)).toEqual(["REGISTRO"]);
  });

  it("derives a RESPONDIDO event per submission using the owning client's registeredBy as actor", () => {
    const events = buildRecentActivity(
      [buildClient({ registeredBy: "auditor@phd.cl" })],
      [],
      [buildSubmission({ profile: "Gestión" })]
    );

    expect(events.find((e) => e.type === "RESPONDIDO")).toEqual({
      type: "RESPONDIDO",
      clientKey: "cliente-a",
      clientName: "Cliente A",
      profile: "Gestión",
      actor: "auditor@phd.cl",
      occurredAt: "2026-01-02T10:00:00.000Z",
    });
  });

  it("omits the RESPONDIDO actor when the client is missing or has no registeredBy", () => {
    const orphan = buildRecentActivity([], [], [buildSubmission()])[0];
    const blank = buildRecentActivity(
      [buildClient({ registeredBy: "" })],
      [],
      [buildSubmission()]
    ).find((e) => e.type === "RESPONDIDO");

    expect(orphan).not.toHaveProperty("actor");
    expect(blank).not.toHaveProperty("actor");
  });

  it("derives only an ELIMINADO event for deleted clients", () => {
    const deleted = buildClient({
      clientKey: "gone",
      clientName: "Gone",
      deletedAt: new Date("2026-01-05T10:00:00.000Z"),
      deletedBy: "admin@phd.cl",
    });

    const events = buildRecentActivity([], [deleted], []);

    expect(events).toEqual([
      {
        type: "ELIMINADO",
        clientKey: "gone",
        clientName: "Gone",
        actor: "admin@phd.cl",
        occurredAt: "2026-01-05T10:00:00.000Z",
      },
    ]);
  });

  it("sorts events by date descending", () => {
    const client = buildClient({
      isPublished: true,
      publishedAt: new Date("2026-01-03T10:00:00.000Z"),
      publishedBy: "boss@phd.cl",
    });

    const events = buildRecentActivity([client], [], [buildSubmission()]);

    expect(events.map((e) => e.type)).toEqual(["PUBLICADO", "RESPONDIDO", "REGISTRO"]);
  });

  it("limits the feed to the 8 most recent events by default", () => {
    const submissions = Array.from({ length: 12 }, (_, index) =>
      buildSubmission({ submittedAt: new Date(Date.UTC(2026, 1, index + 1)) })
    );

    const events = buildRecentActivity([], [], submissions);

    expect(events).toHaveLength(8);
    expect(events[0].occurredAt).toBe(new Date(Date.UTC(2026, 1, 12)).toISOString());
  });

  it("accepts dates that arrived as ISO strings (post-JSON) without throwing", () => {
    const client = buildClient({
      createdAt: "2026-01-01T10:00:00.000Z" as unknown as Date,
    });

    expect(buildRecentActivity([client], [], [])[0].occurredAt).toBe("2026-01-01T10:00:00.000Z");
  });
});
