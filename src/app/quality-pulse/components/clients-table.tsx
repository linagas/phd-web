"use client";
import { Fragment, ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  buildClientRows,
  buildReviewHref,
  canPublish,
  ClientRow,
  derivePublicationState,
  filterRowsByName,
  formatCompletion,
  formatRowScore,
  PublicationState,
} from "@/utils/quality-pulse/admin-view-models";

interface ClientsTableProps {
  clients: QualityPulseClient[];
  submissions: QualityPulseAssessment[];
  catalog: CatalogQuestion[];
  selectedClientKey: string;
  onToggleClient: (clientKey: string) => void;
  onDelete?: (clientKey: string) => void;
  /** Slot para el panel de detalle expandible (Fase 4 lo completa con las acciones existentes). */
  renderExpandedRow?: (row: ClientRow) => ReactNode;
}

/** Acentos por estado de publicación (D: color mapping): cyan = Publicado, purple = Pendiente de revisión, slate = En progreso. */
const STATE_BADGE_CLASSES: Record<PublicationState, string> = {
  Publicado: "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan",
  "Pendiente de revisión": "border-phd-purple/30 bg-phd-purple/10 text-phd-purple",
  "En progreso": "border-white/10 bg-white/5 text-slate-400",
};

function badgeClassName(extra = ""): string {
  return `text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border whitespace-nowrap ${extra}`;
}

function StateBadge({ state }: { state: PublicationState }) {
  return <span className={badgeClassName(STATE_BADGE_CLASSES[state])}>{state}</span>;
}

function RegistrationBadge({ isRegistered }: { isRegistered: boolean }) {
  if (isRegistered) return null;
  return (
    <span className={badgeClassName("border-dashed border-white/20 bg-transparent text-slate-500")}>
      No registrado
    </span>
  );
}

/**
 * Tabla de clientes Quality Pulse (spec `qp-admin-clients-table`): lista
 * registrados + legacy, con búsqueda, y la acción "Publicar" a nivel de fila.
 * Deriva todo con `buildClientRows`/`derivePublicationState`/`canPublish` de
 * `admin-view-models.ts` para que el score coincida con el backend (D1). No
 * hace fetch — el container (`AdminPanel`) sigue dueño de la carga de datos.
 * "Publicar" es un `<Link href={buildReviewHref(clientKey)}>` hacia
 * `/revisar` (la publicación real vive en `PublishReviewView`); su `onClick`
 * llama `stopPropagation` para no togglear la fila expandible.
 */
export default function ClientsTable({
  clients,
  submissions,
  catalog,
  selectedClientKey,
  onToggleClient,
  onDelete,
  renderExpandedRow,
}: ClientsTableProps) {
  const [query, setQuery] = useState("");
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState("");

  const rows = useMemo(
    () => buildClientRows(clients, submissions, catalog),
    [clients, submissions, catalog]
  );
  const visibleRows = useMemo(() => filterRowsByName(rows, query), [rows, query]);

  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-heading font-semibold text-white text-lg">Clientes</h2>
        <div className="w-full sm:w-72">
          <label htmlFor="clients-table-search" className="sr-only">
            Buscar cliente
          </label>
          <input
            id="clients-table-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-phd-cyan/50"
          />
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <p className="text-sm text-slate-500">No se encontraron clientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Cliente</th>
                <th className="pb-3 px-4">Completitud</th>
                <th className="pb-3 px-4">Score</th>
                <th className="pb-3 px-4">Estado</th>
                <th className="pb-3 pl-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const state = derivePublicationState(row);
                const expanded = selectedClientKey === row.clientKey;
                return (
                  <Fragment key={row.clientKey}>
                    <tr
                      className="border-t border-white/5 cursor-pointer hover:bg-white/5"
                      onClick={() => onToggleClient(row.clientKey)}
                    >
                      <td className="py-3 pr-4 text-sm text-white font-semibold">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{row.clientName}</span>
                          <RegistrationBadge isRegistered={row.isRegistered} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-200">
                        {formatCompletion(row.answeredCount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-200">
                        {formatRowScore(row.healthScore)}
                      </td>
                      <td className="py-3 px-4">
                        <StateBadge state={state} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {canPublish(row) && (
                          <Link
                            href={buildReviewHref(row.clientKey)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold bg-phd-cyan/10 hover:bg-phd-cyan/20 border border-phd-cyan/30 text-phd-cyan rounded-full px-4 py-1.5 transition-all"
                          >
                            Publicar
                          </Link>
                        )}
                        {row.isRegistered && onDelete && (
                          <span className="inline-flex items-center gap-2 ml-2">
                            {confirmingDeleteKey === row.clientKey ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmingDeleteKey("");
                                    onDelete(row.clientKey);
                                  }}
                                  className="text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full px-4 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Confirmar eliminación
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmingDeleteKey("");
                                  }}
                                  className="text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full px-4 py-1.5"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingDeleteKey(row.clientKey);
                                }}
                                className="text-xs text-slate-400 hover:text-phd-pink transition-colors disabled:opacity-40"
                              >
                                Eliminar
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                    {expanded && renderExpandedRow && (
                      <tr className="border-t border-white/5 bg-white/[0.02]">
                        <td colSpan={5} className="p-0">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
