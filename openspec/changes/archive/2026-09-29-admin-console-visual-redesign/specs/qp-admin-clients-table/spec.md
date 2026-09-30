# qp-admin-clients-table Specification

## Purpose

Replace the single-client `<select>` dropdown on `/administracion/clientes` with a searchable table listing every Quality Pulse client (registered and legacy/unregistered), showing completion, global score, and publication state, with row-level access to the existing client actions and a new row-level "Publicar" entry point. Consumes only existing endpoints already used by `AdminPanel` (`GET /api/quality-pulse/{clients,assessments,catalog}`) — NOT `GET /api/quality-pulse/admin/dashboard`, whose payload excludes legacy unregistered clients (design.md Q1). Completion and score are derived client-side with the same pure scoring functions the backend uses, so results match. Publishing uses the existing `POST /api/quality-pulse/admin/publication`. No backend change.

## Requirements

### Requirement: Clients Table Lists All Clients

The table MUST list every client known to the system: clients formally registered in `qualityPulseClients` AND legacy clients derived only from submissions with no formal registration record. Legacy unregistered clients MUST be shown alongside registered clients, marked "No registrado".

#### Scenario: Registered client appears in the table

- GIVEN a client exists in `qualityPulseClients`
- WHEN the admin opens `/administracion/clientes`
- THEN that client appears as a row in the table

#### Scenario: Legacy unregistered client appears marked

- GIVEN a client has submissions but no record in `qualityPulseClients`
- WHEN the admin opens `/administracion/clientes`
- THEN that client appears as a row in the table labeled "No registrado"

### Requirement: Clients Table Columns

Each row MUST show: client name, completion as `n/4` (count of answered profiles out of the 4 profiles), global Quality Health Score, and publication state.

#### Scenario: Row shows completion and score for a partially answered client

- GIVEN a client has answered 2 of 4 profiles
- WHEN the admin views that client's row
- THEN the row shows "2/4" completion and the client's current global score

#### Scenario: Row shows dash score for a client with zero submissions

- GIVEN a client has no answered profiles
- WHEN the admin views that client's row
- THEN the row shows "0/4" completion and "—" as the score

### Requirement: Clients Table Publication State Labels

The row's publication state MUST be exactly one of: "Publicado" (client is published), "Pendiente de revisión" (4/4 profiles answered, not published), or "En progreso" (fewer than 4/4 profiles answered).

#### Scenario: Published client shows Publicado

- GIVEN a client has `isPublished = true`
- WHEN the admin views that client's row
- THEN the state column shows "Publicado"

#### Scenario: 4/4-and-unpublished client shows Pendiente de revisión

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views that client's row
- THEN the state column shows "Pendiente de revisión"

#### Scenario: Partial client shows En progreso

- GIVEN a client has fewer than 4 of 4 profiles answered
- WHEN the admin views that client's row
- THEN the state column shows "En progreso"

### Requirement: Clients Table Search

The table MUST support text search over client name, filtering visible rows to matches only.

#### Scenario: Search filters rows by name

- GIVEN the table lists multiple clients
- WHEN the admin types a text query matching one client's name
- THEN only rows whose name matches the query remain visible

#### Scenario: Empty search shows all clients

- GIVEN the admin has not entered a search query
- WHEN the admin views the table
- THEN all clients are listed

### Requirement: Row-Level Expandable Actions

Selecting a row MUST expand a detail panel below that row exposing the existing client actions — per-profile reset, reset-all, unpublish, and Excel export — using the same endpoints and confirmations as the previous `AdminPanel` component. No action endpoint or contract changes.

#### Scenario: Expanding a row reveals existing actions

- GIVEN the admin selects a client row
- WHEN the row expands
- THEN the detail panel shows per-profile reset, reset-all, unpublish, and export actions for that client

#### Scenario: Reset action calls the existing endpoint

- GIVEN the admin expands a client row and triggers a per-profile reset
- WHEN the action is confirmed
- THEN it calls the same endpoint used by the previous `AdminPanel` reset action, with the same outcome

### Requirement: Row-Level Publish Action

For clients with completion `4/4`, `isPublished = false`, AND a formal registration record in `qualityPulseClients` (see "Clients Table Lists All Clients"), the row MUST expose a "Publicar" action that calls the existing `POST /api/quality-pulse/admin/publication` endpoint — the same endpoint already used by the Dashboard's "Pendientes de Revisión" flow. This is a new UI entry point only; it is not a new endpoint. Legacy unregistered clients MUST NOT show "Publicar", even at 4/4, because `PublicationService.publish` rejects unregistered `clientKey`s with a 404 (`ClientNotFoundError`).

#### Scenario: Publicar is available for a 4/4 unpublished registered client

- GIVEN a registered client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views that client's row
- THEN a "Publicar" action is available

#### Scenario: Publicar calls the existing publication endpoint

- GIVEN a registered client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin triggers "Publicar" from the table row
- THEN the system calls `POST /api/quality-pulse/admin/publication` for that client, the same endpoint invoked from the Dashboard's "Revisar y publicar" action

#### Scenario: Publicar is unavailable for a partial or already-published client

- GIVEN a client has fewer than 4/4 profiles answered, OR has `isPublished = true`
- WHEN the admin views that client's row
- THEN no "Publicar" action is shown

#### Scenario: Publicar is unavailable for a legacy unregistered client, even at 4/4

- GIVEN a client has submissions for all 4 profiles but no record in `qualityPulseClients` (marked "No registrado")
- WHEN the admin views that client's row
- THEN no "Publicar" action is shown, and the state column shows "Pendiente de revisión"
