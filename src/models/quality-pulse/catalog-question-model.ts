export const QUALITY_PULSE_PROFILES = ["Calidad", "Desarrollo", "Gestión", "Negocio"] as const;
export type QualityPulseProfile = (typeof QUALITY_PULSE_PROFILES)[number];

export interface QuestionOption {
  label: string;
  score: number;
  variable: string;
  signal: string;
  signalType: string;
  priority: string;
  impact: string;
  outcomes: Record<string, number>;
}

export interface CatalogQuestion {
  id: string;
  dimension: string;
  dimensionId: string;
  capability: string;
  capabilityId: string;
  perspective: string;
  text: string;
  order: number;
  required: boolean;
  status: string;
  objective: string;
  type: string;
  origins: string[];
  profiles: QualityPulseProfile[];
  options: QuestionOption[];
}
