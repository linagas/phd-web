# Tasks: Quality Pulse Admin Dashboard + Results Publication Workflow

## Review Workload Forecast

Effective budget this session: **800 lines** (config.yaml `review_budget_lines`), not the skill default of 400.

| Field | Value |
|-------|-------|
| Estimated changed lines (combined) | ~1550-1700 |
| 400-line budget risk (vs 800) | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 / PR 3 (2 and 3 each depend only on 1) |
| Delivery strategy | single-pr-default |
| Chain strategy | pending — conflicts with single-pr given High risk |

Decision needed before apply: Resolved
Chained PRs recommended: Yes (declined by user)
Chain strategy: N/A — single-pr-default kept
400-line budget risk: High

**User decision (2026-09-28)**: keeps `single-pr-default`; explicitly accepts `size:exception` for one PR of ~1550-1700 lines (~2x the 800-line budget), declining the 3-unit chained split proposed above. `sdd-apply` must proceed as a single PR under `size:exception`, not split automatically.

### Suggested Work Units

| Unit | Goal | PR | Focused test | Runtime harness | Rollback boundary |
|------|------|----|--------------|------------------|--------------------|
| 1 | Console shell + guard + model foundation (`isPublished` field, read normalization) | 1 | `npm test -- require-admin-session client-model client-repository` | `e2e/admin-guard.spec.ts` | Revert route-group/layout/guard/model; flat page restored |
| 2 | Dashboard KPIs/score/pending-review (read-only) | 2 | `npm test -- dashboard-metrics quality-pulse-scoring dashboard-service admin-dashboard-controller` | Manual: seed clients, open `/administracion` | Revert dashboard-* files + route; PR 1 unaffected |
| 3 | Publication gate + publish/unpublish + DTO migration + rollout notice | 3 | `npm test -- publication-service assessment-service assessment-controller admin-publication-controller` | `e2e/quality-pulse-publication.spec.ts` | Revert publication-service + gate code; needs explicit re-decision, not silent |

## Phase 1: Guard + Model Foundation (PR 1)

- [x] 1.1 RED→GREEN: guard test then impl — `tests/unit/utils/require-admin-session.test.ts` → `src/utils/quality-pulse/require-admin-session.ts`
- [x] 1.2 REFACTOR: adopt shared guard in the 2 existing admin controllers, remove duplication
- [x] 1.3 RED→GREEN: `isPublished` default test then impl — `tests/unit/models/quality-pulse/client-model.test.ts` → `client-model.ts` (add fields, `create()` defaults `false`)
- [x] 1.4 RED→GREEN: read-normalization test then impl — `tests/unit/repositories/quality-pulse/client-repository.test.ts` → `client-repository.ts`

## Phase 2: Console Shell (PR 1)

- [x] 2.1 RED→GREEN: unguarded-redirect e2e then guard — `e2e/admin-guard.spec.ts` → `(console)/layout.tsx` (e2e written; live run blocked — see apply-progress)
- [x] 2.2 `admin-sidebar.tsx` — phd-dark/Inter; Dashboard/Clientes/Catálogo + disabled "Próximamente" (Resultados/Auditoría/Soporte)
- [x] 2.3 Move `page.tsx` → `(console)/page.tsx`; create `clientes/page.tsx`, `catalogo/page.tsx`
- [x] 2.4 Modify `admin-panel.tsx` — drop embedded `<CatalogManager/>`, Clientes-only view
- [x] 2.5 Verify register/reset/export and catalog import behavior unchanged (spec scenarios) — verified by diff review (handlers byte-identical), e2e execution blocked
- [x] 2.6 Fix (2026-09-28, user feedback): `admin-sidebar.tsx` dropped the PHD logo (linked to `/`) and Quality Pulse logo (linked to `/quality-pulse`) that `qp-header.tsx` establishes elsewhere in the module — both were plain unlinked text. Restored both as `Link`s matching `qp-header.tsx`'s exact visual pattern. Tests: `tests/unit/components/admin-dashboard/admin-sidebar.test.tsx` (RED→GREEN, 2 tests). Verified: 107/116 total (same 9 pre-existing unrelated failures), lint clean.

## Phase 3: Dashboard Core (PR 2)

- [x] 3.1 RED→GREEN: scoring test (D1 weighted mean, `Σp=0→null`, D2 pending) then impl — `tests/unit/utils/quality-pulse-scoring.test.ts` → `scoring.ts`
- [x] 3.2 RED→GREEN: metrics test (KPIs, empty state, `4/4 && !isPublished` filter) then impl — `tests/unit/utils/dashboard-metrics.test.ts` → `dashboard-metrics.ts`
- [x] 3.3 RED→GREEN: DashboardService test (fakes) then impl — `tests/unit/services/dashboard-service.test.ts` → `dashboard-service.ts`
- [x] 3.4 RED→GREEN: controller test (401/200) then impl — `tests/unit/controllers/admin-dashboard-controller.test.ts` → `admin-dashboard-controller.ts` + `admin/dashboard.ts`

