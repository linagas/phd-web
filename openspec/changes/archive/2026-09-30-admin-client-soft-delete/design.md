# Design: Client Soft-Delete (RETROACTIVE)

> Written after the fact from the shipped code (`proposal.md` explains why). This describes what exists, not a plan for what to build.

## Architecture

Same layered pattern as the rest of the module:

```
ClientsTable "Eliminar" / AdminPanel "Restaurar"
        │
        ▼
DELETE /api/quality-pulse/admin/clients {clientKey}
POST   /api/quality-pulse/admin/clients/restore {clientKey}
GET    /api/quality-pulse/admin/clients/deleted
        │
        ▼
ClientController.remove / restore / listDeleted
  (local requireAdminSession — pre-existing duplicate, not shared guard)
        │
        ▼
ClientService.softDelete / restore / listDeleted
        │
        ▼
ClientRepository.softDelete / restore / findDeleted / findDeletedKeys
        │
        ▼
MongoDB `qualityPulseClients` — deletedAt/deletedBy fields, never a real delete
```

## Key decisions (as implemented)

- **Soft delete, never hard delete.** `deletedAt`/`deletedBy` fields; `findAll`/`findByKey` apply `NOT_DELETED_FILTER = { deletedAt: { $exists: false } }`. Nothing is ever removed from Mongo.
- **Submissions survive.** `AssessmentRepository` is untouched by this feature. Instead, `AssessmentService.getAllAssessments()` fetches `findDeletedKeys()` in parallel with `findAll()` and filters the result — a single exclusion point rather than repeating the filter in every consumer (`AdminPanel`, `ClientsTable`, `PublishReviewView` all go through this one method).
- **Delete forces unpublish.** `softDelete` sets `isPublished: false` and clears `publishedBy`/`publishedAt` in the same update — a deleted client can never appear as "published" to the public results gate.
- **Restore does not re-publish.** Intentionally conservative: restoring only clears the deletion marker, leaving the admin to explicitly re-publish if that's still correct.
- **`deletedAt: { $exists: true }` query** (not a boolean flag) mirrors the same existence-check style already used for `isPublished` fail-closed normalization elsewhere in this repository — consistent with the file's existing conventions.

## Testing

Full layer coverage already exists and passes (46/46 as of 2026-09-30):
- `tests/unit/repositories/quality-pulse/client-repository.test.ts` — `softDelete`/`restore`/query behavior
- `tests/unit/services/client-service.test.ts` — `softDelete`/`restore`/`listDeleted` + `ClientNotFoundError` paths
- `tests/unit/controllers/client-controller.test.ts` — `remove`/`restore`/`listDeleted` (auth, method, error mapping)
- `tests/unit/components/quality-pulse/admin-panel.test.tsx` — restore button wiring

## Known gaps (documented, not fixed here)

- `client-controller.ts`'s local `requireAdminSession` duplicates `src/utils/quality-pulse/require-admin-session.ts` — pre-existing drift risk, already flagged in `admin-dashboard`'s verify report, out of scope for this retroactive write-up.
- No dedicated e2e coverage for delete/restore (only unit/component level).
