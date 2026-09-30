import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";

interface QuestionCardProps {
  question: CatalogQuestion;
  questionNumber: number;
  selectedOptionIndex: number | undefined;
  onSelectOption: (optionIndex: number) => void;
}

const QuestionCard = ({
  question,
  questionNumber,
  selectedOptionIndex,
  onSelectOption,
}: QuestionCardProps) => {
  if (!question) return null;

  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10">
      <aside className="flex sm:flex-col gap-6 sm:gap-4 sm:w-40 shrink-0 items-start">
        <span className="font-heading text-4xl font-bold text-white/10 leading-none">
          {String(questionNumber).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-4">
          {question.perspective && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                Perspectiva
              </p>
              <p className="text-sm font-semibold text-white">{question.perspective}</p>
            </div>
          )}
          {question.capability && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                Capacidad
              </p>
              <p className="text-sm font-semibold text-white">{question.capability}</p>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-col gap-6 flex-1 min-w-0">
        {question.objective && (
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Q{questionNumber} · {question.dimension}
          </p>
        )}
        <h3 className="font-heading font-semibold text-white text-xl sm:text-2xl leading-snug">
          {question.text}
        </h3>

        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOptionIndex === index;
            return (
              <button
                key={`${question.id}-${index}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectOption(index)}
                className={`w-full text-left rounded-xl border px-5 py-4 text-sm transition-all ${
                  isSelected
                    ? "border-phd-pink bg-phd-pink/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-4 h-4 rounded-full border shrink-0 ${
                      isSelected ? "border-phd-pink bg-phd-pink" : "border-slate-500"
                    }`}
                  />
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
