import { ProfileScore } from "@/utils/quality-pulse/scoring";
import { formatCompletion } from "@/utils/quality-pulse/admin-view-models";

interface ClientProgressCellProps {
  answeredCount: number;
  profileScores: ProfileScore[];
}

const SEGMENTS = 4;

/** "n/4 completados" plus 4 segmented bars, one per profile (filled when answered). */
export default function ClientProgressCell({ answeredCount, profileScores }: ClientProgressCellProps) {
  const isAnswered = (index: number): boolean =>
    profileScores.length > 0 ? profileScores[index]?.status === "answered" : index < answeredCount;

  return (
    <div className="flex flex-col gap-1.5 min-w-[9rem]">
      <span className="text-xs text-slate-300">{formatCompletion(answeredCount)} completados</span>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${isAnswered(index) ? "bg-phd-cyan" : "bg-white/10"}`}
          />
        ))}
      </div>
    </div>
  );
}
