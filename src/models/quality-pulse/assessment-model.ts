import { QualityPulseProfile } from "@/models/quality-pulse/catalog-question-model";

export interface QualityPulseAssessment {
  clientKey: string;
  clientName: string;
  profile: QualityPulseProfile;
  answers: Record<string, number>;
  questionCount: number;
  submittedAt: Date;
}

export class QualityPulseAssessmentModel {
  static create(
    clientKey: string,
    clientName: string,
    profile: QualityPulseProfile,
    answers: Record<string, number>
  ): QualityPulseAssessment {
    return {
      clientKey,
      clientName,
      profile,
      answers,
      questionCount: Object.keys(answers).length,
      submittedAt: new Date(),
    };
  }
}
