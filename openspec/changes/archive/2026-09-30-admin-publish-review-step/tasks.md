# Tasks: Admin Publish Review Step

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1500-1700 (panel extraction moves large JSX blocks, counted as delete+add) |
| 400-line budget risk | High (exceeds project's real 800-line budget as one PR) |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2 → PR3 → PR4 |
| Delivery strategy | auto-forecast (config.yaml) |
| Chain strategy | pending — user picks stacked-to-main or feature-branch-chain |

Decision needed before apply: Resolved
Chained PRs recommended: Yes (declined by user)
Chain strategy: N/A — single-pr-default kept
400-line budget risk: High

**User decision (2026-09-30)**: keeps `single-pr-default`; explicitly accepts `size:exception` for one PR of ~1500-1700 lines (~2x the 800-line budget), declining the 4-unit chained split proposed above (same pattern as `admin-dashboard` and `admin-console-visual-redesign`). `sdd-apply` must proceed as a single PR under `size:exception`, not split automatically.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Extract `ResultsPanel`, keep resultados output identical | PR 1 | `npm test -- results-panel results-view` | Visit `/quality-pulse/resultados/[client]`, compare visually | Revert 2 files |
| 2 | Add pure eligibility/href/decode utils | PR 2 | `npm test -- admin-view-models` | N/A, pure functions | Revert 1 file |
| 3 | New guarded `/revisar` page + container | PR 3 | `npm test -- publish-review-view` | Admin session, open `/administracion/clientes/{key}/revisar` | Delete 2 files |
| 4 | Wire entry points, migrate tests, update e2e | PR 4 | `npm test -- dashboard-view admin-panel pending-review-list clients-table` | `npm run test:e2e -- admin-clientes-smoke admin-guard` | Revert 4 files + e2e |

## Phase 1: Extract ResultsPanel (PR 1)

- [x] 1.1 RED: `results-panel.test.tsx` — assert every section renders from a fixture `QualityPulseResults`.
- [x] 1.2 GREEN: create `results-panel.tsx`, moving health score, radars, benchmark, dimensions, gaps, ranking out of `results-view.tsx`.
- [x] 1.3 GREEN: `results-view.tsx` renders `<ResultsPanel>`; unedited `results-view.test.tsx` still passes (regression proof).
- [x] 1.4 REFACTOR: drop dead imports/helpers in `results-view.tsx`.

## Phase 2: Eligibility/href/decode utils (PR 2)

- [x] 2.1 RED: extend `admin-view-models.test.ts` — `resolveReviewEligibility` (5 outcomes), `buildReviewHref` (spaces/accents/`/`), `safeDecodeParam` (encoded/raw/malformed).
- [x] 2.2 GREEN: implement all three in `admin-view-models.ts`; reason order unknown → published → unregistered → incomplete.

## Phase 3: Review page + container (PR 3)

- [x] 3.1 RED: `publish-review-view.test.tsx` (mocked fetch) — loading, each blocked reason, ready, POST body, 409 message, 200 → published (no redirect), Volver href.
- [x] 3.2 GREEN: create `revisar/page.tsx` (server, `safeDecodeParam`) and `publish-review-view.tsx` (fetch x3, eligibility, `calculateResults`, render panel).
- [x] 3.3 RED→GREEN: add unauthenticated `/revisar` case to `admin-guard.spec.ts`.

## Phase 4: Wire entry points + test migration (PR 4)

- [x] 4.1 RED: rewrite `pending-review-list.test.tsx`, `dashboard-view.test.tsx`, `admin-panel.test.tsx` for `<Link>` + no-fetch-on-click (intentional migration, not regression).
- [x] 4.2 GREEN: `pending-review-list.tsx` drops `onReview`; `dashboard-view.tsx` drops `handleReview`/`publishing`; `clients-table.tsx` Link + `stopPropagation`; `admin-panel.tsx` drops `handlePublish`.
- [x] 4.3 RED: rewrite `e2e/admin-clientes-smoke.spec.ts` (Publicar link → review → Confirmar → Publicado); old direct-POST assertion removed intentionally.
- [x] 4.4 GREEN: confirm rewritten e2e passes against PR 1-3 code.
