# Delta for Quality Pulse Admin Dashboard

## MODIFIED Requirements

### Requirement: Pending-Review List

The Dashboard MUST list under "Pendientes de Revisión" only clients with all 4 profiles answered (4/4) that are NOT currently published, each with a "Revisar y publicar" action. Clients with partial completion (< 4/4) MUST appear only in KPIs, never in this list. Each item in the list MUST also show that client's global Quality Health Score and the per-profile status (Calidad, Desarrollo, Gestión, Negocio: answered or pending) alongside the client name, sourced from the same `summary.clients` data already returned by `GET /api/quality-pulse/admin/dashboard` — joined by `clientKey`, with no API change. The "Revisar y publicar" action MUST navigate to `/administracion/clientes/{clientKey}/revisar` and MUST NOT call the publication endpoint directly.

(Previously: "Revisar y publicar" called `POST /api/quality-pulse/admin/publication` directly on click.)

#### Scenario: 4/4 unpublished client appears in the list

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views "Pendientes de Revisión"
- THEN that client appears with a "Revisar y publicar" action

#### Scenario: Partial client is excluded from the list

- GIVEN a client has 2/4 profiles answered
- WHEN the admin views "Pendientes de Revisión"
- THEN that client does NOT appear in the list, and is counted only in the KPIs

#### Scenario: Already-published 4/4 client is excluded from the list

- GIVEN a client has 4/4 profiles answered and `isPublished = true`
- WHEN the admin views "Pendientes de Revisión"
- THEN that client does NOT appear in the list

#### Scenario: List item shows the global score

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views that client's entry in "Pendientes de Revisión"
- THEN the entry MUST display that client's global Quality Health Score matching `summary.clients` for the same `clientKey`

#### Scenario: List item shows per-profile status

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views that client's entry in "Pendientes de Revisión"
- THEN the entry MUST show all 4 profiles (Calidad, Desarrollo, Gestión, Negocio) each labeled as answered, matching that client's `profileScores` in `summary.clients`

#### Scenario: Revisar y publicar navigates instead of publishing

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin clicks "Revisar y publicar" for that client
- THEN the admin is navigated to `/administracion/clientes/{clientKey}/revisar`
- AND `POST /api/quality-pulse/admin/publication` is NOT called as part of that click
