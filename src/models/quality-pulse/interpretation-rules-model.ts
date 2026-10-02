export interface ScoreInterpretationRule {
  id: string;
  minScore: number;
  maxScore: number;
  interpretation: string;
}

export interface SignalInterpretationRule {
  id: string;
  minPain: number;
  minBrecha: number;
  minFortaleza: number;
  condition: string;
  reading: string;
  /** Position in the sheet (S1 = 1). First matching rule wins; the last is the fallback. */
  order: number;
}

export interface InterpretationRules {
  scoreRules: ScoreInterpretationRule[];
  signalRules: SignalInterpretationRule[];
}
