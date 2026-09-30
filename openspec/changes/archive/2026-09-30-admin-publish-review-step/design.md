# Design: Admin Publish Review Step

## Technical Approach

Frontend-only. Move the presentational blocks of `results-view.tsx` into a pure `ResultsPanel` component. A new guarded route inside `(console)` loads data from three existing admin-gated endpoints. It filters the data by `clientKey`, works out eligibility with the existing `buildClientRows`/`canPublish` helpers, scores with `calculateResults`, and renders `ResultsPanel` plus a "Confirmar publicación" button. Both entry points become `<Link>`s to that route. **No backend file changes.**

**Deviation from proposal (data only, not backend):** `GET /api/quality-pulse/assessments` (no `organization`) returns only raw `QualityPulseAssessment[]`. It carries no registration or `isPublished` data. Eligibility (published / unregistered / unknown) therefore also needs `GET /api/quality-pulse/clients`. That endpoint already exists, is admin-gated and is already used by `AdminPanel`.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Shared panel boundary | `ResultsPanel({ results, catalog })`, pure, no fetch/state | Pass raw submissions and score inside the panel | Callers already own `calculateResults`. The panel stays a pure view that can be tested with a fixture. |
| Panel location | `src/app/quality-pulse/resultados/components/results-panel.tsx` (next to `radar-chart.tsx`) | `src/app/components/` | Smallest move with no RadarChart relocation. Cross-tree import already has precedent (`clientes/page.tsx` imports `admin-panel`). |
| Route placement | `src/app/administracion/(console)/clientes/[clientKey]/revisar/page.tsx` | Outside the group with its own guard | The `(console)/layout.tsx` server guard wraps every nested segment and gives the sidebar for free. Root `middleware.ts` may not run at all (see Risks), so the layout guard must cover this route. |
| Eligibility source | New pure `resolveReviewEligibility(rows, clientKey)` over `buildClientRows` | Recompute 4/4 inline | Same rules as `canPublish` in the Clientes table, so there is one source of truth. |
| Navigation | `next/link` `<Link>` | `router.push` | Real `<a href>` (semantics, open in new tab). Tests only assert `href`, so no router mock is needed. |
| Href builder | `buildReviewHref(clientKey)` using `encodeURIComponent` | Inline template strings | `toClientKey` keeps spaces and punctuation, so one encoder is shared by both entry points. |
| Param decoding | `safeDecodeParam(raw)` (try `decodeURIComponent`, fall back to raw) | Trust Next to decode | Next 14.2 App Router param decoding is inconsistent for encoded segments. The fallback is idempotent for keys without `%`. |
| Confirm error | Show `body.error` when it is a string, otherwise a generic message. The button stays enabled. | Proactive re-check | The user already decided on this. The server returns 409 `NotEligibleError`, 404 `ClientNotFoundError`, 401 and 500. |
| Post-confirm | `published` phase: the panel stays visible, the button becomes a "Publicado" banner, no redirect | Reload data | Spec requirement. A reload afterwards correctly shows "already published" as blocked. |

## Component and Data Flow

```
page.tsx (server, params.clientKey)
  └─ PublishReviewView (client) { clientKey }
       ├─ fetch x3 in parallel: /assessments, /catalog, /clients
       ├─ buildClientRows → resolveReviewEligibility
       ├─ calculateResults(submissions.filter(clientKey), catalog)
       └─ ResultsPanel { results, catalog }
ResultsView (client page) ── calculateResults ── ResultsPanel (same)
```

**States:** `loading` → `load-error` | `blocked{reason: unknown|unregistered|incomplete|published}` | `ready` (holds `submitting` and `confirmError`) → `published`. In `blocked` the page renders only the message and "Volver", with no panel and no button.

## Sequence

```
Admin      Entry(Link)   ReviewPage/View      API                     PublicationService
 │ click ──▶ │                  │               │                           │
 │           │ navigate ───────▶│ layout guard (cookie verify, else redirect /ingresar)
 │           │                  │ GET assessments, catalog, clients ─▶      │
 │           │                  │◀──────── 200 x3                           │
 │           │                  │ eligibility? no ─▶ render blocked (end)   │
 │           │                  │ yes ─▶ calculateResults ─▶ ResultsPanel   │
 │ reviews, clicks Confirmar ──▶│ POST /admin/publication {clientKey} ─────▶│ publish()
 │           │                  │◀── 200 {isPublished:true} | 409/404/401/500
 │           │                  │ 200 ─▶ phase=published ("Publicado")       │
 │           │                  │ err ─▶ confirmError (role=alert), stay ready
 │ Volver ──▶ Link /administracion/clientes (fixed)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/quality-pulse/resultados/components/results-panel.tsx` | Create | Moves `getHealthLevel`, `BENCHMARK_TARGET`, HealthScoreCard, the two radars, BenchmarkTable, DimensionsGrid, ImpactRanking and GapsList. Builds `questionsById` internally. |
