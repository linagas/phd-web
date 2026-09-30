import { buildPageRange, PageSlice } from "@/utils/quality-pulse/admin-view-models";

interface ClientsTablePaginationProps {
  slice: Pick<PageSlice<unknown>, "page" | "totalPages" | "total" | "from" | "to">;
  onPageChange: (page: number) => void;
}

const BUTTON_BASE =
  "min-w-[2rem] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan disabled:opacity-40 disabled:cursor-not-allowed";

export default function ClientsTablePagination({ slice, onPageChange }: ClientsTablePaginationProps) {
  const { page, totalPages, total, from, to } = slice;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-slate-500" aria-live="polite">
        Mostrando {from}-{to} de {total} clientes registrados
      </p>
      <nav aria-label="Paginación de clientes" className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${BUTTON_BASE} border-white/10 bg-white/5 text-slate-300 hover:bg-white/10`}
        >
          Anterior
        </button>
        {buildPageRange(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`gap-${index}`} className="px-1 text-slate-500" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Página ${item}`}
              className={`${BUTTON_BASE} ${
                item === page
                  ? "border-phd-pink bg-phd-pink text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${BUTTON_BASE} border-white/10 bg-white/5 text-slate-300 hover:bg-white/10`}
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
}
