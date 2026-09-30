import {
  buildPublicationSteps,
  PublicationState,
} from "@/utils/quality-pulse/admin-view-models";

interface PublicationStepperProps {
  state: PublicationState;
}

/** "Ciclo de publicación": ordered list, active step marked with aria-current="step". */
export default function PublicationStepper({ state }: PublicationStepperProps) {
  const { steps, stage, total } = buildPublicationSteps(state);
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2
          id="publication-cycle-title"
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"
        >
          Ciclo de publicación
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          Etapa {stage} de {total}
        </span>
      </div>
      <ol className="flex flex-col sm:flex-row gap-3 sm:gap-6">
        {steps.map((step, index) => {
          const done = step.status === "done";
          const current = step.status === "current";
          return (
            <li
              key={step.label}
              aria-current={current ? "step" : undefined}
              className={`flex items-center gap-3 text-sm ${
                current
                  ? "text-white font-semibold"
                  : done
                    ? "text-slate-300"
                    : "text-slate-600"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                  current
                    ? "border-phd-pink bg-phd-pink text-white"
                    : done
                      ? "border-phd-cyan/40 bg-phd-cyan/10 text-phd-cyan"
                      : "border-white/10 bg-white/5 text-slate-600"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </>
  );
}
