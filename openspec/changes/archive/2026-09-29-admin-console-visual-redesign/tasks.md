# Tasks: Admin Console Visual Redesign (Dashboard + Clients Table)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,370 (new: view-models 110 + its tests 180, clients-table 200 + tests 180, e2e 100 = 770; modified: admin-panel 120, admin-panel.test 90, kpi-cards 60, kpi-cards.test 50, client-score-table 50+30, pending-review-list 70+70, dashboard-view 30+30 = ~600) |
| 400-line budget risk | High (against project's real `review_budget_lines: 800`, not just the 400 default) |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 (feature-branch-chain candidate) |
| Delivery strategy | single-pr-default (user preference) — does not fit; prior change (`admin-dashboard`) already needed `size:exception` at a lower size |
| Chain strategy | pending — user must choose stacked-to-main vs feature-branch-chain |

Decision needed before apply: Resolved
Chained PRs recommended: Yes (declined by user)
Chain strategy: N/A — single-pr-default kept
400-line budget risk: High

**User decision (2026-09-28)**: keeps `single-pr-default`; explicitly accepts `size:exception` for one PR of ~1,370 lines (~1.7x the 800-line budget), declining the 4-unit chained split proposed above (same pattern as `admin-dashboard`). `sdd-apply` must proceed as a single PR under `size:exception`, not split automatically.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Pure view-models (`admin-view-models.ts`) fully tested | PR 1 | `npm test -- tests/unit/utils/admin-view-models.test.ts` | N/A — pure functions, no DOM/server, unit tests are the harness | Revert file + test; unimported anywhere yet, zero blast radius |
| 2 | Dashboard visual redesign (KPIs, score table, pending list, layout) | PR 2 | `npm test -- tests/unit/components/admin-dashboard` | `npm run dev` → visit `/administracion` | Revert the 4 component files + tests; independent of clients table |
| 3 | `ClientsTable` presentational component | PR 3 | `npm test -- tests/unit/components/quality-pulse/clients-table.test.tsx` | N/A — not mounted in any route until Unit 4 | Revert new file + test; unused until Unit 4, zero blast radius |
| 4 | Wire `ClientsTable` into `AdminPanel`, add `handlePublish`, migrate tests, e2e | PR 4 | `npm test -- tests/unit/components/quality-pulse/admin-panel.test.tsx` | `npm run test:e2e -- e2e/admin-clientes-smoke.spec.ts` | Revert `admin-panel.tsx`, its test, and the e2e spec; `/administracion/clientes` returns to dropdown |

## Phase 1: Foundation — Pure View-Models (PR 1, depends on: none)

- [x] 1.1 RED: `tests/unit/utils/admin-view-models.test.ts` — `buildClientRows` (registered + legacy merge, legacy `isPublished=false`, score parity with `buildClientSummary`, sorted by name)
- [x] 1.2 GREEN: implement `buildClientRows` in `src/utils/quality-pulse/admin-view-models.ts`
- [x] 1.3 RED: tests for `derivePublicationState` (3 states) and `canPublish` (legacy always `false`)
- [x] 1.4 GREEN: implement `derivePublicationState`, `canPublish`
- [x] 1.5 RED: tests for `formatCompletion` (`n/4`) and `formatRowScore` (`—` on null)
- [x] 1.6 GREEN: implement `formatCompletion`, `formatRowScore`
- [x] 1.7 RED: tests for `filterRowsByName` (trim, case+accent-insensitive NFD, empty query)
- [x] 1.8 GREEN: implement `filterRowsByName`
- [x] 1.9 RED: tests for `enrichPendingReview` (join by `clientKey`; miss keeps name-only)
- [x] 1.10 GREEN: implement `enrichPendingReview`
- [x] 1.11 REFACTOR: dedupe shared types/exports in `admin-view-models.ts`; keep 1.1–1.10 green

## Phase 2: Dashboard Visual Redesign (PR 2, depends on: Phase 1)

- [x] 2.1 RED: extend `kpi-cards.test.tsx` — ring SVG is `aria-hidden`, no new text node duplicates existing KPI values (`"1"`, `"72"`, `"4/8"`…), "Pendientes de revisión" KPI uses `phd-purple`
- [x] 2.2 GREEN: implement `kpi-cards.tsx` (icons, `phd-cyan`/`phd-purple` accents, `aria-hidden` circular score ring)
- [x] 2.3 RED: extend `client-score-table.test.tsx` — new badges/typography, no exact-text collisions
- [x] 2.4 GREEN: implement `client-score-table.tsx` badges/typography
- [x] 2.5 RED: extend `pending-review-list.test.tsx` — 4 existing name-only tests stay green unchanged; add enriched-item cases (score + 4 profile chips: "Respondido" cyan / "Pendiente" slate) via `enrichPendingReview` output
- [x] 2.6 GREEN: implement optional `healthScore?`/`profileScores?` rendering in `pending-review-list.tsx`
- [x] 2.7 RED: extend `dashboard-view.test.tsx` — `enrichPendingReview(summary.pendingReview, summary.clients)` wiring and layout grid
- [x] 2.8 GREEN: implement `dashboard-view.tsx` call to `enrichPendingReview` + layout grid
- [x] 2.9 REFACTOR: rerun full `tests/unit/components/admin-dashboard` suite, confirm zero regressions

## Phase 3: Clients Table Component (PR 3, depends on: Phase 1)

- [x] 3.1 RED: `tests/unit/components/quality-pulse/clients-table.test.tsx` — rows (name/completion/score/state), legacy row shows dashed "No registrado", search filters by accented name, "Publicar" visible only when `isRegistered && answeredCount===4 && !isPublished`, absent for legacy 4/4
- [x] 3.2 GREEN: implement `src/app/quality-pulse/components/clients-table.tsx` (search input, rows via `buildClientRows`/`derivePublicationState`/`canPublish`, expandable-row slot prop, "Publicar" button)
- [x] 3.3 REFACTOR: dedupe badge/status render helpers inside `clients-table.tsx`

## Phase 4: AdminPanel Integration (PR 4, depends on: Phase 3)

- [x] 4.1 Migrate `tests/unit/components/quality-pulse/admin-panel.test.tsx`: rows start collapsed, click row before asserting detail actions, "No publicado" → "En progreso" — document inline as an intentional migration per the relaxed `qp-admin-console` spec, not a broken regression
- [x] 4.2 RED: add cases — reset-all with `REINICIAR` confirmation inside expanded row; `handlePublish` success and 404 (`role=alert`, pink) paths; "Publicar" absent for a 4/4 legacy unregistered client
- [x] 4.3 GREEN: modify `admin-panel.tsx` — swap `<select>` for `<ClientsTable>`; `selectedClientKey` means "expanded row" (starts empty, toggles on click); move detail JSX (profile grid, reset-all input, Despublicar) into `<tr><td colSpan>`
- [x] 4.4 GREEN: add `handlePublish` in `admin-panel.tsx` (mirrors `handleUnpublish`, POST to `PUBLICATION_ENDPOINT`), wire "Publicar" via `canPublish`
- [x] 4.5 REFACTOR: confirm register/reset/unpublish/export endpoints and bodies are byte-identical to before; delete dead dropdown code

## Phase 5: E2E and Verification (PR 4, depends on: Phase 4)

- [x] 5.1 Write `e2e/admin-clientes-smoke.spec.ts` (Playwright): expand row, confirm per-profile reset, publish a 4/4 registered client
- [x] 5.2 Run `npm test` — full suite green, including migrated `admin-panel.test.tsx` and untouched dashboard tests
- [x] 5.3 Run `npm run lint`, `npm run build`, and `git diff` on `models/repositories/services/controllers/pages/api` — confirm zero backend diffs
