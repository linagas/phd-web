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

function parseOrigins(value: unknown, excludeId?: string): string[] {
  return String(value ?? "")
    .split(/[/;,]/)
    .map((item) => item.trim().toUpperCase())
    .filter((item) => /^Q\d+$/i.test(item) && item !== excludeId);
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
  const [editRequired, setEditRequired] = useState(false);
  const [editType, setEditType] = useState("Base");
  const [editOriginsText, setEditOriginsText] = useState("");
  const [editProfiles, setEditProfiles] = useState<QualityPulseProfile[]>([]);
  const [editOptions, setEditOptions] = useState<QuestionOption[]>([]);
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
    setEditRequired(selectedQuestion.required);
    setEditType(selectedQuestion.type);
    setEditOriginsText(selectedQuestion.origins.join(", "));
    setEditProfiles(selectedQuestion.profiles);
    setEditOptions(selectedQuestion.options);
    setEditSuccess(false);
    setEditError("");
  }, [selectedQuestion]);

  const toggleEditProfile = (profile: QualityPulseProfile, checked: boolean) => {
    setEditProfiles((current) =>
      checked ? [...current, profile] : current.filter((item) => item !== profile)
    );
  };

  const updateEditOption = (index: number, patch: Partial<QuestionOption>) => {
    setEditOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );
  };

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
      required: editRequired,
      type: editType,
      origins: parseOrigins(editOriginsText, selectedQuestion.id),
      profiles: editProfiles,
      options: editOptions,
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
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/10 bg-white/5 text-slate-300">
                    {selectedQuestion.dimensionId}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/10 bg-white/5 text-slate-300">
                    {selectedQuestion.capabilityId}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border border-white/10 bg-white/5 text-slate-300">
                    {selectedQuestion.perspective}
                  </span>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-300">
                  ID
                  <input
                    value={selectedQuestion.id}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 disabled:cursor-not-allowed"
                  />
                </label>
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
                      <option value="Borrador" className="bg-phd-dark">
                        Borrador
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={editRequired}
                      onChange={(e) => setEditRequired(e.target.checked)}
                      className="w-4 h-4 accent-phd-pink"
                    />
                    Obligatoria
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-300">
                    Tipo de pregunta
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    >
                      <option value="Base" className="bg-phd-dark">
                        Base
                      </option>
                      <option value="Profundización" className="bg-phd-dark">
                        Profundización
                      </option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-300">
                    Preguntas origen
                    <input
                      value={editOriginsText}
                      onChange={(e) => setEditOriginsText(e.target.value)}
                      placeholder="Ej.: Q1, Q4"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                    />
                    <span className="text-[11px] text-slate-500">
                      IDs separados por coma. Habilitan preguntas de profundización.
                    </span>
                  </label>
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm text-slate-300 mb-1">Perfiles que responden</legend>
                  <div className="flex flex-wrap gap-4">
                    {QUALITY_PULSE_PROFILES.map((profile) => (
                      <label
                        key={profile}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={editProfiles.includes(profile)}
                          onChange={(e) => toggleEditProfile(profile, e.target.checked)}
                          className="w-4 h-4 accent-phd-cyan"
                        />
                        {profile}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-semibold text-slate-300">
                    Alternativas de respuesta
                  </h4>
                  {editOptions.map((option, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
                    >
                      <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                      <label className="flex flex-col gap-1 text-sm text-slate-300">
                        Respuesta
                        <textarea
                          value={option.label}
                          onChange={(e) => updateEditOption(index, { label: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                          rows={2}
                        />
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-sm text-slate-300">
                          Score
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={1}
                            value={option.score}
                            onChange={(e) =>
                              updateEditOption(index, { score: Number(e.target.value) })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-slate-300">
                          Tipo de señal
                          <select
                            value={option.signalType}
                            onChange={(e) =>
                              updateEditOption(index, { signalType: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                          >
                            <option value="Pain" className="bg-phd-dark">
                              Pain
                            </option>
                            <option value="Brecha" className="bg-phd-dark">
                              Brecha
                            </option>
                            <option value="Fortaleza" className="bg-phd-dark">
                              Fortaleza
                            </option>
                          </select>
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm text-slate-300">
                        Señal
                        <textarea
                          value={option.signal}
                          onChange={(e) => updateEditOption(index, { signal: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-phd-cyan/50"
                          rows={2}
                        />
                      </label>
                    </div>
                  ))}
                </div>

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
