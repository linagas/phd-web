# Proposal: Quality Pulse Admin Dashboard + Results Publication Workflow

## Intent

`/administracion` is a single flat page (client CRUD + catalog) with no KPIs, no scores, and no control over what clients see. Results go live at `/quality-pulse/resultados` the moment a client completes 4/4 profiles, with no PHD review. We need an executive admin console (sidebar, sub-routes, KPIs, Quality Health Score) and an approval gate so results are only visible after an admin publishes them.

## Scope

### In Scope
- Shared `src/app/administracion/layout.tsx` with centralized session guard (`qp_admin_session`) + sidebar (phd-dark system, Inter).
- Sub-routes: `/administracion` (Dashboard), `/administracion/clientes`, `/administracion/catalogo` — split from `AdminPanel` / `CatalogManager`, keeping existing behavior (register, reset, Excel export, catalog import).
- Dashboard: KPIs (registered clients, submissions vs `clients*4`, completion %, clients pending review), global and per-client **Quality Health Score** (existing `healthScore`), per-profile score (new derivation), "Pendientes de Revisión" list with "Revisar y publicar".
- Publication state per client (`isPublished`, `publishedBy`, `publishedAt`; plus unpublish).
- Server-side gate: public results data is not served until published; `/quality-pulse/resultados` shows a "results under review" state.
- Profile labels: Calidad / Desarrollo / Gestión / Negocio (short forms allowed, never QA/DEV/MGT/BIZ).

### Out of Scope
- Resultados (admin), Auditoría, Soporte: sidebar placeholders "Próximamente" (same pattern as `NAV_ITEMS_PENDING` in `QpHeader`), no functionality. **Explicit scope decision for user review.**
- Activity timeline / audit log, system-health widget, period selector / quarter comparison (blocked by unique `(clientKey, profile)` index), roles ("Super Admin").
- "AQI" naming (collides with `aqi-tool.tsx`).

## Capabilities

### New Capabilities
- `qp-admin-console`: guarded layout, sidebar navigation, sub-routes, placeholders.
- `qp-admin-dashboard`: KPIs, Quality Health Score aggregation, per-profile scores, pending-review list.
- `qp-results-publication`: publish/unpublish lifecycle and public-results gate.

### Modified Capabilities
- None (no existing specs in `openspec/specs/`).

## Approach

Approach 1 from exploration. Publication state lives on `qualityPulseClients` (one decision per client, not per profile row) via Model → Repository → Service → admin Controller (`/api/quality-pulse/admin/*`). Public `GET /api/quality-pulse/assessments` is split: answered-profile status stays public (questionnaire needs it); answers/results only when published. Scoring additions are pure functions in `scoring.ts`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/administracion/` | Modified/New | layout, dashboard, clientes, catalogo routes |
| `src/app/quality-pulse/components/admin-panel.tsx`, `catalog-manager.tsx` | Modified | split into route-level pieces |
| `src/utils/quality-pulse/scoring.ts` | Modified | per-profile + multi-client aggregation |
| `src/{models,repositories,services,controllers}/quality-pulse/client-*` | Modified | publication fields + publish/unpublish |
| `src/controllers/quality-pulse/assessment-controller.ts` | Modified | gate answers behind publication |
| `src/app/quality-pulse/resultados/` | Modified | "under review" state |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Gate only in UI leaks answers (today `resultados` computes from public endpoint) | High | Enforce in controller/service; tests |
| Existing clients with completed results become hidden temporarily on deploy | High | Accepted: all clients (including already-complete ones) start unpublished; admin must review/publish each — see decisions below |
| Sub-route left unguarded | Med | Guard in layout + per API route |
| Reset after publish shows stale/partial results | Med | Reset auto-unpublishes |
| PR size > 800 lines | High | Chain: console/routes → dashboard → publication |

## Rollback Plan

Revert commits per slice. Publication fields are additive; if reverted, gate code disappears and results return to live behavior. No destructive migration.

## Dependencies

- Existing `jose` session utils, `xlsx`, MongoDB cached client.

## Success Criteria

- [ ] All `/administracion/*` routes redirect to login without session.
- [ ] Unpublished client: public endpoint returns no answers; `resultados` shows review state.
- [ ] Admin publishes → client sees results; unpublish hides again.
- [ ] Dashboard KPIs and Quality Health Score match `calculateResults` output.

## Proposal question round

Confirmed by user (2026-09-27):
1. **Migration**: no grandfathering. Every client — including those already 4/4 with live results today — starts `isPublished: false` on deploy. Nothing is auto-published; PHD reviews and publishes each one manually via "Pendientes de Revisión". This means the migration itself temporarily hides results that clients could see before the deploy, until an admin re-publishes them; `sdd-tasks` must include a step to communicate this to PHD/ops before shipping so reviews happen promptly.
2. Must a client be 4/4 to be publishable? Confirmed: yes.
3. Unpublish allowed? Confirmed: yes. Reset of any profile auto-unpublishes.
4. Should the client be notified (email) on publish? Confirmed: no automated email in this change. PHD tells the client out-of-band (manually) that results are ready; the product has no in-app/email notification feature to build here.
5. "Pending review" = 4/4 and unpublished. Partial clients shown only in KPIs.