## Phase 4: Dashboard UI (PR 2)

- [x] 4.1 `kpi-cards.tsx` — zero-state safe
- [x] 4.2 `client-score-table.tsx` — global/per-client + per-profile score, Calidad/Desarrollo/Gestión/Negocio labels, "Pendiente" badge
- [x] 4.3 `pending-review-list.tsx` — only `4/4 && !isPublished`, "Revisar y publicar" (unwired)
- [x] 4.4 `dashboard-view.tsx` — composes above, fetches summary; wire into `(console)/page.tsx`

## Phase 5: Publication Service & Gate (PR 3)

- [x] 5.1 RED→GREEN: PublicationService test (eligibility, errors, audit fields) then impl — `tests/unit/services/publication-service.test.ts` → `publication-service.ts`; add `setPublished`/`setUnpublished` to `client-repository.ts`
- [x] 5.2 RED→GREEN: gate-matrix test (unpublished/published/published&<4) then impl — `tests/unit/services/assessment-service.test.ts` → `assessment-service.ts` (`getPublicStatus`; reset auto-unpublishes first, D8)
- [x] 5.3 RED→GREEN: controller org-branch test then impl — `tests/unit/controllers/assessment-controller.test.ts` → `assessment-controller.ts`
- [x] 5.4 RED→GREEN: publication-controller test (401/400/404/409/200) then impl — `tests/unit/controllers/admin-publication-controller.test.ts` → `admin-publication-controller.ts` + `admin/publication.ts`

## Phase 6: Publication UI & Public Consumers (PR 3)

- [x] 6.1 Wire "Revisar y publicar" → `POST admin/publication`; add published badge + unpublish to `admin-panel.tsx`
- [x] 6.2 Migrate `results-view.tsx` and `quality-pulse-view.tsx` to `PublicAssessmentStatus` DTO (`submissions` nullable); add "Resultados en revisión" state
- [x] 6.3 RED→GREEN: e2e unpublished→review, publish→results — `e2e/quality-pulse-publication.spec.ts`
- [x] 6.4 RED→GREEN: e2e direct API bypass on unpublished client returns no answers

## Phase 7: Rollout (blocking merge of PR 3)

- [ ] 7.1 Notify PHD/ops BEFORE deploy: ALL clients (incl. existing 4/4 live ones) become `isPublished:false` — expected, not a regression; republish via "Pendientes de Revisión"
- [ ] 7.2 Verify `proposal.md` Success Criteria manually
- [x] 7.3 Run `npm test`, `npm run test:coverage` (80%), `npm run build`, `npm run lint` before merge

### 7.3 Result (2026-09-28)

- `npm test`: 105/114 passed. 9 failures are pre-existing and unrelated (`recaptcha.test.ts`, `message-controller.test.ts`, `message-flow.test.ts`) — confirmed unchanged across every batch of this change via `git status` (those files were never touched).
- `npm run build`: clean. All `(console)/` routes + `/api/quality-pulse/admin/*` compile.
- `npm run lint`: clean (one pre-existing warning in `booking-section.tsx`, unrelated).
- `npm run test:coverage`: **global threshold NOT met** (44.04% stmts vs 80% required). Root-caused before accepting: every uncovered line traced back to pre-existing code this change never touched —
  - `assessment-service.ts` / `assessment-controller.ts`: uncovered lines are `saveAnswers`/`saveAssessment`/`getAllAssessments` (pre-existing questionnaire-submission flow). The new/modified gate logic this change owns — `getPublicStatus` and the `organization` branch — IS covered.
  - `client-repository.ts`: uncovered lines are `create()` (pre-existing client registration). `setPublished`/`setUnpublished` (new in this change) ARE covered.
  - ~10 fully pre-existing quality-pulse files sit at 0% and were never touched by any task in this change: `admin-auth-controller.ts`, `catalog-controller.ts`, `client-controller.ts`, `admin-auth-service.ts`, `catalog-service.ts`, `client-service.ts`, `assessment-repository.ts`, `catalog-repository.ts`, `admin-allowlist.ts`, `admin-session.ts`.
  - **Decision (user, 2026-09-28)**: document as pre-existing technical debt, do not block on it. The 80% gate was already unmet before this change started; `sdd-verify` should read this note rather than re-litigate it as a regression introduced by `admin-dashboard`.
