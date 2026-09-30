# Tasks: Client Soft-Delete (RETROACTIVE)

> All tasks below describe code that already existed when this file was written (2026-09-30). Marked `[x]` because implemented and tested, not because they were executed as planned tasks.

## Phase 1: Model + Repository

- [x] 1.1 `deletedAt?`/`deletedBy?` on `QualityPulseClient`
- [x] 1.2 `NOT_DELETED_FILTER` applied to `findAll`/`findByKey`
- [x] 1.3 `ClientRepository.softDelete/restore/findDeleted/findDeletedKeys`

## Phase 2: Service + Controller + Routes

- [x] 2.1 `ClientService.softDelete/restore/listDeleted`
- [x] 2.2 `ClientController.remove/restore/listDeleted`, admin-session guarded
- [x] 2.3 `pages/api/quality-pulse/admin/clients.ts` (DELETE), `.../clients/restore.ts`, `.../clients/deleted.ts`
- [x] 2.4 `AssessmentService.getAllAssessments()` filters out deleted clients' submissions via `findDeletedKeys()`

## Phase 3: UI

- [x] 3.1 "Eliminar" action per registered row in `ClientsTable`
- [x] 3.2 "Clientes eliminados" section + "Restaurar" action in `AdminPanel`

## Phase 4: Verification (retroactive)

- [x] 4.1 Confirmed 46/46 tests passing across repository/service/controller/component layers (2026-09-30)
- [x] 4.2 Confirmed no spec/proposal/design across `admin-dashboard`, `admin-console-visual-redesign`, or `admin-publish-review-step` ever requested this feature
- [x] 4.3 Confirmed soft-delete is non-destructive (submissions preserved) and every new endpoint requires an admin session
