"use client";
import { useMemo } from "react";
import Link from "next/link";

interface ClientNotFoundProps {
  clientName: string;
  onRetry?: () => void;
}

export default function ClientNotFound({ clientName, onRetry }: ClientNotFoundProps) {
  const traceId = useMemo(() => crypto.randomUUID(), []);
  const timestamp = useMemo(() => new Date().toISOString(), []);

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
      <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-phd-card overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <span className="w-2.5 h-2.5 rounded-full bg-phd-pink" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">
            SYS.ERR.404_CLIENT_NOT_FOUND
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 text-center px-8 py-10">
          <span className="relative flex items-center justify-center w-20 h-20">
            <span className="absolute inset-0 rounded-full border border-dashed border-phd-pink/40" />
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-phd-pink/15">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-phd-pink" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4v18M13 21V11h6v10M8 9h1m-1 4h1m-1 4h1" />
                <path strokeLinecap="round" strokeWidth={2} d="M4 4l16 16" />
              </svg>
            </span>
          </span>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-bold text-white text-2xl">Cliente no registrado</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              No hemos podido encontrar la organización{" "}
              <span className="text-slate-300 font-semibold">&ldquo;{clientName}&rdquo;</span> en
              nuestros registros de alta disponibilidad. Verifique las credenciales e intente
              nuevamente.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="border border-phd-pink/40 text-phd-pink hover:bg-phd-pink/10 text-xs font-bold tracking-widest uppercase rounded-full px-6 py-3 transition-colors"
              >
                Volver a intentar
              </button>
            ) : (
              <Link
                href="/quality-pulse"
                className="border border-phd-pink/40 text-phd-pink hover:bg-phd-pink/10 text-xs font-bold tracking-widest uppercase rounded-full px-6 py-3 transition-colors"
              >
                Volver a intentar
              </Link>
            )}
            <a
              href="mailto:contacto@phdchile.cl"
              className="flex items-center gap-1.5 text-sm text-phd-cyan hover:text-phd-cyan/80 transition-colors"
            >
              Contactar Soporte
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 bg-black/20 font-mono text-[10px] leading-relaxed text-slate-600">
          <p>&gt; TRACE_ID: {traceId}</p>
          <p>&gt; TIMESTAMP: {timestamp}</p>
          <p>&gt; NODE_STATUS: DEGRADED_STATE_DETECTED</p>
        </div>
      </div>
    </section>
  );
}
