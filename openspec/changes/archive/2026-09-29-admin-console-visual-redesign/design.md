# Design: Admin Console Visual Redesign (Dashboard + Clients Table)

## Technical Approach

This change touches presentation only, in `src/app/`, plus one new file of pure view-model functions in `src/utils/quality-pulse/`. There are no backend diffs: models, repositories, services, controllers, `pages/api` and `dashboard-metrics.ts` stay untouched, and so does the MongoDB cached-client pattern. The pure functions derive every label and state. Components only render them. This keeps the Strict TDD RED tests independent of the DOM.

## Resolved Design Questions

### Q1: How to identify a legacy unregistered client. The spec assumption was wrong.

Verified in `dashboard-metrics.ts:81`: `buildDashboardSummary` maps only the registered `clients`. Submissions from unregistered clientKeys are dropped from `clients[]` and from `pendingReview`. So `GET /admin/dashboard` **cannot** represent legacy clients, and it has no registration flag.

**Correction (frontend-only)**: the clients table does NOT use the dashboard endpoint. `AdminPanel` already loads `/api/quality-pulse/{clients,assessments,catalog}`, and it already merges legacy clients (`admin-panel.tsx:25-57`). The new pure function `buildClientRows` sets `isRegistered = registeredKeys.has(clientKey)`. It computes the score with the same `calculateProfileScores` and `calculateResults` that `buildClientSummary` uses (`scoring.ts`, which is client-safe: it imports only models). A legacy client therefore gets the same score it would get server-side, and no backend change is needed.

**Second finding (spec adjustment required)**: `PublicationService.publish` and `unpublish` throw `ClientNotFoundError` (404) for unregistered keys (`publication-service.ts:37-40`). So "Publicar" MUST additionally require `isRegistered`. A 4/4 legacy client shows "Pendiente de revisión" plus "No registrado", with no "Publicar" button. Reset still works for legacy clients (`assessment-service.ts:134-142` does not check registration). `qp-admin-clients-table` "Row-Level Publish Action" needs a one-line delta: `AND the client is registered`.

### Q2: Color semantics (final)

| Semantic | Token | Elements |
|---|---|---|
| Constructive / done | `phd-cyan` | Badge "Publicado"; "Publicar" and "Revisar y publicar" buttons (outline `bg-phd-cyan/10 border-phd-cyan/30`, same style as today); global-score ring; KPIs Clientes/Submissions/Completitud icons; "Respondido" profile chips |
| Attention / pending review | `phd-purple` | KPI "Pendientes de revisión" (icon, accent border, value when >0); badge "Pendiente de revisión"; Pending-list item accent |
| Destructive / error | `phd-pink` | Reset buttons, "Despublicar" hover, "REINICIAR" confirm, every `role="alert"` |
| Neutral | slate (`white/5`, `slate-400`) | Badge "En progreso"; "Pendiente" profile chip; badge "No registrado" (`border-dashed`) |

No KPI uses pink, and there is no "urgent" KPI in the data. No new tokens. There is no icon library in `package.json`, so icons are inline `aria-hidden` SVGs.

### Q3: Preserving the flows inside the expandable row

`AdminPanel` keeps **all** state and handlers verbatim: `handleResetProfile`, `handleResetAll` (guarded by `RESET_ALL_CONFIRMATION_WORD = "REINICIAR"`), `handleUnpublish`, `handleExport`, `handleRegisterClient`, and `loadData`. The only rewiring: `selectedClientKey` now means "expanded row" (click toggles it; it starts empty instead of auto-selecting the first row). The detail JSX (profile grid with Confirmar/Cancelar, the reset-all input, and Despublicar) moves into `<tr><td colSpan>` right below the selected row. Endpoints, bodies and confirmations do not change. Register and Export stay at table level: Export works on all submissions, not per client.

```
Admin     ClientsTable(row)   AdminPanel handlers          API
  |-- click row ->|-- onToggle(key) -> setSelectedClientKey  |
  |-- "Reiniciar todo" -> setResetAllOpen(true)               |
  |-- types REINICIAR -> setResetAllInput                     |
  |-- "Confirmar reinicio total" -> handleResetAll ----------> DELETE /admin/assessments {clientKey, resetAll}
  |                                 <- ok -> setSelectedClientKey("") ; loadData()
  |-- "Publicar"(row, canPublish) -> handlePublish ----------> POST /admin/publication {clientKey}
  |                                 <- 404/409 -> actionError (role=alert, pink)
```

