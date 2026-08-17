"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "verifying" | "error";

export default function VerifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    fetch(`/api/quality-pulse/admin/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.ok) {
          router.push("/administracion");
          return;
        }
        if (!cancelled) setStatus("error");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur flex items-center justify-center px-4 py-24">
      <div className="phd-glass rounded-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 text-center">
        {status === "verifying" ? (
          <p className="text-slate-300 text-sm">Verificando enlace de acceso…</p>
        ) : (
          <>
            <h1 className="font-heading font-bold text-white text-xl">
              Enlace inválido o expirado
            </h1>
            <p className="text-slate-400 text-sm">
              Solicita un nuevo enlace de acceso para continuar.
            </p>
            <Link
              href="/administracion/ingresar"
              className="w-full flex items-center justify-center bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all"
            >
              Volver a solicitar acceso
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
