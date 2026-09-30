"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/quality-pulse/admin/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error ?? "No se pudo procesar la solicitud. Inténtalo de nuevo.");
      }
    } catch {
      setErrorMsg("Error de red. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
      <div className="phd-glass rounded-2xl p-8 max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
            Quality Pulse · Administración
          </p>
          <h1 className="font-heading font-bold text-white text-2xl">Acceso de administrador</h1>
        </div>

        {sent ? (
          <p className="text-sm text-slate-300 text-center leading-relaxed">
            Si el correo está autorizado, te llegará un enlace de acceso en unos minutos.
            Revisa tu bandeja de entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="admin-email" className="text-sm font-semibold text-slate-300">
              Correo electrónico
            </label>
            <input
              id="admin-email"
              name="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@phdchile.cl"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-phd-cyan/50"
              required
              disabled={submitting}
            />

            {errorMsg && (
              <p role="alert" className="text-sm text-phd-pink">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-phd-pink/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? "Enviando..." : "Enviar enlace de acceso"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
