"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
  QuestionOption,
} from "@/models/quality-pulse/catalog-question-model";

const QUESTIONS_SHEET_NAME = "05_Preguntas";
const OPTIONS_SHEET_NAME = "06_Respuestas_Reglas";

interface ImportResult {
  addedIds: string[];
  skippedIds: string[];
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "si" || normalized === "sí";
}

function parseList(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseProfiles(value: unknown): QualityPulseProfile[] {
  return parseList(value).filter((item): item is QualityPulseProfile =>
    (QUALITY_PULSE_PROFILES as readonly string[]).includes(item)
  );
}

function parseOutcomes(value: unknown): Record<string, number> {
  const outcomes: Record<string, number> = {};
  parseList(value).forEach((pair) => {
    const [key, rawValue] = pair.split(":").map((part) => part.trim());
    if (key && rawValue !== undefined && !Number.isNaN(Number(rawValue))) {
      outcomes[key] = Number(rawValue);
    }
  });
  return outcomes;
}

async function parseWorkbookToQuestions(file: File): Promise<CatalogQuestion[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const questionsSheet = workbook.Sheets[QUESTIONS_SHEET_NAME];
  const optionsSheet = workbook.Sheets[OPTIONS_SHEET_NAME];

  if (!questionsSheet || !optionsSheet) {
    throw new Error(
      `El archivo debe contener las hojas "${QUESTIONS_SHEET_NAME}" y "${OPTIONS_SHEET_NAME}".`
    );
  }

  const questionRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(questionsSheet, {
    defval: "",
  });
  const optionRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(optionsSheet, {
    defval: "",
  });

  const optionsByQuestionId = new Map<string, QuestionOption[]>();
  optionRows.forEach((row) => {
    const questionId = String(row.questionId ?? "").trim();
    if (!questionId) return;

    const option: QuestionOption = {
      label: String(row.label ?? ""),
      score: Number(row.score ?? 0),
      variable: String(row.variable ?? ""),
      signal: String(row.signal ?? ""),
      signalType: String(row.signalType ?? ""),
      priority: String(row.priority ?? ""),
      impact: String(row.impact ?? ""),
      outcomes: parseOutcomes(row.outcomes),
    };

    const existing = optionsByQuestionId.get(questionId) ?? [];
    existing.push(option);
    optionsByQuestionId.set(questionId, existing);
  });

  return questionRows
    .map((row) => String(row.id ?? "").trim())
    .filter((id) => id.length > 0)
    .map((id) => {
      const row = questionRows.find((r) => String(r.id ?? "").trim() === id) as Record<
        string,
        unknown
      >;
      const question: CatalogQuestion = {
        id,
        dimension: String(row.dimension ?? ""),
        dimensionId: String(row.dimensionId ?? ""),
        capability: String(row.capability ?? ""),
        capabilityId: String(row.capabilityId ?? ""),
        perspective: String(row.perspective ?? ""),
        text: String(row.text ?? ""),
        order: Number(row.order ?? 0),
        required: parseBoolean(row.required),
        status: String(row.status ?? "Activa"),
        objective: String(row.objective ?? ""),
        type: String(row.type ?? "Base"),
        origins: parseList(row.origins),
        profiles: parseProfiles(row.profiles),
        options: optionsByQuestionId.get(id) ?? [],
      };
      return question;
    });
}

export default function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [editText, setEditText] = useState("");
  const [editStatus, setEditStatus] = useState("Activa");
  const [editOrder, setEditOrder] = useState(0);
  const [editObjective, setEditObjective] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quality-pulse/admin/catalog");
      if (!res.ok) throw new Error("No se pudo cargar el catálogo.");
      const data: CatalogQuestion[] = await res.json();
      setCatalog(data);
    } catch {
      setError("No se pudo cargar el catálogo de preguntas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const selectedQuestion = catalog.find((question) => question.id === selectedQuestionId);

  useEffect(() => {
    if (!selectedQuestion) return;
    setEditText(selectedQuestion.text);
    setEditStatus(selectedQuestion.status);
    setEditOrder(selectedQuestion.order);
    setEditObjective(selectedQuestion.objective);
    setEditSuccess(false);
    setEditError("");
  }, [selectedQuestion]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError("");
    setImportResult(null);

    try {
      const questions = await parseWorkbookToQuestions(file);
      if (questions.length === 0) {
        throw new Error("No se encontraron preguntas válidas en el archivo.");
      }

      const res = await fetch("/api/quality-pulse/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "El catálogo no pasó la validación."
        );
      }

      const result: ImportResult = await res.json();
      setImportResult(result);
      await loadCatalog();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "No se pudo importar el catálogo.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedQuestion) return;
    setSavingEdit(true);
    setEditError("");
    setEditSuccess(false);

    const updatedQuestion: CatalogQuestion = {
      ...selectedQuestion,
      text: editText,
      status: editStatus,
      order: editOrder,
      objective: editObjective,
    };

    try {
      const res = await fetch("/api/quality-pulse/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuestion),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "No se pudo guardar el cambio.");
      }

      setEditSuccess(true);
      await loadCatalog();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo guardar el cambio.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-white text-lg">Gestión del catálogo</h2>
        <p className="text-sm text-slate-500">{catalog.length} preguntas cargadas</p>
      </div>

      {loading && <p className="text-slate-400 text-sm">Cargando catálogo…</p>}
      {error && (
        <p role="alert" className="text-sm text-phd-pink">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-300">
              Carga incremental desde Excel
            </h3>
            <p className="text-xs text-slate-500">
              El archivo debe tener las hojas &ldquo;{QUESTIONS_SHEET_NAME}&rdquo; y &ldquo;
              {OPTIONS_SHEET_NAME}&rdquo;, con columnas id, dimension, dimensionId, capability,
              capabilityId, perspective, text, order, required, status, objective, type, origins,
              profiles (05) y questionId, label, score, variable, signal, signalType, priority,
              impact, outcomes (06).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
              className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-phd-pink file:text-white file:font-semibold file:cursor-pointer disabled:opacity-50"
            />
            {importing && <p className="text-xs text-slate-400">Importando…</p>}
            {importError && (
              <p role="alert" className="text-xs text-phd-pink">
                {importError}
              </p>
            )}
            {importResult && (
              <p className="text-xs text-phd-cyan">
                {importResult.addedIds.length} preguntas agregadas,{" "}
                {importResult.skippedIds.length} omitidas por id duplicado.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
            <h3 className="text-sm font-semibold text-slate-300">Editar pregunta existente</h3>
            <label htmlFor="question-select" className="sr-only">
              Seleccionar pregunta
            </label>
            <select
              id="question-select"
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
            >
              <option value="" className="bg-phd-dark">
                Selecciona una pregunta…
              </option>
              {catalog.map((question) => (
                <option key={question.id} value={question.id} className="bg-phd-dark">
                  {question.id} — {question.text.slice(0, 60)}
                </option>
              ))}
            </select>

            {selectedQuestion && (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm text-slate-300">
                  Texto
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    rows={3}
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm text-slate-300">
                    Estado
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    >
                      <option value="Activa" className="bg-phd-dark">
                        Activa
                      </option>
                      <option value="Inactiva" className="bg-phd-dark">
                        Inactiva
                      </option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-300">
                    Orden
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1 text-sm text-slate-300">
                  Objetivo
                  <textarea
                    value={editObjective}
                    onChange={(e) => setEditObjective(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    rows={2}
                  />
                </label>

                {editError && (
                  <p role="alert" className="text-sm text-phd-pink">
                    {editError}
                  </p>
                )}
                {editSuccess && <p className="text-sm text-phd-cyan">Cambios guardados.</p>}

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="w-fit bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
