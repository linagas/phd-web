# Spec: Admin Client Lifecycle (Soft Delete / Restore)

## Purpose

Allow an admin to soft-delete a registered client (hiding it from active lists without destroying its submission history) and restore it later, with a deleted-clients list to find candidates for restoration.

## Requirements

### Requirement: Soft Delete Hides Without Destroying

Soft-deleting a client MUST mark it as deleted (`deletedAt`, `deletedBy`), force `isPublished = false`, and clear publication audit fields, WITHOUT removing the client's submissions.

#### Scenario: Soft-deleted client disappears from active lists

- GIVEN an admin soft-deletes a registered client
- WHEN the admin views the Clientes table or the Dashboard
- THEN that client no longer appears in either

#### Scenario: Soft-deleted client's submissions are preserved but hidden from admin lists

- GIVEN a soft-deleted client has existing submissions
- WHEN the admin views the all-clients assessments list
- THEN those submissions are excluded from the list, but the underlying documents are not deleted from the database

#### Scenario: Soft-deleting an already-published client unpublishes it

- GIVEN a client is currently published
- WHEN the admin soft-deletes it
- THEN `isPublished` becomes `false` and `publishedBy`/`publishedAt` are cleared

### Requirement: Restore Reverses Soft Delete

Restoring a soft-deleted client MUST clear its `deletedAt`/`deletedBy` fields, making it visible again in active lists. Restoring MUST NOT re-publish the client.

#### Scenario: Restored client reappears in Clientes and Dashboard

- GIVEN a client was soft-deleted
- WHEN the admin restores it
- THEN it appears again in the Clientes table and Dashboard, with `isPublished = false`

#### Scenario: Restoring a client that is not deleted fails

- GIVEN a `clientKey` that is not currently soft-deleted (active or unknown)
- WHEN the admin attempts to restore it
- THEN the system returns a not-found error, no state changes

### Requirement: Deleted Clients List

The system MUST expose a list of currently soft-deleted clients so an admin can find candidates to restore.

#### Scenario: Deleted client appears in the deleted-clients list

- GIVEN a client is currently soft-deleted
- WHEN the admin requests the deleted-clients list
- THEN that client appears in it

#### Scenario: Restored client no longer appears in the deleted-clients list

- GIVEN a client was soft-deleted and then restored
- WHEN the admin requests the deleted-clients list
- THEN that client does not appear in it

### Requirement: Admin Session Required

Every soft-delete, restore, and deleted-clients-list operation MUST require a valid admin session, following the same guard pattern as every other admin action in this module.

#### Scenario: Unauthenticated delete/restore/list-deleted request is rejected

- GIVEN a request to soft-delete, restore, or list deleted clients has no valid `qp_admin_session` cookie
- WHEN the request reaches the corresponding endpoint
- THEN it is rejected with 401, no state change
