# Delta for qp-admin-clients-table

## MODIFIED Requirements

### Requirement: Row-Level Publish Action

For clients with completion `4/4`, `isPublished = false`, AND a formal registration record in `qualityPulseClients` (see "Clients Table Lists All Clients"), the row MUST expose a "Publicar" action that navigates to `/administracion/clientes/{clientKey}/revisar` — the same review route used by the Dashboard's "Pendientes de Revisión" flow. This action MUST NOT call `POST /api/quality-pulse/admin/publication` directly; that endpoint is invoked only from the review page's "Confirmar publicación" action. Legacy unregistered clients MUST NOT show "Publicar", even at 4/4, because `PublicationService.publish` rejects unregistered `clientKey`s with a 404 (`ClientNotFoundError`).

(Previously: "Publicar" called `POST /api/quality-pulse/admin/publication` directly on click.)

#### Scenario: Publicar is available for a 4/4 unpublished registered client

- GIVEN a registered client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views that client's row
- THEN a "Publicar" action is available

#### Scenario: Publicar navigates to the review page

- GIVEN a registered client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin triggers "Publicar" from the table row
- THEN the admin is navigated to `/administracion/clientes/{clientKey}/revisar`
- AND `POST /api/quality-pulse/admin/publication` is NOT called as part of that click

#### Scenario: Publicar is unavailable for a partial or already-published client

- GIVEN a client has fewer than 4/4 profiles answered, OR has `isPublished = true`
- WHEN the admin views that client's row
- THEN no "Publicar" action is shown

#### Scenario: Publicar is unavailable for a legacy unregistered client, even at 4/4

- GIVEN a client has submissions for all 4 profiles but no record in `qualityPulseClients` (marked "No registrado")
- WHEN the admin views that client's row
- THEN no "Publicar" action is shown, and the state column shows "Pendiente de revisión"
