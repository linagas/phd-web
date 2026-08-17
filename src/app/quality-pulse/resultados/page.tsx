import { Suspense } from "react";
import ResultsView from "./components/results-view";

export default function QualityPulseResultsPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center">
          <p className="text-slate-400 text-sm">Cargando resultados…</p>
        </section>
      }
    >
      <ResultsView />
    </Suspense>
  );
}
