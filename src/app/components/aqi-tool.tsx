"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Dimension {
  id: string;
  label: string;
  question: string;
}

interface DiagnosticLevel {
  range: string;
  label: string;
  badgeColor: string;
  feedback: string;
}

const DIMENSIONS: Dimension[] = [
  {
    id: "d1",
    label: "D1: Adopción real de IA en el equipo",
    question: "¿Cuántos de sus ingenieros usan de verdad y sistemáticamente copilotos de código?",
  },
  {
    id: "d2",
    label: "D2: Velocidad de detección de defectos",
    question: "¿La IA le permite encontrar bugs un paso antes y más rápido que el método convencional?",
  },
  {
    id: "d3",
    label: "D3: Robustez de decisiones automatizadas",
    question: "¿Tienen métricas confiables de falsos positivos y consistencia en los testeos?",
  },
  {
    id: "d4",
    label: "D4: Ahorro de tiempo por re-trabajo",
    question: "¿Se ha reducido el presupuesto de horas hombre destinadas a re-trabajo repetitivo?",
  },
  {
    id: "d5",
    label: "D5: Trazabilidad y auditoría de decisiones IA",
    question: "¿Pueden explicar y auditar por qué la IA tomó una decisión específica en producción?",
  },
];

const DIAGNOSTIC_LEVELS: DiagnosticLevel[] = [
  {
    range: "0-25",
    label: "INICIAL",
    badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
    feedback:
      "Su equipo aún no ha integrado IA de forma sistemática en QA. El riesgo de adopción desordenada es alto y puede generar más defectos de los que resuelve.",
  },
  {
    range: "26-50",
    label: "EN PROCESO",
    badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    feedback:
      "Su equipo ha adoptado algunas herramientas de IA, pero falta auditoría para convertir la velocidad percibida en eficiencia económica e impacto real.",
  },
  {
    range: "51-75",
    label: "AVANZADO",
    badgeColor: "bg-phd-cyan/15 text-phd-cyan border-phd-cyan/30",
    feedback:
      "Buena adopción con métricas claras. El siguiente paso es crear un sistema continuo de Quality Intelligence que opere de forma autónoma.",
  },
  {
    range: "76-100",
    label: "REFERENTE",
    badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
    feedback:
      "Su organización es un referente en Quality Engineering con IA. PHD puede ayudarle a certificar y escalar este modelo a otros equipos.",
  },
];

function getDiagnosticLevel(score: number): DiagnosticLevel {
  if (score <= 25) return DIAGNOSTIC_LEVELS[0];
  if (score <= 50) return DIAGNOSTIC_LEVELS[1];
  if (score <= 75) return DIAGNOSTIC_LEVELS[2];
  return DIAGNOSTIC_LEVELS[3];
}

// El SVG tiene radio=80, centro en (100,100), perímetro = 2 * π * 80 ≈ 502.65
const SVG_RADIUS = 80;
const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS;

function calcDashOffset(score: number): number {
  return SVG_CIRCUMFERENCE * (1 - score / 100);
}

export default function AqiTool() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(DIMENSIONS.map((d) => [d.id, 10]))
  );

  const totalScore = useMemo(
    () => Object.values(scores).reduce((sum, v) => sum + v, 0),
    [scores]
  );

  const level = getDiagnosticLevel(totalScore);
  const dashOffset = calcDashOffset(totalScore);

  return (
    <section id="aqi-tool" className="bg-phd-dark py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-phd-cyan mb-4">
            Mide tu Inteligencia Artificial
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white tracking-tight">
            ¿Tu IA realmente{" "}
            <span className="text-phd-cyan">funciona</span> en QA?
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            No le preguntamos si usa IA. Le decimos si de verdad está rindiendo.
            El <strong className="text-white">AI Quality Index (AQI)</strong> es
            un estándar exclusivo de PHD diseñado bajo lineamientos del ISTQB.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Panel de sliders */}
          <div className="phd-glass p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-white text-lg">
                Autoevaluación Corta AQI
              </h3>
              <span className="text-xs text-slate-500">
                Deslice cada parámetro (0 – 20 pts)
              </span>
            </div>

            {DIMENSIONS.map((dim) => (
              <div key={dim.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-300">
                    {dim.label}
                  </label>
                  <span className="text-phd-cyan font-bold text-sm font-mono">
                    {scores[dim.id]} pts
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={scores[dim.id]}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [dim.id]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-phd-cyan"
                />
                <p className="text-xs text-slate-500">{dim.question}</p>
              </div>
            ))}
          </div>

          {/* Panel de resultado */}
          <div className="phd-glass p-8 flex flex-col items-center gap-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
              Su Puntaje AQI Estimado
            </p>

            {/* Marcador SVG circular */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full -rotate-90"
              >
                {/* Pista de fondo */}
                <circle
                  cx="100"
                  cy="100"
                  r={SVG_RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="12"
                />
                {/* Arco de progreso con gradiente */}
                <defs>
                  <linearGradient id="aqi-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r={SVG_RADIUS}
                  fill="none"
                  stroke="url(#aqi-gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={SVG_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              {/* Score en el centro */}
              <div className="flex flex-col items-center z-10">
                <span className="font-heading font-bold text-white text-6xl leading-none">
                  {totalScore}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                  Sugerido
                </span>
              </div>
            </div>

            {/* Badge de nivel */}
            <div
              id="aqi-badge-container"
              className={`border rounded-full px-5 py-2 text-sm font-bold tracking-wider ${level.badgeColor}`}
            >
              {level.range} · {level.label}
            </div>

            {/* Feedback */}
            <p className="text-sm text-slate-400 text-center leading-relaxed max-w-xs">
              {level.feedback}
            </p>

            {/* CTA */}
            <Link
              href="/#bookings"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-phd-cyan hover:bg-phd-cyan/90 text-phd-dark font-bold px-6 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 text-sm"
            >
              Certificar mi AQI con PHD
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
