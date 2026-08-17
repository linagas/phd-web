import {
  CatalogQuestion,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";

const GAP_SIGNAL_TYPES = ["Pain", "Brecha"];

export function isGapAnswer(
  question: CatalogQuestion | undefined,
  optionIndex: number | undefined
): boolean {
  if (!question || optionIndex === undefined) return false;
  const option = question.options[optionIndex];
  return option !== undefined && GAP_SIGNAL_TYPES.includes(option.signalType);
}

export function getVisibleQuestions(
  questions: CatalogQuestion[],
  profile: QualityPulseProfile,
  answers: Record<string, number>
): CatalogQuestion[] {
  const byId = new Map(questions.map((question) => [question.id, question]));

  return questions.filter((question) => {
    if (!question.profiles.includes(profile) || question.status !== "Activa") {
      return false;
    }
    if (question.type === "Base") return true;

    return question.origins.some((originId) => {
      const originQuestion = byId.get(originId);
      if (!originQuestion || !originQuestion.profiles.includes(profile)) {
        return false;
      }
      return isGapAnswer(originQuestion, answers[originId]);
    });
  });
}
