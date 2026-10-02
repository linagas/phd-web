import type { WorkSheet } from "xlsx";
import {
  InterpretationRules,
  ScoreInterpretationRule,
  SignalInterpretationRule,
} from "@/models/quality-pulse/interpretation-rules-model";

export const INTERPRETATION_RULES_SHEET_NAME = "07_Reglas_Interpretacion";

type Matrix = unknown[][];
type XlsxModule = typeof import("xlsx");

const SCORE_HEADERS = ["regla", "condicion minima", "condicion maxima", "interpretacion"];
const SIGNAL_HEADERS = [
  "regla",
  "pain min.",
  "brecha min.",
  "fortaleza min.",
  "condicion adicional",
  "lectura de senales",
];

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

function findHeaderIndex(matrix: Matrix, expected: string[]): number {
  return matrix.findIndex((row) =>
    expected.every((header, col) => normalize(row[col]) === header)
  );
}

/** Rows below the header, up to (excluding) the first blank row. */
function readTableRows(matrix: Matrix, headerIndex: number): unknown[][] {
  if (headerIndex === -1) return [];
  const rows: unknown[][] = [];
  for (let i = headerIndex + 1; i < matrix.length; i += 1) {
    if (isBlankRow(matrix[i])) break;
    rows.push(matrix[i]);
  }
  return rows;
}

function toNumber(value: unknown): number {
  const text = String(value ?? "").trim();
  if (text === "") return 0;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Parses the "07_Reglas_Interpretacion" sheet, which holds two tables with
 * their own header rows (score rules and signal rules).
 */
export function parseInterpretationRules(
  XLSX: XlsxModule,
  sheet: WorkSheet
): InterpretationRules {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

  const scoreRules: ScoreInterpretationRule[] = readTableRows(
    matrix,
    findHeaderIndex(matrix, SCORE_HEADERS)
  ).map((row) => ({
    id: toText(row[0]),
    minScore: toNumber(row[1]),
    maxScore: toNumber(row[2]),
    interpretation: toText(row[3]),
  }));

  const signalRules: SignalInterpretationRule[] = readTableRows(
    matrix,
    findHeaderIndex(matrix, SIGNAL_HEADERS)
  ).map((row, index) => ({
    id: toText(row[0]),
    minPain: toNumber(row[1]),
    minBrecha: toNumber(row[2]),
    minFortaleza: toNumber(row[3]),
    condition: toText(row[4]),
    reading: toText(row[5]),
    order: index + 1,
  }));

  return { scoreRules, signalRules };
}
