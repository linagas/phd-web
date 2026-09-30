// Puebla la colección `qualityPulseCatalog` desde el Excel maestro de preguntas.
// Uso: node --env-file=.env.local scripts/seed-quality-pulse-catalog.mjs <ruta-al-xlsx>

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import * as XLSX from "xlsx";

const PROFILES = ["Calidad", "Desarrollo", "Gestión", "Negocio"];
const OUTCOME_COLUMNS = [
  ["Time-to-Market ↓", "timeToMarket"],
  ["Retrabajo ↓", "rework"],
  ["Productividad ↑", "productivity"],
  ["Frecuencia entrega ↑", "delivery"],
  ["Incidentes prod. ↓", "incidents"],
  ["Tiempo recuperación ↓", "recovery"],
  ["Predictibilidad ↑", "predictability"],
  ["Confianza negocio ↑", "trust"],
];

const clean = (value) => String(value ?? "").trim();
const yes = (value) => ["sí", "si", "1", "true"].includes(clean(value).toLowerCase());
const parseOrigins = (value) =>
  clean(value)
    .split(/[/;,]/)
    .map((item) => item.trim())
    .filter((item) => /^Q\d+$/i.test(item))
    .map((item) => item.toUpperCase());

function parseCatalog(filePath) {
  const workbook = XLSX.read(readFileSync(filePath), { type: "buffer" });
  const questionSheet = workbook.Sheets["05_Preguntas"] ?? workbook.Sheets["Preguntas"];
  const answerSheet =
    workbook.Sheets["06_Respuestas_Reglas"] ??
    workbook.Sheets["Respuesta"] ??
    workbook.Sheets["Respuestas"];

  if (!questionSheet || !answerSheet) {
    throw new Error(
      "El Excel debe incluir las hojas 05_Preguntas y 06_Respuestas_Reglas (también se aceptan Preguntas y Respuesta)."
    );
  }

  const questionRows = XLSX.utils.sheet_to_json(questionSheet, { range: 5, defval: null });
  const answerRows = XLSX.utils.sheet_to_json(answerSheet, { range: 5, defval: null });

  const optionsByQuestion = new Map();
  for (const row of answerRows) {
    const id = clean(row["ID Pregunta"]).toUpperCase();
    if (!id || !clean(row["Respuesta"])) continue;
    const list = optionsByQuestion.get(id) ?? [];
    list.push({
      label: clean(row["Respuesta"]),
      score: Number(row["Score"]),
      variable: clean(row["Variable observada"]),
      signal: clean(row["Señal automática"]),
      signalType: clean(row["Tipo de señal"]),
      priority: clean(row["Prioridad"]),
      impact: clean(row["Impacto potencial"]),
      outcomes: Object.fromEntries(
        OUTCOME_COLUMNS.map(([column, key]) => [key, Number(row[column]) || 0])
      ),
    });
    optionsByQuestion.set(id, list);
  }

  const questions = questionRows
    .flatMap((row, index) => {
      const id = clean(row["ID Pregunta"]).toUpperCase();
      if (!id) return [];
      return [
        {
          id,
          dimension: clean(row["Dimensión"]),
          dimensionId: clean(row["ID Dimensión"]),
          capability: clean(row["Capacidad"]),
          capabilityId: clean(row["ID Capacidad"]),
          perspective: clean(row["Perspectiva"]),
          text: clean(row["Pregunta"]),
          order: Number(row["Orden"]) || index + 1,
          required: yes(row["Obligatoria"]),
          status: clean(row["Estado"]) || "Activa",
          objective: clean(row["Objetivo / qué observa"]),
          type: clean(row["Tipo de pregunta"]) || "Base",
          origins: parseOrigins(row["Pregunta(s) origen"]),
          profiles: PROFILES.filter((profile) => yes(row[profile])),
          options: optionsByQuestion.get(id) ?? [],
        },
      ];
    })
    .sort((a, b) => a.order - b.order);

  const missing = questions.filter((question) => question.options.length < 2);
  if (missing.length) {
    throw new Error(`Faltan respuestas para: ${missing.slice(0, 6).map((q) => q.id).join(", ")}.`);
  }

  return questions;
}

async function seed() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Uso: node scripts/seed-quality-pulse-catalog.mjs <ruta-al-xlsx>");
    process.exit(1);
  }

  const questions = parseCatalog(filePath);
  console.log(`Parseadas ${questions.length} preguntas y ${questions.reduce((sum, q) => sum + q.options.length, 0)} opciones.`);

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("qualityPulseCatalog");

    const incomingIds = questions.map((question) => question.id);
    const existing = await collection.find({ id: { $in: incomingIds } }).project({ id: 1 }).toArray();
    const existingIds = new Set(existing.map((doc) => doc.id));

    const toInsert = questions.filter((question) => !existingIds.has(question.id));
    const skipped = questions.filter((question) => existingIds.has(question.id));

    if (toInsert.length > 0) {
      await collection.insertMany(toInsert);
    }

    console.log(`Insertadas: ${toInsert.length}. Omitidas (ya existían): ${skipped.length}.`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error("Error al poblar el catálogo:", error);
  process.exit(1);
});
