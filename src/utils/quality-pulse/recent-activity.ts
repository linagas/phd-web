import { QualityPulseProfile } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";

export const RECENT_ACTIVITY_LIMIT = 8;

export type ActivityEventType = "REGISTRO" | "PUBLICADO" | "RESPONDIDO" | "ELIMINADO";

/** Feed entry. `occurredAt` is an ISO string so it survives JSON serialization. */
export interface RecentActivityEvent {
  type: ActivityEventType;
  clientKey: string;
  clientName: string;
  occurredAt: string;
  /**
   * Who performed the action. For RESPONDIDO, assessments store no submitter,
   * so this is the owning client's `registeredBy` (absent when unknown).
   */
  actor?: string;
  /** Only for RESPONDIDO. */
  profile?: QualityPulseProfile;
}

function toIso(value: Date | string): string {
  return new Date(value).toISOString();
}

function fromActiveClient(client: QualityPulseClient): RecentActivityEvent[] {
  const events: RecentActivityEvent[] = [
    {
      type: "REGISTRO",
      clientKey: client.clientKey,
      clientName: client.clientName,
      actor: client.registeredBy,
      occurredAt: toIso(client.createdAt),
    },
  ];

  if (client.publishedAt) {
    events.push({
      type: "PUBLICADO",
      clientKey: client.clientKey,
      clientName: client.clientName,
      actor: client.publishedBy,
      occurredAt: toIso(client.publishedAt),
    });
  }

  return events;
}

function fromDeletedClient(client: QualityPulseClient): RecentActivityEvent[] {
  if (!client.deletedAt) return [];
  return [
    {
      type: "ELIMINADO",
      clientKey: client.clientKey,
      clientName: client.clientName,
      actor: client.deletedBy,
      occurredAt: toIso(client.deletedAt),
    },
  ];
}

function fromSubmission(
  submission: QualityPulseAssessment,
  registeredByKey: Map<string, string>
): RecentActivityEvent {
  const actor = registeredByKey.get(submission.clientKey);
  return {
    type: "RESPONDIDO",
    clientKey: submission.clientKey,
    clientName: submission.clientName,
    profile: submission.profile,
    ...(actor ? { actor } : {}),
    occurredAt: toIso(submission.submittedAt),
  };
}

/**
 * Pure derivation of the admin "Actividad Reciente" feed from timestamps that
 * already exist (no extra collection). Active clients contribute REGISTRO and
 * PUBLICADO, deleted clients only ELIMINADO, and each submission a RESPONDIDO.
 * Callers are expected to pass submissions already stripped of deleted clients.
 * Result is sorted newest first and capped at `limit`.
 */
export function buildRecentActivity(
  clients: QualityPulseClient[],
  deletedClients: QualityPulseClient[],
  submissions: QualityPulseAssessment[],
  limit: number = RECENT_ACTIVITY_LIMIT
): RecentActivityEvent[] {
  const registeredByKey = new Map(
    clients.filter((client) => client.registeredBy).map((c) => [c.clientKey, c.registeredBy])
  );
  const events = [
    ...clients.flatMap(fromActiveClient),
    ...deletedClients.flatMap(fromDeletedClient),
    ...submissions.map((submission) => fromSubmission(submission, registeredByKey)),
  ];

  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, limit);
}
