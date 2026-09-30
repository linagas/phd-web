interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  if (total <= 0) return null;

  const percent = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between text-xs text-slate-400 font-mono">
        <span>
          Pregunta {Math.min(current, total)} de {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-phd-cyan via-phd-pink to-phd-purple transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
