import { Suspense } from "react";
import VerifyCallback from "./components/verify-callback";

export default function QualityPulseVerifyPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center">
          <p className="text-slate-400 text-sm">Verificando…</p>
        </section>
      }
    >
      <VerifyCallback />
    </Suspense>
  );
}
