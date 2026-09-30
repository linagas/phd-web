# Exploration: admin-publish-review-step

## Current State

Both "Revisar y publicar" (Dashboard → `PendingReviewList`) and "Publicar" (Clientes → `ClientsTable`) call the same `POST /api/quality-pulse/admin/publication` with `{clientKey}` and publish immediately — no display of the client's actual answers/results happens before that call. The only pre-publish visibility today is the aggregate `healthScore` + per-profile `Respondido/Pendiente` chips, both derived by `calculateProfileScores`/`calculateResults` inside `buildDashboardSummary`/`buildClientRows` — never the question-level detail.

The client-facing page `/quality-pulse/resultados` (`results-view.tsx`) already renders the FULL detail an admin would need to actually "review": health score, per-perspective radar, per-dimension grid, benchmark table, gaps list, impact ranking — all computed by the pure, already-tested `calculateResults(submissions, catalog)` in `src/utils/quality-pulse/scoring.ts`.

Confirmed data-availability (key finding): `GET /api/quality-pulse/assessments` (no `organization` query param), gated by an admin session cookie check in `assessment-controller.ts` (`hasAdminSession`), already returns **ALL raw submissions for ALL clients** via `AssessmentService.getAllAssessments()` — this is exactly what `AdminPanel` already fetches today for the Clientes tab (Excel export, reset actions). `getPublicStatus()` is a separate, unrelated gated path only used by the public results page. **No new backend endpoint is strictly required** to power a review view.

However, the Dashboard's own data (`DashboardSummary` / `ClientDashboardSummary`, built by `buildDashboardSummary` in `dashboard-metrics.ts`) only ever carries aggregated `healthScore` + `profileScores` — never raw per-question answers. So the Dashboard entry point does NOT have what it needs today; it would need to add its own fetch of submissions + catalog to build a review view.

`publish(clientKey, publishedBy)` in `publication-service.ts` already persists `publishedBy`/`publishedAt` on `QualityPulseClient` — this already functions as the audit trail of "who reviewed and published, when." The archived `admin-dashboard` proposal.md explicitly lists roles ("Super Admin") as out of scope, confirming the single-actor, no-approval-workflow constraint the user asked to preserve.

## Affected Areas

- `src/app/quality-pulse/resultados/components/results-view.tsx` — source of the presentational sub-components (HealthScoreCard, BenchmarkTable, DimensionsGrid, GapsList, ImpactRanking) worth extracting into a shared component for reuse in an admin review view.
- `src/utils/quality-pulse/scoring.ts` — `calculateResults` is the reusable, pure, tested engine; no changes needed, just call it with a single client's filtered submissions.
- `src/services/quality-pulse/assessment-service.ts` / `src/controllers/quality-pulse/assessment-controller.ts` — confirms `getAllAssessments()` via `GET /api/quality-pulse/assessments` (admin-gated, no `organization` param) already exposes everything needed; no new endpoint required for MVP.
- `src/app/quality-pulse/components/admin-panel.tsx` — already holds all submissions + catalog in memory; the ClientsTable review flow needs zero new fetches.
- `src/app/quality-pulse/components/clients-table.tsx` — row-level "Publicar" button and existing `renderExpandedRow` slot mechanism (currently used for reset/unpublish) — potential integration point, though a modal is simpler/decoupled.
- `src/app/administracion/(console)/components/dashboard-view.tsx` + `pending-review-list.tsx` — "Revisar y publicar" trigger point; this path needs new fetches (submissions + catalog) since `DashboardSummary` never carries raw answers.
- `src/utils/quality-pulse/dashboard-metrics.ts` — confirms `ClientDashboardSummary` shape has no raw-answer data (only aggregates).
- `src/services/quality-pulse/publication-service.ts`, `src/models/quality-pulse/client-model.ts` — `publishedBy`/`publishedAt` already serve as the review audit trail; no new persisted "reviewed" state needed.

## Approaches

1. **Modal with full results detail (recommended)** — Extract `results-view.tsx`'s presentational pieces into a shared component/panel that both the client page and a new admin modal render, fed by `calculateResults`. Clicking "Revisar y publicar" / "Publicar" opens the modal instead of publishing immediately; a "Confirmar publicación" button inside the modal makes the actual `POST` call. Data: reuse `GET /api/quality-pulse/assessments` (all, admin-gated) + `/api/quality-pulse/catalog`, filtered client-side by `clientKey` — zero new fetches for ClientsTable (AdminPanel already has this data), one small new fetch pair for DashboardView.
   - Pros: Single shared rendering source of truth (client page and admin review always visually consistent); reuses fully tested `calculateResults`; no navigation away from either list; no new backend endpoint required.
   - Cons: A dense multi-section results view (radar charts, benchmark table, gaps list) is heavier in a modal — needs careful scroll/sizing; requires extracting shared components as prep work.
   - Effort: Medium.

2. **Dedicated review sub-route/page** (e.g. `/administracion/clientes/[clientKey]/revisar`) reusing the client-facing layout almost verbatim, with a "Confirmar y publicar" CTA instead of "Volver". Both entry points navigate here instead of calling the endpoint directly.
   - Pros: More comfortable space for dense content; matches the client page 1:1; easy to deep-link within the admin team.
   - Cons: More plumbing (new route + guard reuse + back-nav state); introduces a second UX idiom alongside the existing inline-expand pattern already used for reset/unpublish in `ClientsTable`; adds a full page load for what is otherwise a fast one-click action.
   - Effort: Medium-High.

(Considered and rejected as a distinct approach: inline-expand review reusing `ClientsTable`'s `renderExpandedRow` slot — technically possible for the Clientes tab, but `PendingReviewList` has no expand mechanism today and a dense results panel doesn't fit well inline; folding this into Approach 1's modal is cleaner and keeps both entry points consistent.)

## Recommendation

Approach 1 (shared results panel in a modal). It reuses trusted, tested logic (`calculateResults`) and visual components (from `results-view.tsx`) instead of building review UI from scratch, requires no new backend endpoint for a working version, and keeps the flow single-click-plus-confirm rather than introducing a second approval actor or persisted "reviewed" state — consistent with the documented "no roles" constraint from the archived `admin-dashboard` proposal.

Flag for `sdd-propose` to explicitly decide (not blocking, Low effort either way): whether to keep reusing the all-clients `GET /api/quality-pulse/assessments` endpoint filtered client-side (zero backend change, but ships every client's raw answers to the browser on each review open) or add a small scoped `AssessmentService.getAssessmentsForClient(clientKey)` (reusing the existing `repository.findByClientKey` already used internally by `getPublicStatus`) behind a new/extended admin route. Not a security regression (admins already get the full dataset via the existing Clientes tab/export), just an SRP/efficiency tradeoff.

## Risks

- Dashboard entry point needs new data fetching wired in (submissions + catalog) that doesn't exist today — small but real scope addition on that side vs. the Clientes tab which needs none.
- Modal must comfortably fit radar charts + benchmark table + gaps list without feeling cramped — needs a UX pass, not just a wrapper.
- Minor pre-existing inconsistency noticed (not part of this change): `assessment-controller.ts`'s local `hasAdminSession()` duplicates logic already centralized in `requireAdminSession` used by other admin controllers.

## Ready for Proposal

Yes — enough is confirmed (no new endpoint strictly needed, reusable scoring/UI, single-actor constraint preserved) to proceed to `sdd-propose`.
