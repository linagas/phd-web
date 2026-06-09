"use client";
import { useState } from "react";
import Link from "next/link";

interface Metrics {
  rework: number;
  productionRisk: number;
  hoursLost: number;
  roiWithPhd: number;
}

function calculateMetrics(presupuesto: number, numDevs: number): Metrics {
  const rework = presupuesto * 0.4;
  const productionRisk = presupuesto * 1.2;
  const hoursLost = numDevs * 64;
  const roiWithPhd = rework * 0.3;
  return { rework, productionRisk, hoursLost, roiWithPhd };
}

const METHODOLOGY = [
  {
    label: "Stripe Research",
    detail: "La tasa de desperdicio del 40% se basa en el reporte 'Developer Coefficient'.",
  },
  {
    label: "IBM Curve",
    detail: "Solucionar bugs en producción cuesta 3× más que en etapas de diseño.",
  },
  {
    label: "NIST",
    detail: "El costo de software de baja calidad en EE.UU supera los $2.4 trillones anuales.",
  },
];

const METRIC_CARDS = [
  {
    id: "rework" as keyof Metrics,
    label: "Re-trabajo silencioso",
    description: "Presupuesto mensual quemado rehaciendo código ineficiente.",
    source: "Stripe Study",
    accentColor: "border-phd-pink",
    valueColor: "text-white",
  },
  {
    id: "productionRisk" as keyof Metrics,
    label: "Riesgo en producción",
    description: "Costo real proyectado de solucionar y parchar bugs directamente en producción (3× más caro).",
    source: "IBM Curve",
    accentColor: "border-phd-purple",
    valueColor: "text-white",
  },
  {
    id: "hoursLost" as keyof Metrics,
    label: "Horas desperdiciadas",
    description: "Tiempo de tus ingenieros no invertido en crear features de valor.",
    source: "160h Benchmark",
    accentColor: "border-phd-cyan",
    valueColor: "text-white",
    suffix: "hrs",
  },
  {
    id: "roiWithPhd" as keyof Metrics,
    label: "Retorno con PHD",
    description: "Retorno financiero estimado reduciendo tu desperdicio inicial un 30% en los primeros 90 días.",
    source: "H1 ROI",
    accentColor: "border-green-400",
    valueColor: "text-green-400",
  },
];

export default function RoiCalculator() {
  const [presupuesto, setPresupuesto] = useState(1000);
  const [numDevs, setNumDevs] = useState(15);

  const metrics = calculateMetrics(presupuesto, numDevs);

  return (
    <section id="dolor" className="bg-phd-dark py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-phd-cyan mb-4">
            El costo real que nadie mide
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-white tracking-tight">
            ¿Cuánto te está costando{" "}
            <span className="text-phd-cyan">no saber</span> tu calidad?
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            La mayoría de las empresas pierden millones en re-trabajo silencioso
            que no está registrado en ningún Jira. Calcula tu pérdida estimada
            basada en estudios de mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Panel de sliders */}
          <div className="phd-glass p-8 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <svg className="text-phd-cyan" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="font-heading font-semibold text-white text-lg">Configure su Equipo</span>
            </div>

            {/* Slider presupuesto */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">
                  Presupuesto Mensual Dev (UF)
                </label>
                <span className="text-phd-cyan font-bold font-mono">
                  {presupuesto.toLocaleString("es-CL")} UF
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={presupuesto}
                onChange={(e) => setPresupuesto(Number(e.target.value))}
                className="w-full accent-phd-cyan"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>100 UF</span>
                <span>5.000 UF</span>
                <span>10.000 UF</span>
              </div>
            </div>

            {/* Slider devs */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">
                  N° de Ingenieros / Devs
                </label>
                <span className="text-phd-cyan font-bold font-mono">{numDevs}</span>
              </div>
              <input
                type="range"
                min={3}
                max={150}
                step={1}
                value={numDevs}
                onChange={(e) => setNumDevs(Number(e.target.value))}
                className="w-full accent-phd-cyan"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>3 DEVS</span>
                <span>75 DEVS</span>
                <span>150 DEVS</span>
              </div>
            </div>

            {/* Respaldo metodológico */}
            <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Respaldo metodológico de las variables:
              </p>
              {METHODOLOGY.map(({ label, detail }) => (
                <p key={label} className="text-xs text-slate-500">
                  <span className="text-phd-cyan font-semibold">{label}: </span>
                  {detail}
                </p>
              ))}
            </div>
          </div>

          {/* Panel de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {METRIC_CARDS.map(({ id, label, description, source, accentColor, valueColor, suffix }) => (
              <div
                key={id}
                className={`phd-glass p-6 flex flex-col gap-2 border-l-4 ${accentColor}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <span className="text-xs text-phd-cyan underline underline-offset-2 cursor-default">
                    {source}
                  </span>
                </div>
                <p className={`font-heading font-bold text-3xl ${valueColor}`}>
                  {suffix
                    ? `${metrics[id].toLocaleString("es-CL")} ${suffix}`
                    : `${metrics[id].toLocaleString("es-CL")} UF`}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/#bookings"
            className="inline-flex items-center gap-2 bg-phd-cyan hover:bg-phd-cyan/90 text-phd-dark font-bold px-8 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
          >
            Reducir este desperdicio con PHD
          </Link>
        </div>

      </div>
    </section>
  );
}
