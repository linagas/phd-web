# Proposal: Admin Publish Review Step

## Intent

"Revisar y publicar" (Dashboard) and "Publicar" (Clientes) publish immediately. The admin never sees the client's actual results before they go live. We need a real review step: the admin sees the same detail the client will see, then explicitly confirms.

## Scope

### In Scope
- New guarded page `/administracion/clientes/[clientKey]/revisar` that renders the client-facing results layout (health score, perspective radar, dimensions grid, benchmark, gaps, impact ranking) with a "Confirmar publicación" CTA instead of "Volver".
- Extract the presentational pieces of `results-view.tsx` into a shared component used by both pages.
- Both entry points navigate to the review page. `POST /api/quality-pulse/admin/publication` fires ONLY from "Confirmar publicación".
- Data: existing admin-gated `GET /api/quality-pulse/assessments` (no `organization`) + catalog, filtered client-side by `clientKey`, scored by `calculateResults`.

### Out of Scope
- Any new or changed backend endpoint, model, or persisted "reviewed" state.
- Roles or approval workflows (any authenticated admin may confirm; `publishedBy`/`publishedAt` remain the audit trail).
- Review for unpublish/reset flows.
- Unifying `hasAdminSession` with `requireAdminSession` (pre-existing).

## Capabilities

### New Capabilities
- `qp-admin-publish-review`: review page, data sourcing, confirm-to-publish, post-confirm behavior.

### Modified Capabilities
- `qp-admin-dashboard`: "Revisar y publicar" navigates to review instead of publishing.
- `qp-admin-clients-table`: "Publicar" navigates to review instead of calling the endpoint.

## Approach

Dedicated page (user-confirmed; modal rejected for dense content). Client component fetches all submissions + catalog, filters by `clientKey`, calls `calculateResults`, renders shared results panel.

Considered, not chosen: scoped `AssessmentService.getAssessmentsForClient(clientKey)` endpoint (smaller payload, cleaner SRP). Zero backend change outweighs payload optimization now; admins already receive the full dataset in Clientes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/administracion/(console)/clientes/[clientKey]/revisar/` | New | review page |
| `src/app/quality-pulse/resultados/components/results-view.tsx` | Modified | extract shared panel |
| `src/app/administracion/(console)/components/pending-review-list.tsx` | Modified | navigate, not publish |
| `src/app/quality-pulse/components/clients-table.tsx`, `admin-panel.tsx` | Modified | navigate, not publish |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Client page regresses during extraction | Med | Keep results-view tests green; pure move |
| Client stops being 4/4 while page is open | Low | Server eligibility gate already rejects; surface error |
| Unknown/unregistered `clientKey` in URL | Med | Not-found/empty state, no CTA |
| Full-dataset payload grows with clients | Low | Scoped endpoint is the documented follow-up |

## Rollback Plan

Frontend-only. Revert the commits; entry points return to direct publish. No data or backend changes to undo.

## Success Criteria

- [ ] Neither entry point calls the publication endpoint on click.
- [ ] Review page matches `/quality-pulse/resultados` output for the same client.
- [ ] Confirm publishes; page unreachable without admin session.
- [ ] Client results page visually unchanged.
- [ ] "Volver" returns to `/administracion/clientes`; confirming publication keeps the admin on the page showing "Publicado".
- [ ] Direct URL access to a client that is not currently eligible (already published, or <4/4) shows a blocking error, not the results detail or confirm action.

## Proposal question round

Confirmed by user (2026-09-30):
1. **4/4 drops during review**: rely on the server's existing Publish Eligibility Gate rejection; the page surfaces that error, no proactive re-check on mount/before enabling the CTA.
2. **"Volver" button**: yes, fixed destination — always returns to `/administracion/clientes`, regardless of which entry point (Dashboard or Clientes) the admin navigated from. No origin-tracking needed.
3. **After confirming publication**: the page stays in place showing a "Publicado" confirmation state — no automatic redirect.
4. **Direct URL to an already-published or non-4/4 client**: BLOCK access with an error message (not the recommended read-only view). The review page is only reachable for clients that are currently eligible (4/4, unpublished); any other state shows an error, no results detail, and no confirm action.
