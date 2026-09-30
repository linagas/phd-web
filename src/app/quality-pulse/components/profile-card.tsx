import { QualityPulseProfile } from "@/models/quality-pulse/catalog-question-model";

interface ProfileCardProps {
  profile: QualityPulseProfile;
  questionCount: number;
  answered: boolean;
  disabled: boolean;
  onSelect: (profile: QualityPulseProfile) => void;
}

const PROFILE_DESCRIPTIONS: Record<QualityPulseProfile, string> = {
  Calidad: "Procesos, cobertura y madurez de aseguramiento de calidad.",
  Desarrollo: "Prácticas de ingeniería, deuda técnica y ciclo de desarrollo.",
  Gestión: "Gobierno, planificación y visibilidad de riesgos.",
  Negocio: "Impacto de la calidad en resultados y confianza del negocio.",
};

const ProfileCard = ({
  profile,
  questionCount,
  answered,
  disabled,
  onSelect,
}: ProfileCardProps) => {
  const isDisabled = disabled || answered;

  return (
    <button
      type="button"
      onClick={() => onSelect(profile)}
      disabled={isDisabled}
      className={`text-left phd-glass rounded-2xl p-6 flex flex-col gap-4 transition-all ${
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:scale-[1.02] hover:border-phd-cyan/30 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading font-bold text-white text-xl">{profile}</h3>
        {answered && (
          <span className="shrink-0 border border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1">
            Respondido
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">
        {PROFILE_DESCRIPTIONS[profile]}
      </p>
      <p className="text-xs text-slate-500 font-mono mt-auto">
        {questionCount} {questionCount === 1 ? "pregunta" : "preguntas"} base
      </p>
    </button>
  );
};

export default ProfileCard;
