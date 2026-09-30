# Exploration: admin-console-visual-redesign — Quality Pulse admin console visual redesign (Stitch mockup parity)

## Current State

**Dashboard (`/administracion`)** — built in `admin-dashboard` change (Phases 3-4, already implemented):
- `dashboard-view.tsx` fetches `GET /api/quality-pulse/admin/dashboard` once, renders `KpiCards`, `PendingReviewList`, `ClientScoreTable` in sequence.
- `DashboardSummary` (`src/utils/quality-pulse/dashboard-metrics.ts`) shape:
  ```ts
  { kpis: { registeredClients, submissions, expectedSubmissions, completionPct, pendingReview },
    globalHealthScore: number | null,
    clients: ClientDashboardSummary[] /* clientKey, clientName, isPublished, answeredCount, healthScore, profileScores[] */,
    pendingReview: { clientKey, clientName }[] /* narrow — no score/profile data */ }
  ```
- `KpiCards`: flat cards, uppercase label + big number, no icons, no color coding, no circular indicator. Confirmed — no icon/accent logic in the component at all.
- `PendingReviewList`: only `clientKey`/`clientName` per item (interface `PendingReviewItem`), generic "Revisar y publicar" button. No score, no tier badge, no per-profile progress bar — and the data to build those (score + profileScores) already exists in `summary.clients`, just isn't threaded into this list today.
- `ClientScoreTable`: table with Cliente/Score/4 profile columns (Calidad/Desarrollo/Gestión/Negocio from `QUALITY_PULSE_PROFILES`), flat styling, cyan for global score only, no color-coded badges.
- All three use `.phd-glass` (blur + translucent bg, defined in `globals.css`) as the only "card" treatment.

**Clientes list (`/administracion/clientes`)**:
- Uses `AdminPanel` (`src/app/quality-pulse/components/admin-panel.tsx`) — a single-client `<select>` dropdown + one detail card (profile reset, unpublish, export), **not a table**. This is the ORIGINAL pre-`admin-dashboard` Quality Pulse pattern.
- Confirmed via `openspec/changes/admin-dashboard/tasks.md` task 2.5: this component was verified "byte-identical" (handlers unchanged) during the `admin-dashboard` change — it was a deliberate preservation decision, not an oversight.

**Tier/segmentation concept**: confirmed via `grep -i tier` across `src/` — **zero matches anywhere in the codebase**. `client-model.ts` (`QualityPulseClient`) only has `clientKey, clientName, registeredBy, createdAt, isPublished, publishedBy?, publishedAt?`. No tier field, no repository/controller support for it.

**Design system tokens** (`tailwind.config.ts`): `phd-dark #0B0F19`, `phd-card #111827`, `phd-cyan #38BDF8`, `phd-pink #F43F5E`, `phd-purple #818CF8`, plus legacy `pink-400/500`, `blue-*`, `purple-*`, `black-*`. `.phd-glass` is the sole card utility (`globals.css:59-65`). `phd-pink` is currently reused for BOTH destructive actions (reset/despublicar buttons in `admin-panel.tsx`) AND would need to double as the mockup's "urgent/critical" KPI accent — same token, two different semantics, worth flagging for the design phase (not a blocker, no new token strictly required).

**Out-of-scope confirmation** (`openspec/changes/admin-dashboard/proposal.md:17-20`): "Activity timeline / audit log, system-health widget, period selector / quarter comparison (**blocked by unique `(clientKey, profile)` index**), roles" are explicitly out of scope for the whole Quality Pulse admin module — not just this change. This directly conflicts with the mockup's "Trimestre" filter on the Listado de Clientes frame.

**TDD compatibility check**: read `kpi-cards.test.tsx` and `pending-review-list.test.tsx` — assertions are on visible text and ARIA roles (`getByText`, `getByRole`), never on className/CSS. A pure visual/structural redesign is compatible with existing RED/GREEN contracts as long as text content and roles are preserved; enriching `PendingReviewList` with score/profile data would widen its prop interface (new RED tests needed under `strict_tdd: true` in `openspec/config.yaml`), but requires zero backend change since `summary.clients` already carries that data in the same API payload.