| `src/app/quality-pulse/resultados/components/results-view.tsx` | Modify | Keeps fetch, gates and header, and renders `<ResultsPanel>`. Output stays the same. |
| `src/app/administracion/(console)/clientes/[clientKey]/revisar/page.tsx` | Create | Thin server page that passes `safeDecodeParam(params.clientKey)`. |
| `src/app/administracion/(console)/components/publish-review-view.tsx` | Create | Container: fetch, state machine, confirm POST. |
| `src/utils/quality-pulse/admin-view-models.ts` | Modify | Adds `resolveReviewEligibility`, `buildReviewHref`, `safeDecodeParam`. |
| `src/app/administracion/(console)/components/pending-review-list.tsx` | Modify | Button becomes `<Link href={buildReviewHref(...)}>`. Removes the `onReview` prop. |
| `src/app/administracion/(console)/components/dashboard-view.tsx` | Modify | Removes `handleReview`, `publishing` and the publication constants. |
| `src/app/quality-pulse/components/clients-table.tsx` | Modify | "Publicar" becomes a `<Link>` whose `onClick` calls `stopPropagation` (so the row does not toggle). Removes `onPublish` and `publishing`. |
| `src/app/quality-pulse/components/admin-panel.tsx` | Modify | Removes `handlePublish` and the props passed to it. `handleUnpublish` stays. |
| `e2e/admin-clientes-smoke.spec.ts` | Modify | "Publicar" is now a link: go to the review page, confirm, assert "Publicado". |

## Interfaces

```ts
type ReviewEligibility =
  | { kind: "eligible"; row: ClientRow }
  | { kind: "blocked"; reason: "unknown" | "unregistered" | "incomplete" | "published"; row?: ClientRow };
export function resolveReviewEligibility(rows: ClientRow[], clientKey: string): ReviewEligibility;
export function buildReviewHref(clientKey: string): string; // /administracion/clientes/{enc}/revisar
interface ResultsPanelProps { results: QualityPulseResults; catalog: CatalogQuestion[] }
```

`blocked` reasons are checked in this order: `unknown` (no row) → `published` → `unregistered` → `incomplete`.

## Testing Strategy (Strict TDD, RED first)

| Layer | What | Approach |
|---|---|---|
| Unit (pure) | `resolveReviewEligibility` (all 5 outcomes), `buildReviewHref` (spaces, accents, `/`), `safeDecodeParam` (encoded, raw, malformed `%`) | `tests/unit/utils/admin-view-models.test.ts` |
| Unit (component) | `ResultsPanel` renders every section from a fixture `QualityPulseResults`, with no fetch | New `results-panel.test.tsx` |
| Regression | `results-view.test.tsx` stays green without edits (the extraction is a pure move) | Existing |
| Unit (container) | `PublishReviewView`: loading; each blocked reason (no panel, no button); ready; POST body; 409 message shown; 200 leads to "Publicado" with no redirect; Volver href | Mocked `global.fetch`, same pattern as `dashboard-view.test.tsx` |
| Unit (entries) | Pending list and ClientsTable render a link with the correct href. The fetch mock is not called on click. Clicking a ClientsTable link does not toggle the row. | Rewrite the `onReview`/`onPublish` tests in `pending-review-list`, `dashboard-view`, `clients-table` and `admin-panel` |
| E2E | Unauthenticated access to the review URL redirects to `/ingresar`. Clientes → review → confirm → Publicado. | `admin-guard.spec.ts` (add URL), `admin-clientes-smoke.spec.ts` |

## Threat Matrix

N/A: no shell, subprocess, VCS/PR automation or executable-file classification boundary. The only new route is a web page, and its auth boundary is covered by the layout guard plus the E2E guard test above.

## Migration / Rollout

No migration required. Rollback means reverting the frontend commits.

## Open Questions

- [ ] None blocking.
