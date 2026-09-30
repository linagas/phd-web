"use client";
import { useState } from "react";

interface ClientAdvancedActionsProps {
  clientName: string;
  isPublished: boolean;
  disabled: boolean;
  onUnpublish: () => void;
  onResetAll: () => void;
}

const RESET_ALL_CONFIRMATION_WORD = "REINICIAR";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan";

/** "Acciones avanzadas": unpublish (when published) and full client reset gated by a typed word. */
export default function ClientAdvancedActions({
  clientName,
  isPublished,
  disabled,
  onUnpublish,
  onResetAll,
}: ClientAdvancedActionsProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [input, setInput] = useState("");

  const closeReset = () => {
    setResetOpen(false);
    setInput("");
  };

  return (
    <section aria-labelledby="advanced-actions-title" className="print:hidden phd-glass rounded-2xl p-6 flex flex-col gap-4">
      <h2 id="advanced-actions-title" className="font-heading font-semibold text-white text-lg">
        Acciones avanzadas
      </h2>

      {isPublished && (
        <button
          type="button"
          onClick={onUnpublish}
          disabled={disabled}
          className={`w-fit text-sm text-slate-400 hover:text-phd-pink transition-colors disabled:opacity-50 ${FOCUS_RING}`}
        >
          Despublicar
        </button>
      )}

      {!resetOpen ? (
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className={`w-fit text-sm text-phd-pink hover:underline underline-offset-4 ${FOCUS_RING}`}
        >
          Reiniciar todo el cliente
        </button>
      ) : (
        <div className="flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-slate-300">
            Esto elimina las respuestas de los 4 perfiles de{" "}
            <span className="text-white font-semibold">{clientName}</span>.
          </p>
          <label htmlFor="reset-all-confirmation" className="text-sm text-slate-300">
            Escribe <span className="text-phd-pink font-bold">{RESET_ALL_CONFIRMATION_WORD}</span> para
            confirmar
          </label>
          <input
            id="reset-all-confirmation"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-pink/50"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetAll();
                closeReset();
              }}
              disabled={input !== RESET_ALL_CONFIRMATION_WORD || disabled}
              className={`flex-1 text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full py-2 disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
            >
              Confirmar reinicio total
            </button>
            <button
              type="button"
              onClick={closeReset}
              className={`flex-1 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full py-2 ${FOCUS_RING}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
