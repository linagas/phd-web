"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import { buildClientRows, ClientRow } from "@/utils/quality-pulse/admin-view-models";
import ClientsTable from "./clients-table";

interface AdminPanelProps {
  adminEmail: string;
}

const RESET_ALL_CONFIRMATION_WORD = "REINICIAR";
const PUBLICATION_ENDPOINT = "/api/quality-pulse/admin/publication";

async function exportToExcel(
  submissions: QualityPulseAssessment[],
  catalog: CatalogQuestion[]
): Promise<void> {
  const XLSX = await import("xlsx");
  const questionsById = new Map(catalog.map((question) => [question.id, question]));

  const rows = submissions.flatMap((submission) =>
    Object.entries(submission.answers).map(([questionId, optionIndex]) => {
      const question = questionsById.get(questionId);
      const option = question?.options[optionIndex];
      return {
        Cliente: submission.clientName,
        Perfil: submission.profile,
        "Pregunta ID": questionId,
        Pregunta: question?.text ?? "",
        Dimensión: question?.dimension ?? "",
        Perspectiva: question?.perspective ?? "",
        Respuesta: option?.label ?? "",
        Score: option?.score ?? "",
        "Fecha de respuesta": new Date(submission.submittedAt).toLocaleString("es-CL"),
      };
    })
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Respuestas");
  XLSX.writeFile(workbook, `quality-pulse-respuestas-${Date.now()}.xlsx`);
}

export default function AdminPanel({ adminEmail }: AdminPanelProps) {
  const [submissions, setSubmissions] = useState<QualityPulseAssessment[]>([]);
  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [clients, setClients] = useState<QualityPulseClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedClientKey, setSelectedClientKey] = useState<string>("");
  const [resetProfileTarget, setResetProfileTarget] = useState<QualityPulseProfile | null>(null);
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [resetAllInput, setResetAllInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [deletedOpen, setDeletedOpen] = useState(false);
  const [deletedClients, setDeletedClients] = useState<QualityPulseClient[]>([]);
  const [deletedError, setDeletedError] = useState("");
  const [restoring, setRestoring] = useState(false);

  const [newClientName, setNewClientName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [submissionsRes, catalogRes, clientsRes] = await Promise.all([
        fetch("/api/quality-pulse/assessments"),
        fetch("/api/quality-pulse/catalog"),
        fetch("/api/quality-pulse/clients"),
      ]);

      if (!submissionsRes.ok || !catalogRes.ok || !clientsRes.ok) {
        throw new Error("No se pudo cargar la información.");
      }

      const submissionsData: QualityPulseAssessment[] = await submissionsRes.json();
      const catalogData: CatalogQuestion[] = await catalogRes.json();
      const clientsData: QualityPulseClient[] = await clientsRes.json();
      setSubmissions(submissionsData);
      setCatalog(catalogData);
      setClients(clientsData);
    } catch {
      setError("No se pudo cargar la información de administración.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegisterClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = newClientName.trim();
    if (!trimmed) return;

    setRegistering(true);
    setRegisterError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo registrar el cliente.");
      }
      setNewClientName("");
      await loadData();
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "No se pudo registrar el cliente.");
    } finally {
      setRegistering(false);
    }
  };

  const clientRows = useMemo(
    () => buildClientRows(clients, submissions, catalog),
    [clients, submissions, catalog]
  );

  // Fila expandida (D: "Default expansion" = colapsada). A diferencia del
  // `<select>` previo, no se auto-selecciona la primera fila.
  const handleToggleClient = (clientKey: string) => {
    setSelectedClientKey((prev) => (prev === clientKey ? "" : clientKey));
    setResetProfileTarget(null);
    setResetAllOpen(false);
    setResetAllInput("");
    setActionError("");
  };

  const handleResetProfile = async (profile: QualityPulseProfile) => {
    if (!selectedClientKey) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: selectedClientKey, profile }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo reiniciar el perfil.");
      }
      setResetProfileTarget(null);
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo reiniciar el perfil.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (!selectedClientKey || resetAllInput !== RESET_ALL_CONFIRMATION_WORD) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: selectedClientKey, resetAll: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo reiniciar el cliente.");
      }
      setResetAllOpen(false);
      setResetAllInput("");
      setSelectedClientKey("");
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo reiniciar el cliente.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(submissions, catalog);
    } finally {
      setExporting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedClientKey) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(PUBLICATION_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: selectedClientKey }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo despublicar el cliente.");
      }
      await loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo despublicar el cliente.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async (clientKey: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo eliminar el cliente.");
      }
      setClients((prev) => prev.filter((client) => client.clientKey !== clientKey));
      setSubmissions((prev) => prev.filter((submission) => submission.clientKey !== clientKey));
      setSelectedClientKey((prev) => (prev === clientKey ? "" : prev));
      if (deletedOpen) await loadDeleted();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar el cliente.");
    } finally {
      setActionLoading(false);
    }
  };

  const loadDeleted = async () => {
    setDeletedError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/clients/deleted");
      if (!res.ok) {
        throw new Error("No se pudo cargar los clientes eliminados.");
      }
      setDeletedClients(await res.json());
    } catch (err) {
      setDeletedError(
        err instanceof Error ? err.message : "No se pudo cargar los clientes eliminados."
      );
    }
  };

  const handleToggleDeleted = async () => {
    const next = !deletedOpen;
    setDeletedOpen(next);
    if (next) await loadDeleted();
  };

  const handleRestoreClient = async (clientKey: string) => {
    setRestoring(true);
    setDeletedError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/clients/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo restaurar el cliente.");
      }
      setDeletedClients((prev) => prev.filter((client) => client.clientKey !== clientKey));
      await loadData();
    } catch (err) {
      setDeletedError(err instanceof Error ? err.message : "No se pudo restaurar el cliente.");
    } finally {
      setRestoring(false);
    }
  };

  function renderExpandedRow(row: ClientRow) {
    return (
      <div className="p-6 sm:p-8 flex flex-col gap-4">
        {row.isPublished && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={actionLoading}
              className="text-xs text-slate-400 hover:text-phd-pink transition-colors disabled:opacity-50"
            >
              Despublicar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUALITY_PULSE_PROFILES.map((profile) => {
            const answered =
              row.profileScores.find((score) => score.profile === profile)?.status === "answered";
            const confirming = resetProfileTarget === profile;
            return (
              <div
                key={profile}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">{profile}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 border ${
                      answered
                        ? "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan"
                        : "border-white/10 bg-white/5 text-slate-500"
                    }`}
                  >
                    {answered ? "Respondido" : "Pendiente"}
                  </span>
                </div>
                {answered &&
                  (confirming ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetProfile(profile)}
                        disabled={actionLoading}
                        className="flex-1 text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full py-1.5 disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetProfileTarget(null)}
                        className="flex-1 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full py-1.5"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResetProfileTarget(profile)}
                      className="text-xs text-slate-400 hover:text-phd-pink transition-colors text-left"
                    >
                      Reiniciar perfil
                    </button>
                  ))}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/5">
          {!resetAllOpen ? (
            <button
              type="button"
              onClick={() => setResetAllOpen(true)}
              className="text-sm text-phd-pink hover:underline underline-offset-4"
            >
              Reiniciar todo el cliente
            </button>
          ) : (
            <div className="flex flex-col gap-3 max-w-sm">
              <p className="text-sm text-slate-300">
                Esto elimina las respuestas de los 4 perfiles de{" "}
                <span className="text-white font-semibold">{row.clientName}</span>. Escribe{" "}
                <span className="text-phd-pink font-bold">REINICIAR</span> para confirmar.
              </p>
              <input
                type="text"
                value={resetAllInput}
                onChange={(e) => setResetAllInput(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-pink/50"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={resetAllInput !== RESET_ALL_CONFIRMATION_WORD || actionLoading}
                  className="flex-1 text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirmar reinicio total
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetAllOpen(false);
                    setResetAllInput("");
                  }}
                  className="flex-1 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
              Quality Pulse · Administración
            </p>
            <h1 className="font-heading font-bold text-white text-3xl">Clientes</h1>
          </div>
          <p className="text-sm text-slate-400">
            Sesión activa: <span className="text-white">{adminEmail}</span>
          </p>
        </div>

        {loading && <p className="text-slate-400 text-sm">Cargando datos…</p>}
        {error && (
          <p role="alert" className="text-sm text-phd-pink">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="font-heading font-semibold text-white text-lg">
                  Registro y exportación
                </h2>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || submissions.length === 0}
                  className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-5 py-2 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {exporting ? "Exportando..." : "Exportar respuestas a Excel"}
                </button>
              </div>

              <form
                onSubmit={handleRegisterClient}
                className="flex flex-col sm:flex-row gap-3"
              >
                <label htmlFor="new-client-name" className="sr-only">
                  Registrar nuevo cliente
                </label>
                <input
                  id="new-client-name"
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nombre de la nueva empresa"
                  disabled={registering}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-phd-cyan/50"
                />
                <button
                  type="submit"
                  disabled={registering || newClientName.trim() === ""}
                  className="text-sm bg-phd-cyan/10 hover:bg-phd-cyan/20 border border-phd-cyan/30 text-phd-cyan font-semibold px-5 py-2.5 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {registering ? "Registrando..." : "Registrar cliente"}
                </button>
              </form>
              {registerError && (
                <p role="alert" className="text-sm text-phd-pink -mt-3">
                  {registerError}
                </p>
              )}
            </div>

            {actionError && (
              <p role="alert" className="text-sm text-phd-pink">
                {actionError}
              </p>
            )}

            {clientRows.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay clientes registrados.</p>
            ) : (
              <ClientsTable
                clients={clients}
                submissions={submissions}
                catalog={catalog}
                selectedClientKey={selectedClientKey}
                onToggleClient={handleToggleClient}
                onDelete={handleDeleteClient}
                renderExpandedRow={renderExpandedRow}
              />
            )}

            <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleToggleDeleted}
                aria-expanded={deletedOpen}
                className="flex w-full items-center justify-between text-sm text-slate-300 hover:text-white font-semibold"
              >
                Eliminados
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-5 w-5 transition-transform ${deletedOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {deletedOpen && (
                <>
                  {deletedError && (
                    <p role="alert" className="text-sm text-phd-pink">
                      {deletedError}
                    </p>
                  )}
                  {deletedClients.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay clientes eliminados.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {deletedClients.map((client) => (
                        <li
                          key={client.clientKey}
                          className="flex items-center justify-between gap-4 text-sm text-slate-200"
                        >
                          <span>{client.clientName}</span>
                          <button
                            type="button"
                            disabled={restoring}
                            onClick={() => handleRestoreClient(client.clientKey)}
                            className="text-xs font-semibold bg-phd-cyan/10 hover:bg-phd-cyan/20 border border-phd-cyan/30 text-phd-cyan rounded-full px-4 py-1.5 transition-all disabled:opacity-40"
                          >
                            Restaurar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
