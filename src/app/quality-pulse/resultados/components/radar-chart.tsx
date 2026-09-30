interface RadarChartAxis {
  label: string;
  value: number | null;
}

interface RadarChartProps {
  axes: RadarChartAxis[];
  color?: string;
  size?: number;
  maxValue?: number;
}

const RING_STEPS = [0.25, 0.5, 0.75, 1];

function pointOnAxis(
  center: number,
  radius: number,
  angle: number,
  ratio: number
): [number, number] {
  const r = radius * ratio;
  return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
}

const RadarChart = ({ axes, color = "#38BDF8", size = 280, maxValue = 100 }: RadarChartProps) => {
  if (axes.length === 0) return null;

  const center = size / 2;
  const radius = size / 2 - 60;
  const angleStep = (2 * Math.PI) / axes.length;
  const startAngle = -Math.PI / 2;

  const dataPoints = axes.map((axis, index) => {
    const angle = startAngle + index * angleStep;
    const ratio = Math.max(0, Math.min(1, (axis.value ?? 0) / maxValue));
    return pointOnAxis(center, radius, angle, ratio);
  });

  const ariaLabel = axes
    .map((axis) => `${axis.label}: ${axis.value === null ? "sin datos" : `${axis.value} de ${maxValue}`}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={ariaLabel}
      overflow="visible"
      className="max-w-sm mx-auto"
    >
      {RING_STEPS.map((ratio) => {
        const ringPoints = axes
          .map((_, index) => pointOnAxis(center, radius, startAngle + index * angleStep, ratio))
          .map((point) => point.join(","))
          .join(" ");
        return (
          <polygon
            key={ratio}
            points={ringPoints}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {axes.map((axis, index) => {
        const angle = startAngle + index * angleStep;
        const [x, y] = pointOnAxis(center, radius, angle, 1);
        const [labelX, labelY] = pointOnAxis(center, radius, angle, 1.22);
        const textAnchor = labelX < center - 8 ? "end" : labelX > center + 8 ? "start" : "middle";
        return (
          <g key={axis.label}>
            <line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-slate-400"
              fontSize={11}
            >
              {axis.label}
            </text>
          </g>
        );
      })}

      <polygon
        points={dataPoints.map((point) => point.join(",")).join(" ")}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={2}
      />
      {dataPoints.map((point, index) => {
        const hasData = axes[index].value !== null;
        return (
          <circle
            key={`${axes[index].label}-dot`}
            cx={point[0]}
            cy={point[1]}
            r={hasData ? 3 : 4}
            fill={hasData ? color : "rgba(148,163,184,0.6)"}
            stroke={hasData ? "none" : "rgba(15,23,42,0.8)"}
            strokeWidth={hasData ? 0 : 1.5}
          />
        );
      })}
    </svg>
  );
};

export default RadarChart;