## Affected Areas
- `src/app/administracion/(console)/components/kpi-cards.tsx` — needs icons, color accents, circular score indicator to match mockup KPI cards
- `src/app/administracion/(console)/components/pending-review-list.tsx` — needs score + tier badge + per-profile progress bars; tier doesn't exist (see Approaches), score/profiles are available without backend changes
- `src/app/administracion/(console)/components/client-score-table.tsx` — needs badge/typography hierarchy upgrade, data unchanged
- `src/app/administracion/(console)/components/dashboard-view.tsx` — orchestrates composition; would need to cross-reference `summary.clients` by `clientKey` to enrich `PendingReviewList` props
- `src/app/quality-pulse/components/admin-panel.tsx` — mockup assumes a table view here; current component is a single-client selector, deliberately preserved byte-identical by a prior change (task 2.5) — touching this is a structural, not visual, decision
- `src/models/quality-pulse/client-model.ts`, `src/repositories/quality-pulse/client-repository.ts`, `src/controllers/quality-pulse/admin-catalog-controller.ts` (or wherever client registration lives) — only IF tier is added; not touched otherwise
- `tailwind.config.ts` / `src/app/globals.css` — only if a dedicated "urgent/alert" shade distinct from `phd-pink` is desired
- `tests/unit/components/admin-dashboard/*.test.tsx` — existing tests must keep passing (text/role-based); new tests needed for any new visible content (tier badges, progress bars)

## Approaches

1. **CSS/structure-only redesign, dashboard scope** — restyle `KpiCards`/`PendingReviewList`/`ClientScoreTable` to match mockup hierarchy (icons, phd-pink/cyan/purple accents, circular indicator, per-profile progress bars), reusing 100% of data already returned by `GET /api/quality-pulse/admin/dashboard`. No backend change.
   - Pros: zero backend risk, single-layer (components only), fast, low review-budget impact, fully TDD-compatible
   - Cons: no tier badges (concept doesn't exist), `/clientes` page stays unchanged (mockup mismatch there)
   - Effort: Low-Medium

2. **Full mockup fidelity (dashboard + clientes table + tier)** — adds `tier` field across Model/Repository/Controller (new field + migration/backfill for existing clients), AND replaces `AdminPanel`'s single-selector with a table view (search + Estado/Trimestre filters) matching the "Listado de Clientes" mockup frame.
   - Pros: matches both mockup frames exactly
   - Cons: multi-layer backend change (Model→Repository→Controller, mandatory 2+ file delegation trigger), reopens a component explicitly preserved byte-identical by a prior deliberate decision, "Trimestre" filter is explicitly blocked by the existing unique `(clientKey, profile)` index per `admin-dashboard` proposal — this is not just extra scope, it's currently architecturally unsupported, high review-budget risk (likely >400 lines)
   - Effort: High

3. **Hybrid/phased, dashboard-first (recommended)** — Scope this change strictly to the Dashboard (`/administracion`) visual redesign (same as Option 1), and explicitly document as OUT OF SCOPE in the proposal: (a) tier/segmentation — doesn't exist, needs new backend work; (b) replacing `AdminPanel` with a client table — structural change to a component deliberately preserved byte-identical; (c) activity timeline — already excluded upstream; (d) quarter/period filters — blocked by existing unique index. Enrich `PendingReviewList` with score + per-profile status (data already available, no backend change) as part of this same change since it's genuinely visual/structural, not a new capability.
   - Pros: tight scope, no backend risk, respects prior deliberate scope decisions, fits review-budget guard, still meaningfully closes the visual gap on the frame the user compared most (Dashboard)
   - Cons: won't be pixel-identical to mockup on `/clientes`; must be surfaced to the user explicitly so it's a decision, not a silent scope cut
   - Effort: Low-Medium (same as Option 1)

## Recommendation

Option 3. Scope `admin-console-visual-redesign` to the Dashboard visual redesign only (`kpi-cards.tsx`, `pending-review-list.tsx`, `client-score-table.tsx`, `dashboard-view.tsx`), reusing the existing `GET /api/quality-pulse/admin/dashboard` payload end-to-end — no backend/model/API changes needed. `sdd-propose` should explicitly list tier, the `/clientes` table redesign, and quarter filters as out-of-scope with the concrete reasons found above (missing model field, protected component, blocked by existing index), and ask the user to confirm whether those should become a separate follow-up change rather than silently dropping mockup fidelity there.

## Risks
- **Scope-mismatch risk**: the user's original comparison request covered both mockup frames (Dashboard + Listado de Clientes). If the proposal scopes to Dashboard-only without flagging it, the user may expect `/clientes` to also match the mockup. Must be surfaced explicitly for confirmation in `sdd-propose`.
- **Token semantics**: `phd-pink` is already used for destructive actions (reset/unpublish) in `admin-panel.tsx`; reusing it for "urgent/critical" KPI accents in the dashboard creates a semantic overlap (destructive vs. attention-needed) — worth a design-phase decision, not blocking.
- **TDD scope creep**: enriching `PendingReviewList` with score/profile data requires widening its prop interface and adding new RED tests (`strict_tdd: true` in `openspec/config.yaml`) — small but real addition to task count, already confirmed compatible with existing test assertions (text/role-based, not CSS-based).

## Ready for Proposal
Yes — investigation is sufficient to start `sdd-propose`, provided the Dashboard-only scope decision (and the three excluded items + their concrete reasons) is explicitly surfaced to the user during/before proposal drafting rather than assumed silently.
