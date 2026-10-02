import * as XLSX from "xlsx";
import { parseInterpretationRules } from "@/utils/quality-pulse/interpretation-rules-parser";

function buildSheet(rows: unknown[][]): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(rows);
}

const FULL_ROWS: unknown[][] = [
  ["QUALITY PULSE | Reglas de interpretación automática"],
  [],
  ["Description row"],
  [],
  ["Regla", "Condición mínima", "Condición máxima", "Interpretación"],
  ["R1", 0, 24, "Critical"],
  ["R2", 25, 49, "Developing"],
  [],
  [],
  ["Regla", "Pain mín.", "Brecha mín.", "Fortaleza mín.", "Condición adicional", "Lectura de señales"],
  ["S1", 3, 0, 0, null, "Pains dominate"],
  ["S2", 1, 3, 0, "", "Mixed pains and gaps"],
  ["S3", 0, 1, 1, "Balanceado", "Balanced"],
];

describe("parseInterpretationRules", () => {
  it("parses both tables located by their own header rows", () => {
    const result = parseInterpretationRules(XLSX, buildSheet(FULL_ROWS));

    expect(result.scoreRules).toEqual([
      { id: "R1", minScore: 0, maxScore: 24, interpretation: "Critical" },
      { id: "R2", minScore: 25, maxScore: 49, interpretation: "Developing" },
    ]);
    expect(result.signalRules).toEqual([
      { id: "S1", minPain: 3, minBrecha: 0, minFortaleza: 0, condition: "", reading: "Pains dominate", order: 1 },
      { id: "S2", minPain: 1, minBrecha: 3, minFortaleza: 0, condition: "", reading: "Mixed pains and gaps", order: 2 },
      { id: "S3", minPain: 0, minBrecha: 1, minFortaleza: 1, condition: "Balanceado", reading: "Balanced", order: 3 },
    ]);
  });

  it("stops each table at the first blank row", () => {
    const rows: unknown[][] = [
      ["Regla", "Condición mínima", "Condición máxima", "Interpretación"],
      ["R1", 0, 24, "A"],
      [],
      ["R9", 1, 2, "Orphan after blank"],
    ];
    const result = parseInterpretationRules(XLSX, buildSheet(rows));
    expect(result.scoreRules.map((r) => r.id)).toEqual(["R1"]);
    expect(result.signalRules).toEqual([]);
  });

  it("matches headers ignoring accents and case", () => {
    const rows: unknown[][] = [
      ["REGLA", "CONDICION MINIMA", "condicion maxima", "interpretacion"],
      ["R1", "0", "24", "A"],
    ];
    const result = parseInterpretationRules(XLSX, buildSheet(rows));
    expect(result.scoreRules).toEqual([
      { id: "R1", minScore: 0, maxScore: 24, interpretation: "A" },
    ]);
  });

  it("returns empty lists when no table is found", () => {
    const result = parseInterpretationRules(XLSX, buildSheet([["nothing here"]]));
    expect(result).toEqual({ scoreRules: [], signalRules: [] });
  });
});
