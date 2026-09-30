"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CatalogQuestion } from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { QualityPulseClient } from "@/models/quality-pulse/client-model";
import {
  buildClientRows,
  buildReviewHref,
  canPublish,
  countRowsByState,
  derivePublicationState,
  filterRowsByName,
  filterRowsByState,
  formatLastUpdate,
  paginateRows,
  StateFilter,
} from "@/utils/quality-pulse/admin-view-models";
import ClientProgressCell from "./client-progress-cell";
import ClientRowMenu from "./client-row-menu";
import ClientScorePill from "./client-score-pill";
import { RegistrationBadge, StateBadge } from "./publication-badges";
import ClientsTablePagination from "./clients-table-pagination";

const PAGE_SIZE = 10;

const FILTER_CHIPS: { value: StateFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "En progreso", label: "En progreso" },
  { value: "Pendiente de revisión", label: "Pendiente de revisión" },
  { value: "Publicado", label: "Publicado" },
];

interface ClientsTableProps {
  clients: QualityPulseClient[];
  submissions: QualityPulseAssessment[];
  catalog: CatalogQuestion[];
  onDelete?: (clientKey: string) => void;
}

/**
 * Tabla de clientes Quality Pulse (spec `qp-admin-clients-table`): lista
 * registrados + legacy con búsqueda, filtros rápidos por estado de publicación,
 * paginación (10 por página) y acciones por fila ("Ver ficha" + menú kebab con
 * "Publicar" / "Eliminar"). Deriva todo con helpers puros de
 * `admin-view-models.ts`. No hace fetch: `AdminPanel` sigue dueño de los datos.
 * "Publicar" es un `<Link href={buildReviewHref(clientKey)}>` hacia `/revisar`.
 */
export default function ClientsTable({
  clients,
  submissions,
  catalog,
  onDelete,
}: ClientsTableProps) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [page, setPage] = useState(1);
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState("");

  const rows = useMemo(
    () => buildClientRows(clients, submissions, catalog),
    [clients, submissions, catalog],
  );
  const counts = useMemo(() => countRowsByState(rows), [rows]);
  const visibleRows = useMemo(
    () => filterRowsByState(filterRowsByName(rows, query), stateFilter),
    [rows, query, stateFilter],
  );
  const slice = useMemo(
    () => paginateRows(visibleRows, page, PAGE_SIZE),
    [visibleRows, page],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const handleFilterChange = (value: StateFilter) => {
    setStateFilter(value);
    setPage(1);
  };

  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-heading font-semibold text-white text-lg">
          Clientes
        </h2>
        <div className="w-full sm:w-72">
          <label htmlFor="clients-table-search" className="sr-only">
            Buscar cliente
          </label>
          <input
            id="clients-table-search"
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-phd-cyan/50"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filtrar por estado"
        className="flex flex-wrap gap-2"
      >
        {FILTER_CHIPS.map((chip) => {
          const active = stateFilter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={active}
              onClick={() => handleFilterChange(chip.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan ${
                active
                  ? "border-phd-pink bg-phd-pink text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {chip.label} ({counts[chip.value]})
            </button>
          );
        })}
      </div>

      {visibleRows.length === 0 ? (
        <p className="text-sm text-slate-500">No se encontraron clientes.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="pb-3 pr-4">
                    Cliente
                  </th>
                  <th scope="col" className="pb-3 px-4">
                    Avance 4 perfiles
                  </th>
                  <th scope="col" className="pb-3 px-4">
                    Score
                  </th>
                  <th scope="col" className="pb-3 px-4">
                    Estado de publicación
                  </th>
                  <th scope="col" className="pb-3 px-4">
                    Última actualización
                  </th>
                  <th scope="col" className="pb-3 pl-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {slice.items.map((row) => {
                  const state = derivePublicationState(row);
                  const confirming = confirmingDeleteKey === row.clientKey;
                  const canDelete = row.isRegistered && Boolean(onDelete);
                  return (
                    <tr
                      key={row.clientKey}
                      className="border-t border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 pr-4 text-sm text-white font-semibold">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{row.clientName}</span>
                          <RegistrationBadge isRegistered={row.isRegistered} />
                        </div>
                        {row.registeredBy && (
                          <p className="mt-0.5 text-xs font-normal text-slate-500">
                            Registrado por {row.registeredBy}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <ClientProgressCell
                          answeredCount={row.answeredCount}
                          profileScores={row.profileScores}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <ClientScorePill score={row.healthScore} />
                      </td>
                      <td className="py-3 px-4">
                        <StateBadge state={state} />
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300 whitespace-nowrap">
                        {formatLastUpdate(row.lastUpdatedAt)}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {confirming ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteKey("");
                                onDelete?.(row.clientKey);
                              }}
                              className="text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full px-4 py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
                            >
                              Confirmar eliminación
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteKey("");
                              }}
                              className="text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full px-4 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <Link
                              href={buildReviewHref(row.clientKey)}
                              aria-label={`Ver ficha de ${row.clientName}`}
                              className="text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full px-4 py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
                            >
                              Ver ficha
                            </Link>
                            <ClientRowMenu
                              clientName={row.clientName}
                              publishHref={
                                canPublish(row)
                                  ? buildReviewHref(row.clientKey)
                                  : undefined
                              }
                              onRequestDelete={
                                canDelete
                                  ? () => setConfirmingDeleteKey(row.clientKey)
                                  : undefined
                              }
                            />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ClientsTablePagination slice={slice} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