`handlePublish` is new. It mirrors `handleUnpublish`, using method POST and the same `PUBLICATION_ENDPOINT` as `dashboard-view.tsx`.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Table data source | Local derivation from the 3 existing fetches | `GET /admin/dashboard` | The dashboard omits legacy clients (Q1). An extra fetch would also break `admin-panel.test.tsx`, whose mock rejects unknown URLs. |
| Derivation location | `src/utils/quality-pulse/admin-view-models.ts` (pure) | Inline in components; editing `dashboard-metrics.ts` | Testable in isolation. Adds zero diff to backend-consumed files. |
| Table split | `clients-table.tsx` presentational + `AdminPanel` container | Rewriting AdminPanel as one file | Container-presentational split. Handlers stay put, which lowers the risk of breaking flows. |
| Pending list widening | Optional `healthScore?` and `profileScores?` props | Required props | The 4 existing tests pass `{clientKey, clientName}` only. They stay green unchanged. |
| Default expansion | Collapsed | Auto-expand the first row | It is the table idiom. It needs a conscious migration of `admin-panel.test.tsx` (click the row first; "No publicado" becomes "En progreso"), which the relaxed `qp-admin-console` spec allows. |

## Interfaces / Contracts

```ts
// src/utils/quality-pulse/admin-view-models.ts
export type PublicationState = "Publicado" | "Pendiente de revisión" | "En progreso";
export interface ClientRow {
  clientKey: string; clientName: string; isRegistered: boolean; isPublished: boolean;
  answeredCount: number; healthScore: number | null; profileScores: ProfileScore[];
}
export function buildClientRows(clients: QualityPulseClient[], submissions: QualityPulseAssessment[], catalog: CatalogQuestion[]): ClientRow[]; // sorted by name, legacy isPublished=false
export function derivePublicationState(row: Pick<ClientRow, "isPublished" | "answeredCount">): PublicationState;
export function canPublish(row: ClientRow): boolean; // isRegistered && answeredCount===4 && !isPublished
export function formatCompletion(answeredCount: number): string; // "n/4"
export function formatRowScore(score: number | null): string;    // "—" when null
export function filterRowsByName(rows: ClientRow[], query: string): ClientRow[]; // trimmed, case+accent-insensitive (NFD)
export interface PendingReviewEntry { clientKey: string; clientName: string; healthScore?: number | null; profileScores?: ProfileScore[] }
export function enrichPendingReview(pending: DashboardSummary["pendingReview"], clients: ClientDashboardSummary[]): PendingReviewEntry[]; // join by clientKey; a miss keeps name-only
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/utils/quality-pulse/admin-view-models.ts` | Create | Pure functions above |
| `src/app/quality-pulse/components/clients-table.tsx` | Create | Search input, rows, badges, expandable slot, "Publicar" |
| `src/app/quality-pulse/components/admin-panel.tsx` | Modify | `<select>` becomes `ClientsTable`; adds `handlePublish`; handlers otherwise untouched |
| `src/app/administracion/(console)/components/{kpi-cards,client-score-table}.tsx` | Modify | Visual only: icons, accents, SVG ring |
| `.../components/pending-review-list.tsx` | Modify | Optional score + profile chips |
| `.../components/dashboard-view.tsx` | Modify | `enrichPendingReview(...)` and layout grid |
| `tests/unit/utils/admin-view-models.test.ts`, `tests/unit/components/quality-pulse/clients-table.test.tsx` | Create | RED first |
| `tests/unit/components/quality-pulse/admin-panel.test.tsx` | Modify | Migrate to the collapsed-row flow and add Publicar, reset-all and REINICIAR cases |

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Every function in `admin-view-models` (legacy merge, parity with `buildClientSummary`, 4 states, `canPublish` incl. legacy, search incl. accents, join miss) | Plain Jest, no DOM |
| Component | Table rows, search, expand, Publicar visibility; enriched pending item | RTL scoped with `within(row)` |
| Component (regression) | Existing KPI, score-table and pending tests stay unchanged | Constraint: no extra text nodes equal to KPI values (`"1"`, `"72"`, `"4/8"`, …). The ring SVG is `aria-hidden` with no text. Keep the `aria-label="Sin datos"` and "Pendiente" badges. |
| E2E | Clientes smoke: expand, reset-profile confirm, publish | Playwright, `e2e/` |

## Threat Matrix

N/A: no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Revert the commits to roll back.

## Open Questions

- [x] Spec delta needed in `qp-admin-clients-table`: "Publicar" also requires the client to be registered (Q1). Otherwise it would hit a 404. — Applied: `qp-admin-clients-table/spec.md`'s "Row-Level Publish Action" requirement now includes the registration condition plus a dedicated legacy-client scenario.
- [x] Whether the proposal's "score from `/admin/dashboard`" line should be amended to say "local derivation using the same scoring functions". This is a frontend-only deviation, not a backend one. — Applied: `proposal.md`'s Approach section now describes the local-derivation approach.
