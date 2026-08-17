import { Suspense } from "react";
import QpHeader from "./components/qp-header";
import QualityPulseView from "./components/quality-pulse-view";

export default function QualityPulsePage() {
  return (
    <div className="bg-phd-dark">
      <QpHeader />
      <Suspense
        fallback={
          <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center">
            <p className="text-slate-400 text-sm">Cargando Quality Pulse…</p>
          </section>
        }
      >
        <QualityPulseView />
      </Suspense>
    </div>
  );
}
