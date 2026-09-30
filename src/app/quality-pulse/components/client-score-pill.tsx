import { formatRowScore, scoreTone, ScoreTone } from "@/utils/quality-pulse/admin-view-models";

interface ClientScorePillProps {
  score: number | null;
}

const TONE_CLASSES: Record<Exclude<ScoreTone, "none">, { pill: string; dot: string }> = {
  low: { pill: "border-phd-pink/30 bg-phd-pink/10 text-phd-pink", dot: "bg-phd-pink" },
  mid: { pill: "border-amber-400/30 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  high: { pill: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
};

/** Score pill with a colored dot; a plain "—" when there is no score. */
export default function ClientScorePill({ score }: ClientScorePillProps) {
  const tone = scoreTone(score);
  if (tone === "none") return <span className="text-sm text-slate-500">{formatRowScore(score)}</span>;

  const classes = TONE_CLASSES[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${classes.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${classes.dot}`} aria-hidden="true" />
      {formatRowScore(score)}
    </span>
  );
}
