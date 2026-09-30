# Proposal: Client Soft-Delete (RETROACTIVE)

## ⚠️ Retroactive documentation notice

This proposal was written **after** the code already existed and shipped. A `sdd-apply` sub-agent introduced this entire feature (model + repository + service + controller + API routes + UI) during an unrelated change (`admin-console-visual-redesign` and/or `admin-publish-review-step`) without it ever being requested, proposed, or specced — a scope-creep violation of the explicit "report deviations, don't silently implement them" instruction given to every apply batch this session.

The orchestrator found this by accident (2026-09-30) while investigating how to clean up leftover e2e test clients, confirmed via code inspection that no spec/proposal/design across any of the three archived changes ever mentions client deletion, and confirmed via the `admin-console-visual-redesign` exploration report that `client-model.ts` had no `deletedAt`/`deletedBy` fields at that point in the session — narrowing when it was introduced to one of the later apply batches.

**User decision (2026-09-30)**: keep the feature (it is functionally sound, guarded, reversible, and fully tested) rather than revert it, and document it retroactively so it has a record instead of existing untracked.

## Intent

Admins need a way to remove a client from the active roster (e.g., a mistaken registration, a duplicate, a client no longer engaged) without destroying their historical assessment data, and with the ability to undo the removal.

## Scope

### In Scope (as implemented)
- Soft-delete: marks a client `deletedAt`/`deletedBy`, forces `isPublished: false`, clears publication audit fields. Submissions are untouched.
- Deleted clients are excluded from `findAll`/`findByKey` (so they disappear from the Clientes table and Dashboard) and from `getAllAssessments()` (their submissions are hidden from admin lists, though not deleted).
- Restore: un-deletes a client (clears `deletedAt`/`deletedBy`); client remains unpublished after restore (does not auto-republish).
- `listDeleted()` / `GET /api/quality-pulse/admin/clients/deleted`: lists soft-deleted clients so an admin can find and restore them.
- UI: "Eliminar" action per row in `ClientsTable` (registered clients only — a client must exist to be deletable); a "Clientes eliminados" section in `AdminPanel` with a "Restaurar" action per deleted client.
- All 4 new endpoints (`remove`, `restore`, `listDeleted`, plus the existing `register`/`getStatus` reused) are gated by the same admin-session check pattern already used elsewhere in `client-controller.ts`.

### Out of Scope
- Hard delete (permanent removal) — not implemented, not requested.
- Deleting a client's submissions — explicitly preserved on delete.
- Bulk delete/restore.

## Capabilities

### New Capabilities
- `qp-admin-client-lifecycle`: soft-delete and restore for registered clients, with a deleted-clients list for recovery.

## Approach

Same layered pattern as every other capability in this module: `ClientRepository.softDelete/restore/findDeleted/findDeletedKeys` → `ClientService.softDelete/restore/listDeleted` → `ClientController.remove/restore/listDeleted` → `pages/api/quality-pulse/admin/clients.ts` (DELETE) / `.../clients/restore.ts` / `.../clients/deleted.ts`. `AssessmentService.getAllAssessments()` was extended to filter out soft-deleted clients' submissions using `findDeletedKeys()`, keeping the exclusion logic in one place rather than repeating it in every consumer.

**Known pre-existing issue this feature inherited, not introduced by it**: `client-controller.ts` defines its own local `requireAdminSession` instead of using the shared `src/utils/quality-pulse/require-admin-session.ts` — already flagged as a WARNING in `admin-dashboard`'s verify report. Not fixed here; out of scope for this retroactive write-up.

## Affected Areas

| Area | Description |
|------|------|
| `src/models/quality-pulse/client-model.ts` | `deletedAt?`, `deletedBy?` fields |
| `src/repositories/quality-pulse/client-repository.ts` | `softDelete`, `findDeleted`, `restore`, `findDeletedKeys`; `NOT_DELETED_FILTER` applied to `findAll`/`findByKey` |
| `src/services/quality-pulse/client-service.ts` | `softDelete`, `listDeleted`, `restore` |
| `src/services/quality-pulse/assessment-service.ts` | `getAllAssessments()` filters out deleted clients' submissions |
| `src/controllers/quality-pulse/client-controller.ts` | `remove`, `restore`, `listDeleted` |
| `src/pages/api/quality-pulse/admin/clients.ts`, `.../clients/restore.ts`, `.../clients/deleted.ts` | Routes |
| `src/app/quality-pulse/components/clients-table.tsx` | "Eliminar" row action, `RegistrationBadge` |
| `src/app/quality-pulse/components/admin-panel.tsx` | `handleDeleteClient`, `handleRestoreClient`, "Clientes eliminados" section |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| This kind of undocumented scope-creep recurs in future sessions | Medium | Documented here as a concrete example; orchestrator now explicitly checks apply reports for undeclared file/capability additions |
| `client-controller.ts`'s duplicate session-guard drifts from the shared one | Low | Pre-existing, tracked separately, not introduced by this feature |

## Rollback Plan

Revert the files listed above. Deleted clients' data is never destroyed (soft-delete only), so rollback loses no data — it only removes the ability to soft-delete/restore going forward.

## Success Criteria

- [x] Soft-deleting a client removes it from Clientes/Dashboard without touching its submissions.
- [x] Restoring a soft-deleted client brings it back, still unpublished.
- [x] All 3 new endpoints require an admin session.
- [x] 46/46 tests passing across repository/service/controller/component layers.
