# Proposal: Admin Console Visual Redesign (Dashboard + Clients Table)

## Intent

The admin console (`admin-dashboard` change) works, but it looks flat compared with the Stitch mockup "Interface Style Redesign". The KPIs have no visual hierarchy. "Pendientes de Revisión" shows only names. `/administracion/clientes` is a single-client `<select>`, so admins cannot see all clients' progress, score and publication state at a glance. This change brings both mockup frames ("Dashboard Ejecutivo" and "Listado de Clientes") to the phd-dark system. It reuses only data the existing APIs already return.

## Scope

### In Scope
- Dashboard restyle: `kpi-cards.tsx` (icons, accents, circular global-score indicator), `client-score-table.tsx` (badges, typography), `dashboard-view.tsx` (layout/composition).
- Enrich `PendingReviewList` with the global score and per-profile status. `dashboard-view` joins `summary.pendingReview` with `summary.clients` by `clientKey`. The prop interface widens, but the API does not change.
- Replace the `AdminPanel` dropdown with a clients table: name, completion (n/4), global score, publication state, and text search. Existing actions (register, per-profile reset, reset-all, unpublish, Excel export) keep their current endpoints and confirmations.
- Add a row-level **"Publicar"** action for 4/4-and-unpublished clients, calling the existing `POST /api/quality-pulse/admin/publication` endpoint (same one already used from the Dashboard's "Pendientes de Revisión"). No new endpoint — publishing becomes reachable from both screens.
- **Conscious decision**: `admin-dashboard` task 2.5 deliberately kept `AdminPanel` byte-identical. This change intentionally reopens it for a structural change. That is a new product decision, not a regression.

### Out of Scope
- **Client tier/segmentation**: no such field exists (`client-model.ts`, zero `tier` matches). It would need Model → Repository → Controller changes plus a backfill. It could become a future change.
- **Quarter ("Trimestre") filter**: blocked by the unique `(clientKey, profile)` index, which keeps only one submission per profile (already excluded in `admin-dashboard`). It could become a future change and would need a data-model redesign.
- Activity timeline, new endpoints, any change to scoring or publication rules.

## Capabilities

### New Capabilities
- `qp-admin-clients-table`: table listing of clients with completion, score, publication state, search, and row-level access to existing actions.

### Modified Capabilities
- `qp-admin-dashboard`: the Pending-Review List requirement now includes score and per-profile status (the eligibility rule is unchanged).
- `qp-admin-console`: the scenario "Clientes route preserves prior AdminPanel behavior" is relaxed from "UI preserved" to "actions preserved".

(Specs still live in `openspec/changes/admin-dashboard/specs/` because they are not archived yet. The deltas target them.)

## Approach

Exploration Option 3, extended to `/clientes` per the user's decision. The changes are presentation-only in `src/app/`. **Amended during `sdd-design`**: the clients table does NOT use `GET /api/quality-pulse/admin/dashboard` — that payload only includes registered clients, so it cannot represent legacy unregistered ones (design.md Q1). Instead, completion, score, and state are derived client-side from the same three fetches `AdminPanel` already makes (`clients`, `assessments`, `catalog`), reusing the existing pure scoring functions from `scoring.ts` so results match the backend exactly. Still zero backend/API changes — only which existing endpoints the UI calls. Strict TDD: new RED tests cover the new visible content (enriched pending items, table rows, search). Existing text/ARIA-based tests must stay green.

**Color semantics (default, final call in `sdd-design`)**: `phd-pink` stays reserved for destructive actions and errors. Attention accents such as "pending review" use `phd-purple` or `phd-cyan`. No new tokens.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/administracion/(console)/components/{kpi-cards,pending-review-list,client-score-table,dashboard-view}.tsx` | Modified | Visual redesign + pending-list enrichment |
| `src/app/quality-pulse/components/admin-panel.tsx` | Modified | Dropdown → table; handlers kept |
| `tests/unit/components/` | Modified/New | New RED tests |
| Backend (`models/repositories/services/controllers/pages/api`) | None | Untouched |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Table refactor breaks reset/unpublish/export flows | Med | Keep handlers/endpoints; tests per action; e2e smoke |
| Clients table and dashboard disagree on client set (legacy unregistered clients) | Med | Resolve in question round; spec it explicitly |
| `phd-pink` semantic overlap | Low | Default above; confirm in design |
| Existing tests broken by copy changes | Low | Preserve visible text/roles |

Risk level: **Low-Medium** (no new business logic, no API change).

## Rollback Plan

Revert the change commits. The change is UI-only, with no data, schema or API changes, so reverting restores the previous components exactly.

## Dependencies

- `GET /api/quality-pulse/admin/dashboard` (existing) and the `admin-dashboard` change being in place.

## Success Criteria

- [ ] Dashboard matches the mockup hierarchy, and all existing dashboard tests pass.
- [ ] Pending items show the score and the status of the 4 profiles.
- [ ] `/administracion/clientes` lists all clients in a searchable table with completion, score and state.
- [ ] Register/reset/unpublish/export behave as before.
- [ ] A 4/4-and-unpublished client can be published directly from the table, using the same publication endpoint as the Dashboard.
- [ ] Zero backend diffs.

## Proposal question round

Confirmed by user (2026-09-28):
1. **Table state labels**: Publicado / Pendiente de revisión (4/4, unpublished) / En progreso (<4/4). Confirmed as proposed.
2. **Row actions**: expandable detail below the selected row (same actions as today — reset per profile, reset-all, unpublish, export — moved into the table instead of a separate dropdown/card). Confirmed.
3. **Clients without submissions**: shown with "0/4" and "—" as the score. Confirmed.
4. **Legacy unregistered clients** (derived from submissions only, no formal registration in `qualityPulseClients`): shown in the table like any other client, marked **"No registrado"**. Confirmed — this required a dedicated follow-up question since the first round left it ambiguous.
5. **"Publicar" in the table**: user overrode the proposed default — the table DOES get its own "Publicar" action for 4/4-and-unpublished clients (in addition to the Dashboard's existing "Pendientes de Revisión" flow), both hitting the same `POST /api/quality-pulse/admin/publication` endpoint. Reflected above in Scope/Success Criteria.
